
// --- Yardımcı Fonksiyonlar ---
function loadMessages() {
    try { 
        // Dosya boşsa veya bozuksa boş obje döndür
        const data = fs.readFileSync(MESSAGES_DB_PATH, 'utf8');
        return data.length > 0 ? JSON.parse(data) : {};
    } catch (e) { return {}; }
}

function saveMessage(channelId, message) {
    try {
        const db = loadMessages();
        if (!db[channelId]) db[channelId] = [];
        db[channelId].push(message);
        // Limit 500 mesaja çıkarıldı (Daha uzun sohbet geçmişi)
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
                db[channelId][msgIndex].replyTo = undefined; // Yanıt bağlantısını da koparabiliriz
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
    // Case-insensitive (büyük/küçük harf duyarsız) arama yapalım ki hata payı azalsın
    return users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

// Aktif soket kullanıcıları (Ram'de tutulur)
let connectedUsers = {};

io.on('connection', (socket) => {
  console.log('Soket bağlandı:', socket.id);

  // --- AUTH İŞLEMLERİ ---

  socket.on('auth-register', ({ username, password }) => {
      // Backend tarafında da güvenli trim yapalım
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
          // İlk kullanıcıyı Yönetici yap
          const allUsers = loadUsers();
          const isAdmin = allUsers.length === 0;

          // Varsayılan Instagram-style avatar (Base64)
          const defaultAvatar = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2JjYmNiYyI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==";
          
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
          // Şifre kontrolü
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
          // Güvenlik için normalde "Kullanıcı bulunamadı" denmez ama debugging için şimdilik ayıralım
          // Kullanıcı "Kayıt ol diyince giriyor" dediği için muhtemelen user yok.
          socket.emit('auth-error', 'Kullanıcı bulunamadı. Lütfen kayıt olun.');
      }
  });
