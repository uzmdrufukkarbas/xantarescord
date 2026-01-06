
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ConnectionState, ChatMessage, VoiceUser, Channel } from './types';

// Icons
const MicIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;
const MicOffIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;
const HeadphoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>;
const HeadphoneOffIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>;
const ScreenShareIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"></path><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M17 8l5-5"></path><path d="M17 3h5v5"></path></svg>;
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const PhoneMissedIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="23" y1="1" x2="17" y2="7"></line><line x1="17" y1="1" x2="23" y2="7"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const Volume2Icon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>;
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const HashtagIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>;
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const InviteIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>;
const ServerIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>;
const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>;

type ViewMode = 'voice' | 'chat';
const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";

const App: React.FC = () => {
  // --- Server Config ---
  const [serverUrl, setServerUrl] = useState("http://localhost:3001");
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  // --- Auth State ---
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- Persistent State (Server & Channels) ---
  const [serverName, setServerName] = useState("Damar Odası");
  const [serverIcon, setServerIcon] = useState("https://placehold.co/100x100?text=CS2");
  
  // Channels
  const [textChannels, setTextChannels] = useState<Channel[]>([{ id: 'default-text', name: 'genel', type: 'text' }]);
  const [voiceChannels, setVoiceChannels] = useState<Channel[]>([{ id: 'default-voice', name: 'Genel Sohbet', type: 'voice' }]);
  
  // Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>('voice');
  const [activeTextChannelId, setActiveTextChannelId] = useState<string>('default-text');
  const [activeVoiceChannelId, setActiveVoiceChannelId] = useState<string>('default-voice');
  
  // Data State
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [textChatData, setTextChatData] = useState<Record<string, ChatMessage[]>>({});
  
  // Multi-user State
  const [onlineUsers, setOnlineUsers] = useState<VoiceUser[]>([]);
  const [currentUser, setCurrentUser] = useState<VoiceUser | null>(null);
  
  // Input State
  const [inputMessage, setInputMessage] = useState("");
  const [voiceChatInput, setVoiceChatInput] = useState("");
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
  
  // Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [channelModal, setChannelModal] = useState<{
      isOpen: boolean;
      mode: 'create' | 'edit';
      type: 'text' | 'voice';
      channelId?: string;
      initialName?: string;
  }>({ isOpen: false, mode: 'create', type: 'text' });
  const [modalInputName, setModalInputName] = useState("");

  // Invite Modal State
  const [inviteData, setInviteData] = useState<any>(null);

  // Refs for WebRTC & Socket
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRefs = useRef<Record<string, HTMLVideoElement>>({});
  const remoteAudioRefs = useRef<Record<string, HTMLAudioElement>>({});
  
  // Media State
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const textChatScrollRef = useRef<HTMLDivElement>(null);
  const voiceChatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup effect
  useEffect(() => {
    // Initial connection attempt on load if url exists
    const savedServerUrl = localStorage.getItem('custom_socket_url');
    if (savedServerUrl) {
       setServerUrl(savedServerUrl);
       // We only connect, but don't join until auth
       connectSocket(savedServerUrl);
    } else {
       setIsServerModalOpen(true);
    }

    return () => {
      disconnect();
    };
  }, []);

  // --- Persistence & Invite Logic ---
  useEffect(() => {
    // Check for Invite Link
    const params = new URLSearchParams(window.location.search);
    const invitePayload = params.get('invite');
    if (invitePayload) {
        try {
            // Fix for UTF-8 characters
            const decodedString = decodeURIComponent(escape(atob(invitePayload)));
            const decoded = JSON.parse(decodedString);
            setInviteData(decoded);
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
            console.error("Invalid invite link", e);
        }
    }

    // Load Settings
    const savedIcon = localStorage.getItem('custom_server_icon');
    if (savedIcon) setServerIcon(savedIcon);
    const savedServerName = localStorage.getItem('custom_server_name');
    if (savedServerName) setServerName(savedServerName);

    // Channels are loaded/synced from Invite usually, or local fallback
    const savedTextChannels = localStorage.getItem('custom_text_channels');
    if (savedTextChannels) try { setTextChannels(JSON.parse(savedTextChannels)); } catch(e){}
    const savedVoiceChannels = localStorage.getItem('custom_voice_channels');
    if (savedVoiceChannels) try { setVoiceChannels(JSON.parse(savedVoiceChannels)); } catch(e){}
  }, []);

  // Save changes
  useEffect(() => { localStorage.setItem('custom_server_name', serverName); }, [serverName]);
  useEffect(() => { localStorage.setItem('custom_text_channels', JSON.stringify(textChannels)); }, [textChannels]);
  useEffect(() => { localStorage.setItem('custom_voice_channels', JSON.stringify(voiceChannels)); }, [voiceChannels]);
  
  // Auto-scroll chat
  useEffect(() => {
    if (textChatScrollRef.current) textChatScrollRef.current.scrollTop = textChatScrollRef.current.scrollHeight;
  }, [textChatData, activeTextChannelId, viewMode]);

  useEffect(() => {
      if (voiceChatScrollRef.current && isVoiceChatOpen) {
          voiceChatScrollRef.current.scrollTop = voiceChatScrollRef.current.scrollHeight;
      }
  }, [textChatData, activeVoiceChannelId, isVoiceChatOpen]);

  // --- Socket & WebRTC Logic ---

  const connectSocket = (urlInput: string) => {
      if (socketRef.current?.connected) return;

      if (socketRef.current) {
          socketRef.current.removeAllListeners();
          socketRef.current.close();
      }

      // Sanitize URL
      const url = urlInput.replace(/\/$/, "");

      // Let Socket.io handle transports automatically (polling -> websocket) to avoid errors
      const socket = io(url, {
          transports: ['websocket', 'polling'], // XHR Poll hatasını önlemek için eklendi
          reconnection: true,
          reconnectionAttempts: 5,
          timeout: 20000,
          autoConnect: true
      });
      socketRef.current = socket;
      setConnectionState(ConnectionState.CONNECTING);

      socket.on('connect', () => {
          console.log("Soket sunucusuna erişildi, giriş bekleniyor...");
          setConnectionState(ConnectionState.CONNECTED);
          setAuthError(""); 

          // AUTO-LOGIN LOGIC
          const savedUser = localStorage.getItem('saved_username');
          const savedPass = localStorage.getItem('saved_password');
          if (savedUser && savedPass) {
             setAuthUsername(savedUser);
             setAuthPassword(savedPass);
             setAuthLoading(true);
             socket.emit('auth-login', { username: savedUser, password: savedPass });
          }
      });
      
      socket.on('connect_error', (err) => {
          console.error("Connection error:", err);
          setConnectionState(ConnectionState.ERROR);
          setAuthError(`Sunucuya bağlanılamadı (${err.message}). Adresi kontrol edin.`);
          setAuthLoading(false);
      });

      socket.on('auth-success', (user: any) => {
          setAuthLoading(false);
          setAuthError("");
          setIsLoggedIn(true);
          const myUser: VoiceUser = {
              socketId: socket.id || '',
              id: user.id,
              name: user.name,
              avatar: user.avatar || DEFAULT_AVATAR,
              isMuted: false,
              isDeafened: false,
              isStreaming: false,
              voiceChannelId: null
          };
          setCurrentUser(myUser);
          socket.emit('join-server', myUser);
      });

      socket.on('auth-error', (msg: string) => {
          setAuthLoading(false);
          setAuthError(msg);
      });

      socket.on('chat-history', (history) => {
          setTextChatData(history);
      });

      socket.on('new-message', ({ channelId, message }) => {
          setTextChatData(prev => ({
              ...prev,
              [channelId]: [...(prev[channelId] || []), message]
          }));
      });

      socket.on('user-update', (users: VoiceUser[]) => {
          setOnlineUsers(users);
      });

      // WebRTC Sinyalleşme
      socket.on('signal', async (data) => {
          const { sender, signal } = data;
          if (!peersRef.current[sender]) {
               await createPeerConnection(sender, false);
          }
          const peer = peersRef.current[sender];
          
          if (signal.type === 'offer') {
              await peer.setRemoteDescription(new RTCSessionDescription(signal));
              const answer = await peer.createAnswer();
              await peer.setLocalDescription(answer);
              socket.emit('signal', { target: sender, signal: peer.localDescription });
          } else if (signal.type === 'answer') {
              await peer.setRemoteDescription(new RTCSessionDescription(signal));
          } else if (signal.candidate) {
              try {
                  await peer.addIceCandidate(new RTCIceCandidate(signal));
              } catch(e) { console.error("Error adding ice candidate", e); }
          }
      });

      socket.on('disconnect', () => {
          setConnectionState(ConnectionState.DISCONNECTED);
          setIsLoggedIn(false);
      });
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (authMode === 'forgot') {
          if (!resetEmail.trim()) {
              setAuthError("Lütfen e-posta adresinizi girin.");
              return;
          }
          setAuthLoading(true);
          setAuthError("");
          // Simüle edilmiş şifre sıfırlama işlemi
          setTimeout(() => {
              setAuthLoading(false);
              alert("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. (Simülasyon)");
              setAuthMode('login');
              setResetEmail("");
          }, 1500);
          return;
      }

      if (!authUsername.trim() || !authPassword.trim()) {
          setAuthError("Kullanıcı adı ve şifre zorunludur.");
          return;
      }
      
      // Save credentials for next time (Optimistic save)
      localStorage.setItem('saved_username', authUsername);
      localStorage.setItem('saved_password', authPassword);

      // Attempt reconnect if missing
      if (!socketRef.current || !socketRef.current.connected) {
           setAuthError("Sunucuya bağlı değil. Yeniden bağlanılıyor...");
           connectSocket(serverUrl);
           // Give it a moment or just wait for user to click again after connection
           return;
      }

      setAuthLoading(true);
      setAuthError("");

      if (authMode === 'register') {
          socketRef.current.emit('auth-register', { username: authUsername, password: authPassword });
      } else {
          socketRef.current.emit('auth-login', { username: authUsername, password: authPassword });
      }
  };

  const createPeerConnection = async (targetSocketId: string, isInitiator: boolean) => {
      const peer = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peersRef.current[targetSocketId] = peer;

      // Yerel stream varsa ekle
      if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => peer.addTrack(track, localStreamRef.current!));
      }
      if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => peer.addTrack(track, screenStreamRef.current!));
      }

      peer.onicecandidate = (event) => {
          if (event.candidate && socketRef.current) {
              socketRef.current.emit('signal', { target: targetSocketId, signal: event.candidate });
          }
      };

      peer.ontrack = (event) => {
          const stream = event.streams[0];
          // Görüntü mü ses mi?
          if (event.track.kind === 'video') {
               // Ekran paylaşımı
               const videoEl = document.getElementById(`video-${targetSocketId}`) as HTMLVideoElement;
               if (videoEl) { videoEl.srcObject = stream; videoEl.play(); }
          } else {
               // Ses
               const audioEl = document.createElement('audio');
               audioEl.srcObject = stream;
               audioEl.autoplay = true;
               document.body.appendChild(audioEl);
               remoteAudioRefs.current[targetSocketId] = audioEl;
          }
      };

      if (isInitiator) {
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          if (socketRef.current) {
              socketRef.current.emit('signal', { target: targetSocketId, signal: peer.localDescription });
          }
      }

      return peer;
  };

  const joinVoiceChannel = async (channelId: string) => {
      setActiveVoiceChannelId(channelId);
      if (!socketRef.current) return;

      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = stream;
          setIsMuted(false);
          
          socketRef.current.emit('join-voice-channel', { channelId });
          
          // O odadaki diğer herkese bağlan
          onlineUsers.forEach(u => {
              if (u.voiceChannelId === channelId && u.socketId !== socketRef.current?.id) {
                  createPeerConnection(u.socketId, true);
              }
          });

      } catch (e) {
          console.error("Mikrofon hatası", e);
          alert("Mikrofona erişilemedi.");
      }
  };

  const leaveVoiceChannel = () => {
      if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(t => t.stop());
          localStreamRef.current = null;
      }
      if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(t => t.stop());
          screenStreamRef.current = null;
          setIsScreenSharing(false);
      }
      
      // Tüm peer bağlantılarını kapat
      Object.values(peersRef.current).forEach((p: RTCPeerConnection) => p.close());
      peersRef.current = {};
      
      // Ses elementlerini temizle
      Object.values(remoteAudioRefs.current).forEach((el: HTMLAudioElement) => el.remove());
      remoteAudioRefs.current = {};

      if (socketRef.current) {
          socketRef.current.emit('leave-voice-channel');
      }
      setActiveVoiceChannelId('default-voice'); // Reset visual selection if needed
  };

  const disconnect = () => {
      // Clear auto-login credentials
      localStorage.removeItem('saved_username');
      localStorage.removeItem('saved_password');

      leaveVoiceChannel();
      if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
      }
      setConnectionState(ConnectionState.DISCONNECTED);
      setIsLoggedIn(false);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
       // Stop sharing
       if (screenStreamRef.current) {
           screenStreamRef.current.getTracks().forEach(t => t.stop());
           screenStreamRef.current = null;
       }
       setIsScreenSharing(false);
       if (socketRef.current) socketRef.current.emit('update-status', { isStreaming: false });
       
       alert("Ekran paylaşımı durduruldu. Değişikliklerin yansıması için kanala tekrar girin.");
       leaveVoiceChannel();

    } else {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            screenStreamRef.current = stream;
            setIsScreenSharing(true);
            if (socketRef.current) socketRef.current.emit('update-status', { isStreaming: true });

            stream.getTracks().forEach(track => {
                 track.onended = () => toggleScreenShare(); 
                 Object.values(peersRef.current).forEach((peer: RTCPeerConnection) => {
                     peer.addTrack(track, stream);
                 });
            });
            
            Object.keys(peersRef.current).forEach(async (socketId) => {
                 const peer = peersRef.current[socketId];
                 const offer = await peer.createOffer();
                 await peer.setLocalDescription(offer);
                 socketRef.current?.emit('signal', { target: socketId, signal: peer.localDescription });
            });

        } catch (e) { console.error("Screen share error", e); }
    }
  };

  // --- UI Handlers ---

  const handleCreateInvite = () => {
     const config = { n: serverName, i: serverIcon, t: textChannels, v: voiceChannels };
     // Fix for UTF-8 characters (Turkish)
     const jsonString = JSON.stringify(config);
     const payload = btoa(unescape(encodeURIComponent(jsonString)));
     
     const url = `${window.location.origin}${window.location.pathname}?invite=${payload}`;
     navigator.clipboard.writeText(url);
     alert("Davet linki kopyalandı! Arkadaşına gönder.");
  };

  const acceptInvite = () => {
      if (!inviteData) return;
      setServerName(inviteData.n);
      setServerIcon(inviteData.i);
      setTextChannels(inviteData.t);
      setVoiceChannels(inviteData.v);
      setInviteData(null);
  };

  const handleTextSubmit = (e: React.FormEvent, isVoiceChat: boolean = false) => {
    e.preventDefault();
    const msgText = isVoiceChat ? voiceChatInput : inputMessage;
    const targetChannel = isVoiceChat ? activeVoiceChannelId : activeTextChannelId;
    
    if (!msgText.trim() || !socketRef.current) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: socketRef.current.id || 'me',
      senderName: currentUser?.name || 'Ben',
      senderAvatar: currentUser?.avatar || DEFAULT_AVATAR,
      text: msgText.trim(),
      timestamp: new Date().toISOString()
    };

    socketRef.current.emit('send-message', { channelId: targetChannel, message: newMessage });
    
    if(isVoiceChat) setVoiceChatInput("");
    else setInputMessage("");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.match(/^image\//)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setServerIcon(reader.result);
          try { localStorage.setItem('custom_server_icon', reader.result); } catch (e) {}
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteChannel = () => {
      if (!channelModal.channelId) return;
      
      if (channelModal.type === 'text') {
          if (textChannels.length <= 1) {
              alert("En az bir metin kanalı kalmalıdır.");
              return;
          }
          const newChannels = textChannels.filter(c => c.id !== channelModal.channelId);
          setTextChannels(newChannels);
          if (activeTextChannelId === channelModal.channelId) {
              setActiveTextChannelId(newChannels[0].id);
          }
      } else {
          if (voiceChannels.length <= 1) {
              alert("En az bir ses kanalı kalmalıdır.");
              return;
          }
          const newChannels = voiceChannels.filter(c => c.id !== channelModal.channelId);
          setVoiceChannels(newChannels);
          if (activeVoiceChannelId === channelModal.channelId) {
              setActiveVoiceChannelId(newChannels[0].id);
          }
      }
      setChannelModal({ ...channelModal, isOpen: false });
  };

  const handleServerUrlSubmit = () => {
      localStorage.setItem('custom_socket_url', serverUrl);
      setIsServerModalOpen(false);
      connectSocket(serverUrl);
  };

  // --- Channel Management ---
  const openChannelModal = (mode: 'create' | 'edit', type: 'text' | 'voice', channel?: Channel) => {
      setModalInputName(channel ? channel.name : "");
      setChannelModal({ isOpen: true, mode, type, channelId: channel?.id });
  };

  const handleChannelModalSubmit = () => {
      if (!modalInputName.trim()) return;
      if (channelModal.mode === 'create') {
          const newChannel: Channel = {
              id: Date.now().toString(),
              name: modalInputName.trim().toLowerCase().replace(/\s+/g, '-'),
              type: channelModal.type
          };
          if (channelModal.type === 'text') setTextChannels(p => [...p, newChannel]);
          else setVoiceChannels(p => [...p, newChannel]);
      } else {
          if (channelModal.type === 'text') setTextChannels(p => p.map(c => c.id === channelModal.channelId ? { ...c, name: modalInputName } : c));
          else setVoiceChannels(p => p.map(c => c.id === channelModal.channelId ? { ...c, name: modalInputName } : c));
      }
      setChannelModal({ ...channelModal, isOpen: false });
      setModalInputName("");
  };

  // Render Helpers
  const currentTextChannelName = textChannels.find(c => c.id === activeTextChannelId)?.name || 'genel';
  const usersInActiveVoice = onlineUsers.filter(u => u.voiceChannelId === activeVoiceChannelId);

  // --- JSX ---
  if (isServerModalOpen) {
      return (
          <div className="flex h-screen w-screen bg-[#202225] items-center justify-center font-sans text-white relative">
              {/* Back Button */}
              <button 
                  onClick={() => setIsServerModalOpen(false)}
                  className="absolute top-6 left-6 flex items-center text-white/70 hover:text-white bg-black/50 hover:bg-black/70 px-4 py-2 rounded-lg transition-all font-medium backdrop-blur-sm"
              >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Geri Dön
              </button>

              <div className="bg-[#36393f] p-8 rounded shadow-lg w-96 relative z-10">
                   <h2 className="text-2xl font-bold mb-4">Sunucu Bağlantısı</h2>
                   <p className="text-gray-400 text-sm mb-4">Kiralanan sunucunun adresini girin (örn: http://192.168.1.1:3001)</p>
                   <p className="text-yellow-500 text-xs mb-4">Not: Ücretsiz sunucuların uyanması 1 dakikayı bulabilir.</p>
                   <input 
                      className="w-full bg-[#202225] p-2 rounded mb-4 text-white" 
                      value={serverUrl} 
                      onChange={e => setServerUrl(e.target.value)} 
                      placeholder="http://localhost:3001"
                   />
                   <button onClick={handleServerUrlSubmit} className="bg-discord-accent w-full py-2 rounded font-bold hover:bg-indigo-600 transition-colors">Bağlan</button>
              </div>
          </div>
      );
  }

  // LOGIN SCREEN
  if (!isLoggedIn) {
      return (
          <div className="flex h-screen w-screen bg-[url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center items-center justify-center font-sans relative">
              {/* Overlay for better readability */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

              <button 
                  onClick={() => setIsServerModalOpen(true)}
                  className="absolute top-6 left-6 flex items-center text-white/70 hover:text-white bg-black/50 hover:bg-black/70 px-4 py-2 rounded-lg transition-all font-medium backdrop-blur-sm z-20"
              >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Sunucu Değiştir
              </button>
              
              <div className="bg-[#36393f] p-8 rounded shadow-2xl w-full max-w-sm relative z-10">
                  <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-white mb-2">
                          {authMode === 'login' ? 'Tekrar Hoş Geldin!' : (authMode === 'register' ? 'Hesap Oluştur' : 'Şifre Sıfırlama')}
                      </h2>
                      <p className="text-gray-400 text-sm">
                          {authMode === 'login' ? 'Seni tekrar görmek çok güzel!' : (authMode === 'register' ? 'Aramıza katılmaya hazır mısın?' : 'Endişelenme, hallederiz.')}
                      </p>
                      
                      {/* Connection Status Indicator for User Clarity */}
                      <div className="mt-2 text-xs">
                          {connectionState === ConnectionState.CONNECTED ? 
                              <span className="text-green-500">● Sunucuya Bağlı</span> : 
                              (connectionState === ConnectionState.CONNECTING ? 
                                  <span className="text-yellow-500">● Sunucuya Bağlanıyor... (Uyku modundaysa 50sn sürebilir)</span> : 
                                  <span className="text-red-500">● Sunucu Bağlantısı Yok ({serverUrl})</span>
                              )
                          }
                          {connectionState === ConnectionState.DISCONNECTED && (
                             <button onClick={() => connectSocket(serverUrl)} className="ml-2 text-blue-400 hover:underline">Tekrar Dene</button>
                          )}
                      </div>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                      {authMode === 'forgot' ? (
                          <div className="animate-fadeIn">
                             <div className="mb-4 text-center">
                                 <p className="text-white font-medium mb-1">Şifremi unuttum, ne yapmalıyım?</p>
                                 <p className="text-xs text-gray-400">E-posta adresini gir, sana sıfırlama bağlantısı gönderelim.</p>
                             </div>
                             <label className="text-xs font-bold text-discord-muted uppercase mb-1 block">E-Posta</label>
                             <input 
                                  type="email" 
                                  className="w-full bg-[#202225] text-white p-3 rounded-lg border-2 border-[#202225] focus:border-discord-accent focus:bg-[#2f3136] focus:ring-4 focus:ring-discord-accent/50 focus:shadow-[0_0_15px_rgba(88,101,242,0.5)] outline-none transition-all duration-300 ease-out shadow-inner"
                                  value={resetEmail}
                                  onChange={e => setResetEmail(e.target.value)}
                                  required
                                  disabled={authLoading}
                                  placeholder="ornek@email.com"
                              />
                          </div>
                      ) : (
                          <>
                            <div>
                                <label className="text-xs font-bold text-discord-muted uppercase mb-1 block">Kullanıcı Adı</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-[#202225] text-white p-3 rounded-lg border-2 border-[#202225] focus:border-discord-accent focus:bg-[#2f3136] focus:ring-4 focus:ring-discord-accent/50 focus:shadow-[0_0_15px_rgba(88,101,242,0.5)] outline-none transition-all duration-300 ease-out shadow-inner"
                                    value={authUsername}
                                    onChange={e => setAuthUsername(e.target.value)}
                                    required
                                    disabled={authLoading}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-discord-muted uppercase mb-1 block">Şifre</label>
                                <input 
                                    type="password" 
                                    className="w-full bg-[#202225] text-white p-3 rounded-lg border-2 border-[#202225] focus:border-discord-accent focus:bg-[#2f3136] focus:ring-4 focus:ring-discord-accent/50 focus:shadow-[0_0_15px_rgba(88,101,242,0.5)] outline-none transition-all duration-300 ease-out shadow-inner"
                                    value={authPassword}
                                    onChange={e => setAuthPassword(e.target.value)}
                                    required
                                    disabled={authLoading}
                                />
                                {authMode === 'login' && (
                                    <div className="flex justify-end mt-1">
                                        <button 
                                            type="button" 
                                            onClick={() => {setAuthMode('forgot'); setAuthError("");}} 
                                            className="text-xs text-discord-accent hover:underline"
                                        >
                                            Şifremi Unuttum?
                                        </button>
                                    </div>
                                )}
                            </div>
                          </>
                      )}
                      
                      {authError && <div className="text-red-500 text-sm font-medium">{authError}</div>}

                      <button type="submit" disabled={authLoading} className={`bg-discord-accent w-full py-2.5 rounded text-white font-bold hover:bg-indigo-600 transition-colors ${authLoading ? 'İşleniyor...' : ''}`}>
                          {authLoading ? 'İşleniyor...' : (authMode === 'login' ? 'Giriş Yap' : (authMode === 'register' ? 'Kayıt Ol' : 'Sıfırlama Bağlantısı Gönder'))}
                      </button>
                  </form>

                  <div className="mt-4 text-sm text-gray-400 text-center">
                      {authMode === 'login' ? (
                          <>Hesabın yok mu? <button onClick={() => {setAuthMode('register'); setAuthError("");}} className="text-discord-accent hover:underline">Kaydol</button></>
                      ) : (
                          authMode === 'register' ? (
                              <>Zaten hesabın var mı? <button onClick={() => {setAuthMode('login'); setAuthError("");}} className="text-discord-accent hover:underline">Giriş Yap</button></>
                          ) : (
                             <button onClick={() => {setAuthMode('login'); setAuthError("");}} className="text-discord-accent hover:underline">Giriş ekranına dön</button>
                          )
                      )}
                  </div>
              </div>
          </div>
      );
  }

  // MAIN APP
  return (
    <div className="flex h-screen w-screen bg-discord-main font-sans overflow-hidden">
      {/* 1. Server List (Sidebar) */}
      <div className="w-[72px] bg-discord-dark flex flex-col items-center py-3 space-y-2 shrink-0">
        <div className="w-12 h-12 bg-discord-accent rounded-[15px] flex items-center justify-center text-white cursor-pointer overflow-hidden transition-all hover:rounded-[10px]">
          <img src={serverIcon} alt={serverName} className="w-full h-full object-cover" />
        </div>
        <div className="w-8 h-[2px] bg-discord-text/20 rounded-lg mx-auto"></div>
        <button onClick={() => setIsServerModalOpen(true)} className="w-12 h-12 bg-gray-700 rounded-[24px] hover:rounded-[15px] hover:bg-green-600 transition-all flex items-center justify-center text-white cursor-pointer" title="Sunucu Değiştir">
            <ServerIcon className="w-6 h-6" />
        </button>
      </div>

      {/* 2. Channel List */}
      <div className="w-60 bg-discord-sidebar flex flex-col shrink-0">
        <div onClick={() => setIsSettingsOpen(true)} className="h-12 shadow-sm flex items-center justify-between px-4 font-bold text-white border-b border-black/10 hover:bg-discord-hover cursor-pointer">
          <span className="truncate">{serverName}</span>
          <div className="flex space-x-2">
             <button onClick={(e) => { e.stopPropagation(); handleCreateInvite(); }} className="hover:text-white text-gray-400"><InviteIcon className="w-4 h-4" /></button>
             <SettingsIcon className="w-4 h-4 opacity-50" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pt-3 px-2">
          {/* Text Channels */}
          <div className="flex items-center justify-between text-discord-muted px-2 mb-1 mt-2">
             <span className="text-xs font-bold uppercase hover:text-discord-text cursor-pointer">Metin Kanalları</span>
             <button onClick={() => openChannelModal('create', 'text')} className="text-discord-muted hover:text-discord-text"><PlusIcon className="w-4 h-4" /></button>
          </div>
          {textChannels.map(channel => (
             <div key={channel.id} onClick={() => { setViewMode('chat'); setActiveTextChannelId(channel.id); }} className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer mb-0.5 ${activeTextChannelId === channel.id && viewMode === 'chat' ? 'bg-discord-hover text-white' : 'text-discord-muted hover:bg-discord-hover hover:text-discord-text'}`}>
                <div className="flex items-center overflow-hidden">
                  <HashtagIcon className="shrink-0 mr-2" />
                  <span className="font-medium truncate">{channel.name}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); openChannelModal('edit', 'text', channel); }} className="hidden group-hover:block text-discord-muted hover:text-discord-text">
                    <SettingsIcon className="w-3.5 h-3.5" />
                </button>
             </div>
          ))}

          {/* Voice Channels */}
          <div className="flex items-center justify-between text-discord-muted px-2 mb-1 mt-4">
            <span className="text-xs font-bold uppercase hover:text-discord-text cursor-pointer">Ses Kanalları</span>
            <button onClick={() => openChannelModal('create', 'voice')} className="text-discord-muted hover:text-discord-text"><PlusIcon className="w-4 h-4" /></button>
          </div>
          {voiceChannels.map(channel => (
             <div key={channel.id}>
                <div onClick={() => { setViewMode('voice'); setActiveVoiceChannelId(channel.id); }} className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${activeVoiceChannelId === channel.id && viewMode === 'voice' ? 'bg-discord-hover text-white' : 'text-discord-muted hover:bg-discord-hover hover:text-discord-text'}`}>
                  <div className="flex items-center overflow-hidden">
                    <Volume2Icon className="shrink-0 mr-2" />
                    <span className="font-medium truncate">{channel.name}</span>
                  </div>
                   <button onClick={(e) => { e.stopPropagation(); openChannelModal('edit', 'voice', channel); }} className="hidden group-hover:block text-discord-muted hover:text-discord-text">
                        <SettingsIcon className="w-3.5 h-3.5" />
                   </button>
                </div>
                {/* Users in channel */}
                <div className="pl-4">
                    {onlineUsers.filter(u => u.voiceChannelId === channel.id).map(user => (
                        <div key={user.socketId} className="flex items-center py-1 group cursor-pointer">
                            <img src={user.avatar} className={`w-6 h-6 rounded-full border-2 ${user.isStreaming ? 'border-red-500' : 'border-gray-500'}`} />
                            <span className={`ml-2 text-sm ${user.socketId === socketRef.current?.id ? 'text-white font-bold' : 'text-gray-400'}`}>{user.name}</span>
                            {user.isStreaming && <span className="ml-2 text-[8px] bg-red-500 text-white px-1 rounded">YAYIN</span>}
                        </div>
                    ))}
                </div>
             </div>
          ))}
        </div>

        {/* User Status */}
        <div className="h-[52px] bg-[#292b2f] flex items-center px-2 space-x-2 shrink-0">
          <img src={currentUser?.avatar || DEFAULT_AVATAR} className="w-8 h-8 rounded-full" alt="Me" />
          <div className="flex-1 overflow-hidden">
            <div className="text-white text-sm font-bold truncate">{currentUser?.name}</div>
            <div className="text-xs text-discord-muted text-[10px]">#{currentUser?.id?.substring(0,4)}</div>
          </div>
          <button onClick={disconnect} className="text-red-500 hover:bg-gray-800 p-1 rounded" title="Çıkış Yap"><PhoneMissedIcon/></button>
        </div>
      </div>

      {/* 3. Main Stage */}
      <div className="flex-1 flex flex-col min-w-0 bg-discord-main relative">
        {/* Header */}
        <div className="h-12 shadow-sm flex items-center px-4 border-b border-black/10 shrink-0">
          <span className="text-discord-muted mr-2">{viewMode === 'chat' ? <HashtagIcon /> : <Volume2Icon />}</span>
          <span className="text-white font-bold">{viewMode === 'chat' ? currentTextChannelName : (voiceChannels.find(c => c.id === activeVoiceChannelId)?.name)}</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
            
            {/* VOICE / STREAM VIEW */}
            <div className={`absolute inset-0 p-4 transition-opacity duration-300 ${viewMode === 'voice' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                <div className="h-full bg-black rounded-xl overflow-hidden relative flex">
                    <div className="flex-1 relative flex flex-wrap content-center justify-center p-4 gap-4">
                        {/* Local & Remote Videos (Screen Shares) */}
                        {usersInActiveVoice.length === 0 && <div className="text-gray-500">Kanala bağlı kimse yok.</div>}
                        
                        {usersInActiveVoice.map(user => (
                            <div key={user.socketId} className={`relative bg-gray-800 rounded-lg overflow-hidden transition-all ${user.isStreaming ? 'w-full h-full' : 'w-48 h-48'}`}>
                                {user.isStreaming ? (
                                    <video id={`video-${user.socketId}`} className="w-full h-full object-contain" autoPlay playsInline />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center flex-col">
                                        <img src={user.avatar} className="w-16 h-16 rounded-full mb-2" />
                                        <span className="text-white font-bold">{user.name}</span>
                                    </div>
                                )}
                                <div className="absolute bottom-2 left-2 bg-black/50 px-2 rounded text-white text-xs">{user.name}</div>
                            </div>
                        ))}

                        {/* Controls */}
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/80 px-6 py-3 rounded-2xl border border-white/10">
                            {localStreamRef.current ? (
                                <>
                                    <button onClick={leaveVoiceChannel} className="bg-red-500 p-3 rounded-full text-white hover:bg-red-600"><PhoneMissedIcon /></button>
                                    <button onClick={toggleScreenShare} className={`p-3 rounded-full ${isScreenSharing ? 'bg-white text-black' : 'bg-gray-700 text-white'}`}><ScreenShareIcon /></button>
                                    <button onClick={() => setIsVoiceChatOpen(!isVoiceChatOpen)} className={`p-3 rounded-full ${isVoiceChatOpen ? 'bg-white text-black' : 'bg-gray-700 text-white'}`} title="Sohbeti Göster"><MessageSquareIcon /></button>
                                </>
                            ) : (
                                <button onClick={() => joinVoiceChannel(activeVoiceChannelId)} className="bg-green-600 px-6 py-2 rounded-full text-white font-bold flex items-center hover:bg-green-700">
                                    <PhoneIcon className="mr-2" /> Sese Katıl
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Side Voice Chat Panel */}
                    {isVoiceChatOpen && (
                        <div className="w-80 bg-discord-sidebar border-l border-black/20 flex flex-col shrink-0 animate-fadeIn">
                             <div className="h-12 border-b border-black/10 flex items-center px-4 font-bold text-white justify-between">
                                 <span>Kanal Sohbeti</span>
                                 <button onClick={() => setIsVoiceChatOpen(false)}><CloseIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                             </div>
                             <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={voiceChatScrollRef}>
                                 {(textChatData[activeVoiceChannelId] || []).length === 0 && <div className="text-gray-500 text-center text-sm mt-4">Henüz mesaj yok.</div>}
                                 {(textChatData[activeVoiceChannelId] || []).map((msg, i) => (
                                     <div key={i} className="flex flex-col">
                                         <div className="flex items-center space-x-2 mb-1">
                                             <img src={msg.senderAvatar} className="w-6 h-6 rounded-full" />
                                             <span className="font-bold text-xs text-white">{msg.senderName}</span>
                                             <span className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                         </div>
                                         <p className="text-gray-300 text-sm pl-8 break-words">{msg.text}</p>
                                     </div>
                                 ))}
                             </div>
                             <div className="p-3 bg-discord-main">
                                 <form onSubmit={(e) => handleTextSubmit(e, true)}>
                                     <input 
                                         value={voiceChatInput}
                                         onChange={(e) => setVoiceChatInput(e.target.value)}
                                         placeholder="Mesaj gönder..."
                                         className="w-full bg-[#40444b] text-white px-3 py-2 rounded text-sm outline-none"
                                     />
                                 </form>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CHAT VIEW */}
            <div className={`absolute inset-0 flex flex-col bg-discord-main transition-opacity duration-300 ${viewMode === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                 <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={textChatScrollRef}>
                    {(textChatData[activeTextChannelId] || []).map((msg, i) => (
                        <div key={i} className="group flex hover:bg-[#32353b] -mx-4 px-4 py-1">
                           <img src={msg.senderAvatar || DEFAULT_AVATAR} className="w-10 h-10 rounded-full mr-4 mt-0.5" />
                           <div className="flex-1">
                               <div className="flex items-center space-x-2">
                                  <span className="font-medium text-white hover:underline cursor-pointer">{msg.senderName}</span>
                                  <span className="text-xs text-discord-muted">{new Date(msg.timestamp).toLocaleString()}</span>
                               </div>
                               <p className="text-discord-text">{msg.text}</p>
                           </div>
                        </div>
                    ))}
                 </div>
                 <div className="p-4 bg-discord-main">
                    <form onSubmit={(e) => handleTextSubmit(e, false)} className="relative">
                       <div className="absolute left-4 top-3 text-discord-muted hover:text-white cursor-pointer"><PlusIcon /></div>
                       <input 
                         value={inputMessage}
                         onChange={(e) => setInputMessage(e.target.value)}
                         placeholder={`#${currentTextChannelName} kanalına mesaj gönder`}
                         className="w-full bg-discord-chat text-discord-text px-12 py-3 rounded-lg outline-none focus:ring-0 font-medium"
                       />
                    </form>
                 </div>
            </div>
        </div>
      </div>

      {/* SERVER SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fadeIn">
           <div className="bg-[#36393f] w-[440px] rounded-lg shadow-2xl overflow-hidden flex flex-col transform transition-all scale-100">
              <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Sunucu Ayarları</h2>
                    <button onClick={() => setIsSettingsOpen(false)} className="text-discord-muted hover:text-discord-text transition-colors"><CloseIcon /></button>
                 </div>
                 
                 <div className="space-y-6">
                    {/* Server Name Input */}
                    <div>
                         <label className="text-xs font-bold text-discord-muted uppercase mb-2 block">Sunucu Adı</label>
                         <input 
                            type="text"
                            value={serverName}
                            onChange={(e) => setServerName(e.target.value)}
                            className="w-full bg-[#202225] text-white p-2 rounded border border-black/10 focus:border-discord-accent outline-none font-medium"
                         />
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-discord-dark relative group">
                           <img src={serverIcon} alt="Server Icon" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <span className="text-xs font-bold text-white">Değiştir</span>
                           </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp, image/gif" onChange={handleImageUpload} />
                        <button onClick={() => fileInputRef.current?.click()} className="bg-discord-accent hover:bg-indigo-500 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center transition-colors">
                           <span className="mr-2"><UploadIcon /></span>
                           Fotoğraf Yükle
                        </button>
                    </div>
                 </div>
              </div>
              
              <div className="bg-[#2f3136] p-4 flex justify-end">
                 <button onClick={() => setIsSettingsOpen(false)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium text-sm transition-colors">Tamam</button>
              </div>
           </div>
        </div>
      )}

      {/* CHANNEL SETTINGS MODAL */}
      {channelModal.isOpen && (
         <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fadeIn">
            <div className="bg-[#36393f] w-[440px] rounded-lg shadow-2xl overflow-hidden flex flex-col">
               <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-white">
                         {channelModal.mode === 'create' ? 'Kanal Oluştur' : 'Kanal Düzenle'}
                     </h2>
                     <button onClick={() => setChannelModal({...channelModal, isOpen: false})} className="text-discord-muted hover:text-discord-text"><CloseIcon /></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-discord-muted uppercase mb-2 block">Kanal Tipi</label>
                          <div className="flex items-center space-x-4">
                              <div className={`flex-1 p-3 rounded border cursor-pointer flex items-center ${channelModal.type === 'text' ? 'bg-[#40444b] border-discord-accent' : 'bg-[#2f3136] border-transparent opacity-50 pointer-events-none'}`}>
                                  <HashtagIcon className="mr-2" />
                                  <span className="font-bold text-white">Metin</span>
                              </div>
                              <div className={`flex-1 p-3 rounded border cursor-pointer flex items-center ${channelModal.type === 'voice' ? 'bg-[#40444b] border-discord-accent' : 'bg-[#2f3136] border-transparent opacity-50 pointer-events-none'}`}>
                                  <Volume2Icon className="mr-2" />
                                  <span className="font-bold text-white">Ses</span>
                              </div>
                          </div>
                      </div>
                      
                      <div>
                          <label className="text-xs font-bold text-discord-muted uppercase mb-2 block">Kanal Adı</label>
                          <input 
                             type="text"
                             value={modalInputName}
                             onChange={(e) => setModalInputName(e.target.value)}
                             placeholder="yeni-kanal"
                             className="w-full bg-[#202225] text-white p-2 rounded border border-black/10 focus:border-discord-accent outline-none font-medium"
                             autoFocus
                          />
                      </div>
                  </div>
               </div>
               
               <div className="bg-[#2f3136] p-4 flex justify-between items-center">
                  {channelModal.mode === 'edit' ? (
                      <button onClick={deleteChannel} className="text-red-500 hover:underline text-sm font-medium flex items-center">
                          <TrashIcon className="w-4 h-4 mr-1" /> Kanalı Sil
                      </button>
                  ) : <div></div>}
                  <div className="flex space-x-3">
                      <button onClick={() => setChannelModal({...channelModal, isOpen: false})} className="text-white hover:underline text-sm font-medium">İptal</button>
                      <button onClick={handleChannelModalSubmit} className="bg-discord-accent hover:bg-indigo-500 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
                          {channelModal.mode === 'create' ? 'Oluştur' : 'Kaydet'}
                      </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Invite Modal */}
      {inviteData && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
           <div className="bg-[#36393f] p-8 rounded text-center">
               <h1 className="text-white text-2xl font-bold mb-4">{inviteData.n} sunucusuna davet edildin!</h1>
               <button onClick={acceptInvite} className="bg-discord-accent text-white px-6 py-2 rounded font-bold">Kabul Et</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
