
export interface ChatMessage {
  id: string;
  sender: string; // Kullanıcı adı veya ID (Socket ID)
  senderId?: string; // Veritabanı ID'si (Kalıcı sahiplik için)
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string; // JSON serileştirme için string kullanıyoruz
  isDeleted?: boolean; // Mesajın silinip silinmediği
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export interface VoiceUser {
  socketId: string;
  id: string;
  name: string;
  avatar: string;
  isAdmin?: boolean; // New: Admin role flag
  isMuted: boolean;
  isDeafened: boolean;
  isStreaming: boolean;
  voiceChannelId?: string | null;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
}
