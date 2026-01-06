
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// Socket.io Config with permissive CORS
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Explicitly allow both
});

// --- Veritabanı Yolları ---
const MESSAGES_DB_PATH = path.join(__dirname, 'messages.json');
const USERS_DB_PATH = path.join(__dirname, 'users.json');

// Dosyalar yoksa oluştur
if (!fs.existsSync(MESSAGES_DB_PATH)) fs.writeFileSync(MESSAGES_DB_PATH, JSON.stringify({}));
if (!fs.existsSync(USERS_DB_PATH)) fs.writeFileSync(USERS_DB_PATH, JSON.stringify([]));

// --- Yardımcı Fonksiyonlar ---
function loadMessages() {
    try { return JSON.parse(fs.readFileSync(MESSAGES_DB_PATH)); } catch (e) { return {}; }
}

function saveMessage(channelId, message) {
    const db = loadMessages();
    if (!db[channelId]) db[channelId] = [];
    db[channelId].push(message);
    if (db[channelId].length > 100) db[channelId] = db[channelId].slice(-100);
    fs.writeFileSync(MESSAGES_DB_PATH, JSON.stringify(db, null, 2));
}

function loadUsers() {
    try { return JSON.parse(fs.readFileSync(USERS_DB_PATH)); } catch (e) { return []; }
}

function saveUser(user) {
    const users = loadUsers();
    users.push(user);
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
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
              password, // Not: Gerçek projede şifreler hashlenmelidir!
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

  // 1. Kullanıcı Giriş Yaptıktan Sonra Sunucuya Katılma
  socket.on('join-server', (userData) => {
      connectedUsers[socket.id] = {
          ...userData,
          socketId: socket.id,
          isMuted: false,
          isDeafened: false,
          isStreaming: false,
          voiceChannelId: null
      };
      
      // Geçmiş mesajları gönder
      const db = loadMessages();
      socket.emit('chat-history', db);
      
      // Diğerlerine bildir
      io.emit('user-update', Object.values(connectedUsers));
  });

  // 2. Ses Kanalına Girme
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

  // 3. Mesajlaşma
  socket.on('send-message', ({ channelId, message }) => {
      saveMessage(channelId, message);
      io.emit('new-message', { channelId, message });
  });

  // 4. WebRTC Sinyalleşme
  socket.on('signal', (data) => {
      io.to(data.target).emit('signal', {
          signal: data.signal,
          sender: socket.id
      });
  });

  // 5. Durum Güncellemeleri
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
