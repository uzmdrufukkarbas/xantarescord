
export interface ChatMessage {
  id: string;
  sender: string; // Kullanıcı adı veya ID
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string; // JSON serileştirme için string kullanıyoruz
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
