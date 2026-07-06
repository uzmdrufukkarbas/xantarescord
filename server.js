
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// .env dosyasındaki değişkenleri yükle
require('dotenv').config();

const app = express();
app.use(cors());

// Statik dosyaları (React build) sun
app.use(express.static(path.join(__dirname, 'dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// --- MONGODB BAĞLANTI AYARI ---
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("HATA: .env dosyasında MONGO_URI tanımlanmamış!");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Atlas bağlantısı başarıyla kuruldu.'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// --- MONGODB ŞEMALARI (VERİ MODELLERİ) ---

// Kullanıcı Şeması
const UserSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  username: { type: String, unique: true },
  password: { type: String },
  avatar: { type: String },
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false }
});
const User = mongoose.model('User', UserSchema);

// Mesaj Şeması
const MessageSchema = new mongoose.Schema({
  channelId: { type: String },
  id: { type: String },
  text: { type: String },
  sender: { type: Object }, // Gönderen kullanıcı objesi veya ismi
  timestamp: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false }
});
const Message = mongoose.model('Message', MessageSchema);

// Veritabanı dosyalarının varlığını kontrol et, yoksa oluştur
if (!fs.existsSync(MESSAGES_DB_PATH)) fs.writeFileSync(MESSAGES_DB_PATH, '{}');
if (!fs.existsSync(USERS_DB_PATH)) fs.writeFileSync(USERS_DB_PATH, '[]');

// --- Yardımcı Fonksiyonlar (MongoDB Sürümü) ---

async function loadMessages() {
    try {
        // Tüm kanallardaki mesajları getirir. 
        // JSON yapına sadık kalmak için kanalId bazlı bir obje döndürüyoruz.
        const messages = await Message.find({});
        const db = {};
        messages.forEach(msg => {
            if (!db[msg.channelId]) db[msg.channelId] = [];
            db[msg.channelId].push(msg);
        });
        return db;
    } catch (e) { 
        console.error("Mesaj yükleme hatası:", e);
        return {}; 
    }
}

async function saveMessage(channelId, messageData) {
    try {
        const newMessage = new Message({
            channelId: channelId,
            id: messageData.id,
            text: messageData.text,
            sender: messageData.sender // Mesajı gönderen obje veya isim
        });
        await newMessage.save();
        // Mesaj sınırı (slice-500) tamamen kaldırıldı, doğrudan DB'ye ekleniyor.
    } catch (e) {
        console.error("Mesaj kaydetme hatası:", e);
    }
}

async function updateMessageAsDeleted(channelId, messageId) {
    try {
        // Mesajı bulup içeriğini siliyoruz ve silindi olarak işaretliyoruz
        const updatedMessage = await Message.findOneAndUpdate(
            { channelId: channelId, id: messageId },
            { 
                isDeleted: true, 
                text: "Bu mesaj silindi." 
            },
            { new: true } // Güncellenmiş yeni veriyi dönmesi için
        );
        return updatedMessage;
    } catch (e) {
        console.error("Mesaj güncelleme hatası:", e);
    }
    return null;
}

async function loadUsers() {
    try { 
        return await User.find({}); 
    } catch (e) { 
        return []; 
    }
}

async function saveUser(userData) {
    try {
        const newUser = new User(userData);
        await newUser.save();
    } catch (e) {
        console.error("Kullanıcı kaydetme hatası:", e);
    }
}

async function updateUserAvatar(userId, newAvatar) {
    try {
        await User.findOneAndUpdate({ id: userId }, { avatar: newAvatar });
    } catch (e) {
        console.error("Kullanıcı avatar güncelleme hatası:", e);
    }
}

async function banUserInDb(userId) {
    try {
        const updated = await User.findOneAndUpdate({ id: userId }, { isBanned: true });
        return !!updated;
    } catch (e) {
        console.error("Banlama hatası:", e);
    }
    return false;
}

async function findUser(username) {
    // Büyük/küçük harf duyarsız (case-insensitive) arama yapar
    return await User.findOne({ username: new RegExp('^' + username + '$', 'i') });
}

// Aktif soket kullanıcıları (Ram'de tutulur)
let connectedUsers = []; // Array of VoiceUser objects

io.on('connection', (socket) => {
  console.log('Soket bağlandı:', socket.id);
  let currentUser = null;

  // Bağlanınca sohbet geçmişini gönder
  socket.emit('chat-history', loadMessages());

  // --- AUTH İŞLEMLERİ ---

  socket.on('auth-register', ({ username, password }) => {
      const cleanUsername = username ? username.trim() : "";
      const cleanPassword = password ? password.trim() : "";

      if (!cleanUsername || !cleanPassword) {
          socket.emit('auth-error', 'Kullanıcı adı ve şifre zorunludur.');
          return;
      }

      const existing = findUser(cleanUsername);
      if (existing) {
          socket.emit('auth-error', 'Bu kullanıcı adı zaten alınmış.');
      } else {
          const allUsers = loadUsers();
          const isAdmin = allUsers.length === 0;
          const defaultAvatar = "https://placehold.co/100x100?text=" + cleanUsername.charAt(0).toUpperCase();
          
          const newUser = {
              id: 'user-' + Date.now(),
              username: cleanUsername,
              password: cleanPassword, 
              avatar: defaultAvatar,
              isAdmin: isAdmin,
              isBanned: false
          };
          saveUser(newUser);
          socket.emit('auth-success', { 
              id: newUser.id, 
              name: newUser.username, 
              avatar: newUser.avatar,
              isAdmin: newUser.isAdmin
          });
      }
  });

  socket.on('auth-login', ({ username, password }) => {
      const cleanUsername = username ? username.trim() : "";
      const cleanPassword = password ? password.trim() : "";

      const user = findUser(cleanUsername);
      
      if (user) {
          if (user.password === cleanPassword) {
              if (user.isBanned) {
                  socket.emit('auth-error', 'Bu sunucudan banlandınız.');
                  return;
              }
              socket.emit('auth-success', { 
                  id: user.id, 
                  name: user.username, 
                  avatar: user.avatar,
                  isAdmin: !!user.isAdmin
              });
          } else {
              socket.emit('auth-error', 'Şifre hatalı.');
          }
      } else {
          socket.emit('auth-error', 'Kullanıcı bulunamadı. Lütfen kayıt olun.');
      }
  });

  // --- UYGULAMA İŞLEMLERİ ---

  socket.on('join-server', (userData) => {
      currentUser = {
          ...userData,
          socketId: socket.id,
          voiceChannelId: null,
          isMuted: false,
          isDeafened: false,
          isStreaming: false
      };
      // Varsa eski oturumu temizle
      connectedUsers = connectedUsers.filter(u => u.id !== currentUser.id);
      connectedUsers.push(currentUser);
      io.emit('user-update', connectedUsers);
  });

  socket.on('join-voice-channel', ({ channelId }) => {
      if (!currentUser) return;
      currentUser.voiceChannelId = channelId;
      io.emit('user-update', connectedUsers);
  });

  socket.on('leave-voice-channel', () => {
      if (!currentUser) return;
      currentUser.voiceChannelId = null;
      currentUser.isStreaming = false;
      io.emit('user-update', connectedUsers);
  });

  socket.on('update-status', (status) => {
      if (!currentUser) return;
      Object.assign(currentUser, status);
      io.emit('user-update', connectedUsers);
  });

  socket.on('send-message', ({ channelId, message }) => {
      saveMessage(channelId, message);
      io.emit('new-message', { channelId, message });
  });

  socket.on('delete-message', ({ channelId, messageId }) => {
      const updated = updateMessageAsDeleted(channelId, messageId);
      if (updated) {
          io.emit('message-deleted', { channelId, messageId, updatedMessage: updated });
      }
  });

  socket.on('update-profile', ({ avatar }) => {
      if (!currentUser) return;
      currentUser.avatar = avatar;
      updateUserAvatar(currentUser.id, avatar);
      io.emit('user-update', connectedUsers);
  });

  // WebRTC Sinyalleşme (P2P bağlantı için sunucu üzerinden mesajlaşma)
  socket.on('signal', ({ target, signal }) => {
      io.to(target).emit('signal', { sender: socket.id, signal });
  });

  socket.on('admin-ban-user', ({ targetUserId }) => {
      if (!currentUser || !currentUser.isAdmin) return;
      if (banUserInDb(targetUserId)) {
          // Banlanan kullanıcıyı bul ve at
          const targetSocketUser = connectedUsers.find(u => u.id === targetUserId);
          if (targetSocketUser) {
              io.to(targetSocketUser.socketId).emit('auth-error', 'Banlandınız.');
              const targetSocket = io.sockets.sockets.get(targetSocketUser.socketId);
              if (targetSocket) targetSocket.disconnect();
          }
      }
  });

  socket.on('disconnect', () => {
      connectedUsers = connectedUsers.filter(u => u.socketId !== socket.id);
      io.emit('user-update', connectedUsers);
  });
});

// React Router için tüm istekleri index.html'e yönlendir
app.get('*', (req, res) => {
    const indexFile = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
    } else {
        res.send('API Server is running. Frontend build not found (dist/).');
    }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
