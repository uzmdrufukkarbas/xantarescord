
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

// Statik dosyaları (React build) sun
app.use(express.static(path.join(__dirname, 'dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Güvenlik için prodüksiyonda spesifik domain verilebilir
    methods: ["GET", "POST"]
  }
});

const MESSAGES_DB_PATH = path.join(__dirname, 'messages.json');
const USERS_DB_PATH = path.join(__dirname, 'users.json');

// Veritabanı dosyalarının varlığını kontrol et, yoksa oluştur
if (!fs.existsSync(MESSAGES_DB_PATH)) fs.writeFileSync(MESSAGES_DB_PATH, '{}');
if (!fs.existsSync(USERS_DB_PATH)) fs.writeFileSync(USERS_DB_PATH, '[]');

// --- Yardımcı Fonksiyonlar ---
function loadMessages() {
    try { 
        const data = fs.readFileSync(MESSAGES_DB_PATH, 'utf8');
        return data.length > 0 ? JSON.parse(data) : {};
    } catch (e) { return {}; }
}

function saveMessage(channelId, message) {
    try {
        const db = loadMessages();
        if (!db[channelId]) db[channelId] = [];
        db[channelId].push(message);
        // Limit 500 mesaja çıkarıldı
        if (db[channelId].length > 500) db[channelId] = db[channelId].slice(-500);
        fs.writeFileSync(MESSAGES_DB_PATH, JSON.stringify(db, null, 2));
    } catch (e) {
        console.error("Mesaj kaydetme hatası:", e);
    }
}

function updateMessageAsDeleted(channelId, messageId) {
    try {
        const db = loadMessages();
        if (db[channelId]) {
            const msgIndex = db[channelId].findIndex(m => m.id === messageId);
            if (msgIndex !== -1) {
                db[channelId][msgIndex].isDeleted = true;
                db[channelId][msgIndex].text = "Bu mesaj silindi.";
                db[channelId][msgIndex].replyTo = undefined;
                fs.writeFileSync(MESSAGES_DB_PATH, JSON.stringify(db, null, 2));
                return db[channelId][msgIndex];
            }
        }
    } catch (e) {
        console.error("Mesaj güncelleme hatası:", e);
    }
    return null;
}

function loadUsers() {
    try { return JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf8')); } catch (e) { return []; }
}

function saveUser(user) {
    try {
        const users = loadUsers();
        users.push(user);
        fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
    } catch (e) {
        console.error("Kullanıcı kaydetme hatası:", e);
    }
}

function updateUserAvatar(userId, newAvatar) {
    try {
        const users = loadUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index].avatar = newAvatar;
            fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
        }
    } catch (e) {
        console.error("Kullanıcı güncelleme hatası:", e);
    }
}

function banUserInDb(userId) {
    try {
        const users = loadUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index].isBanned = true;
            fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
            return true;
        }
    } catch (e) {
        console.error("Banlama hatası:", e);
    }
    return false;
}

function findUser(username) {
    const users = loadUsers();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase());
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
