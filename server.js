
// --- HATA YAKALAMA (DEBUG) ---
process.on('uncaughtException', (err) => {
    console.error('KRITIK HATA (Uncaught Exception):', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('YAKALANAMAYAN PROMISE HATASI:', reason);
});

console.log("Sunucu scripti başlatılıyor...");

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

// Render.com health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Ana sayfa için bilgilendirme mesajı
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1 style="color: #5865F2;">Damar Odası Sunucusu Aktif! 🚀</h1>
            <p>Bu sunucu şu anda çalışıyor.</p>
            <p>Uygulamanızdaki <b>"Sunucu Değiştir"</b> ekranına gidip bu sayfanın linkini yapıştırın.</p>
        </div>
    `);
});

const server = http.createServer(app);

// Socket.io Config with permissive CORS
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// --- Veritabanı Yolları ---
const MESSAGES_DB_PATH = path.join(__dirname, 'messages.json');
const USERS_DB_PATH = path.join(__dirname, 'users.json');

// Dosyalar yoksa oluştur (Hata korumalı)
try {
    if (!fs.existsSync(MESSAGES_DB_PATH)) fs.writeFileSync(MESSAGES_DB_PATH, JSON.stringify({}));
    if (!fs.existsSync(USERS_DB_PATH)) fs.writeFileSync(USERS_DB_PATH, JSON.stringify([]));
    console.log("Veritabanı dosyaları kontrol edildi/oluşturuldu.");
} catch (err) {
    console.error("Veritabanı dosyası oluşturma hatası:", err);
}

// --- Yardımcı Fonksiyonlar ---
function loadMessages() {
    try { return JSON.parse(fs.readFileSync(MESSAGES_DB_PATH)); } catch (e) { return {}; }
}

function saveMessage(channelId, message) {
    try {
        const db = loadMessages();
        if (!db[channelId]) db[channelId] = [];
        db[channelId].push(message);
        if (db[channelId].length > 100) db[channelId] = db[channelId].slice(-100);
        fs.writeFileSync(MESSAGES_DB_PATH, JSON.stringify(db, null, 2));
    } catch (e) {
        console.error("Mesaj kaydetme hatası:", e);
    }
}

function loadUsers() {
    try { return JSON.parse(fs.readFileSync(USERS_DB_PATH)); } catch (e) { return []; }
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

function findUser(username) {
    const users = loadUsers();
    return users.find(u => u.username === username);
}

// Aktif soket kullanıcıları (Ram'de tutulur)
let connectedUsers = {};

io.on('connection', (socket) => {
  console.log('Soket bağlandı:', socket.id);

  // --- AUTH İŞLEMLERİ ---

  socket.on('auth-register', ({ username, password }) => {
      const existing = findUser(username);
      if (existing) {
          socket.emit('auth-error', 'Bu kullanıcı adı zaten alınmış.');
      } else {
          // Varsayılan Instagram-style avatar
          const defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
          
          const newUser = {
              id: 'user-' + Date.now(),
              username,
              password, 
              avatar: defaultAvatar
          };
          saveUser(newUser);
          socket.emit('auth-success', { 
              id: newUser.id, 
              name: newUser.username, 
              avatar: newUser.avatar 
          });
      }
  });

  socket.on('auth-login', ({ username, password }) => {
      const user = findUser(username);
      if (user && user.password === password) {
          socket.emit('auth-success', { 
              id: user.id, 
              name: user.username, 
              avatar: user.avatar 
          });
      } else {
          socket.emit('auth-error', 'Kullanıcı adı veya şifre hatalı.');
      }
  });

  // --- UYGULAMA İÇİ İŞLEMLER ---

  socket.on('join-server', (userData) => {
      connectedUsers[socket.id] = {
          ...userData,
          socketId: socket.id,
          isMuted: false,
          isDeafened: false,
          isStreaming: false,
          voiceChannelId: null
      };
      
      const db = loadMessages();
      socket.emit('chat-history', db);
      
      io.emit('user-update', Object.values(connectedUsers));
  });

  socket.on('join-voice-channel', ({ channelId }) => {
      if (connectedUsers[socket.id]) {
          connectedUsers[socket.id].voiceChannelId = channelId;
          connectedUsers[socket.id].isStreaming = false;
          io.emit('user-update', Object.values(connectedUsers));
      }
  });

  socket.on('leave-voice-channel', () => {
      if (connectedUsers[socket.id]) {
          connectedUsers[socket.id].voiceChannelId = null;
          connectedUsers[socket.id].isStreaming = false;
          io.emit('user-update', Object.values(connectedUsers));
      }
  });

  socket.on('send-message', ({ channelId, message }) => {
      saveMessage(channelId, message);
      io.emit('new-message', { channelId, message });
  });

  socket.on('signal', (data) => {
      io.to(data.target).emit('signal', {
          signal: data.signal,
          sender: socket.id
      });
  });

  socket.on('update-status', (status) => {
      if (connectedUsers[socket.id]) {
          connectedUsers[socket.id] = { ...connectedUsers[socket.id], ...status };
          io.emit('user-update', Object.values(connectedUsers));
      }
  });

  socket.on('disconnect', () => {
      delete connectedUsers[socket.id];
      io.emit('user-update', Object.values(connectedUsers));
      console.log('Kullanıcı ayrıldı:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
