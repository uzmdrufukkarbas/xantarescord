# XantaresCord (Damar Odası)

Discord benzeri, gerçek zamanlı sesli sohbet ve 1080p ekran paylaşımı yapabileceğiniz web tabanlı bir uygulama.

Bu proje [uzmdrufukkarbas/xantarescord](https://github.com/uzmdrufukkarbas/xantarescord) deposunun kod tabanına dayanmaktadır.

## Özellikler

- **Gerçek Zamanlı Sohbet:** Socket.io ile anlık mesajlaşma.
- **Sesli Sohbet:** WebRTC ile düşük gecikmeli ses iletişimi.
- **Ekran Paylaşımı:** P2P bağlantı üzerinden yüksek kaliteli ekran paylaşımı.
- **Kanal Yönetimi:** Metin ve ses kanalları oluşturma, düzenleme ve silme.
- **Sunucu Özelleştirme:** Sunucu adı ve ikonu değiştirme.
- **Kalıcı Veri:** Kullanıcılar, mesajlar ve kanallar sunucu tarafında JSON dosyalarında saklanır.

## Kurulum

1. Repoyu klonlayın veya indirin.
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. Sunucuyu başlatın:
   ```bash
   npm start
   ```
4. Tarayıcınızda açın (Render gibi bir platformda deploy ettiyseniz URL'yi kullanın).

## Teknoloji Yığını

- **Frontend:** React, TailwindCSS
- **Backend:** Node.js, Express, Socket.io
- **İletişim:** WebRTC (Ses/Video), WebSocket (Sinyalleşme/Chat)

## Lisans

Bu proje MIT lisansı altındadır
