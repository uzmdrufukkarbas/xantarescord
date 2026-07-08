import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ConnectionState, ChatMessage, VoiceUser, Channel } from './types';

// --- İKONLAR (Değişmedi) ---
const MicIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;
const MicOffIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;
const HeadphoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>;
const HeadphoneOffIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>;
const ScreenShareIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"></path><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M17 8l5-5"></path><path d="M17 3h5v5"></path></svg>;
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const PhoneMissedIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="23" y1="1" x2="17" y2="7"></line><line x1="17" y1="1" x2="23" y2="7"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const Volume2Icon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>;
const VolumeXIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>;
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const HashtagIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>;
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const InviteIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>;
const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const ReplyIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>;
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const MaximizeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>;
const EyeOffIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const LogOutIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const CrownIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>;
const HammerIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"></path><path d="M17.64 15 22 10.64"></path><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25V3.6a2.4 2.4 0 0 0-2.4-2.4h-.3c-.84 0-1.65.33-2.25.93L12.53 3.39a3.2 3.2 0 0 0-.93 2.25v4.92c0 .85.33 1.66.93 2.26l1.25 1.25"></path></svg>;
const GiftIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>;
const StickerIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"></path><path d="M15 3v6h6"></path><path d="M10 18a4 4 0 1 1 0-8 4 4 0 0 1 0 8"></path></svg>;
const SmileIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;

type ViewMode = 'voice' | 'chat';
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2JjYmNiYyI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==";

const App: React.FC = () => {
  // --- Auth State ---
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- Persistent State (Server & Channels) ---
  const [serverName, setServerName] = useState("Xantarescord");
  const [serverIcon, setServerIcon] = useState("https://placehold.co/100x100?text=Xantarescord");
  
  const [textChannels, setTextChannels] = useState<Channel[]>([{ id: 'default-text', name: 'sohbet-odası', type: 'text' }]);
  const [voiceChannels, setVoiceChannels] = useState<Channel[]>([{ id: 'default-voice', name: 'Genel Sohbet', type: 'voice' }]);
  
  const [viewMode, setViewMode] = useState<ViewMode>('voice');
  const [activeTextChannelId, setActiveTextChannelId] = useState<string>('default-text');
  const [activeVoiceChannelId, setActiveVoiceChannelId] = useState<string>('default-voice');
  const [showMemberList, setShowMemberList] = useState(true);
  
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [textChatData, setTextChatData] = useState<Record<string, ChatMessage[]>>({});
  
  const [onlineUsers, setOnlineUsers] = useState<VoiceUser[]>([]);
  const [currentUser, setCurrentUser] = useState<VoiceUser | null>(null);
  const prevUsersRef = useRef<VoiceUser[]>([]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [voiceChatInput, setVoiceChatInput] = useState("");
  
  const [openVoiceChatId, setOpenVoiceChatId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
  const [channelModal, setChannelModal] = useState<{
      isOpen: boolean;
      mode: 'create' | 'edit';
      type: 'text' | 'voice';
      channelId?: string;
      initialName?: string;
  }>({ isOpen: false, mode: 'create', type: 'text' });
  const [modalInputName, setModalInputName] = useState("");

  const [inviteData, setInviteData] = useState<any>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [locallyMutedUsers, setLocallyMutedUsers] = useState<Set<string>>(new Set());
  const [locallyHiddenVideos, setLocallyHiddenVideos] = useState<Set<string>>(new Set());

  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  
  const remoteVideoStreamsRef = useRef<Record<string, MediaStream>>({});
  const remoteAudioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const [, forceUpdate] = useState({});

  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const textChatScrollRef = useRef<HTMLDivElement>(null);
  const voiceChatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userFileInputRef = useRef<HTMLInputElement>(null);

  // --- OTO BAĞLANTI (Server Sorma Kalktı) ---
  useEffect(() => {
    connectSocket();
    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invitePayload = params.get('invite');
    if (invitePayload) {
        try {
            const decodedString = decodeURIComponent(escape(atob(invitePayload)));
            const decoded = JSON.parse(decodedString);
            setInviteData(decoded);
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
            console.error("Invalid invite link", e);
        }
    }

    const savedIcon = localStorage.getItem('custom_server_icon');
    if (savedIcon) setServerIcon(savedIcon);
    const savedServerName = localStorage.getItem('custom_server_name');
    if (savedServerName) setServerName(savedServerName);

    const savedTextChannels = localStorage.getItem('custom_text_channels');
    if (savedTextChannels) try { setTextChannels(JSON.parse(savedTextChannels)); } catch(e){}
    const savedVoiceChannels = localStorage.getItem('custom_voice_channels');
    if (savedVoiceChannels) try { setVoiceChannels(JSON.parse(savedVoiceChannels)); } catch(e){}
  }, []);

  useEffect(() => { localStorage.setItem('custom_server_name', serverName); }, [serverName]);
  useEffect(() => { localStorage.setItem('custom_text_channels', JSON.stringify(textChannels)); }, [textChannels]);
  useEffect(() => { localStorage.setItem('custom_voice_channels', JSON.stringify(voiceChannels)); }, [voiceChannels]);

  useEffect(() => {
    if (textChannels.length > 0) {
      const exists = textChannels.find(c => c.id === activeTextChannelId);
      if (!exists) setActiveTextChannelId(textChannels[0].id);
    }
  }, [textChannels, activeTextChannelId]);

  useEffect(() => {
    if (voiceChannels.length > 0) {
      const exists = voiceChannels.find(c => c.id === activeVoiceChannelId);
      if (!exists) setActiveVoiceChannelId(voiceChannels[0].id);
    }
  }, [voiceChannels, activeVoiceChannelId]);
  
  useEffect(() => {
    if (textChatScrollRef.current) textChatScrollRef.current.scrollTop = textChatScrollRef.current.scrollHeight;
  }, [textChatData, activeTextChannelId, viewMode]);

  useEffect(() => {
      if (voiceChatScrollRef.current && openVoiceChatId) {
          voiceChatScrollRef.current.scrollTop = voiceChatScrollRef.current.scrollHeight;
      }
  }, [textChatData, openVoiceChatId]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
    }, 5000);
  };
  
  useEffect(() => {
      return () => {
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      }
  }, []);

  const getDisplayId = (user: { name: string; id: string } | null) => {
      if (!user) return "#0000";
      if (user.name === "Onee") return "#0";
      if (user.name === "Vroft") return "#1";
      if (user.name === "XANTARES") return "#2";
      return `#${user.id.substring(0, 4)}`;
  };

  const formatDateDivider = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Bugün";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Dün";
    } else {
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  const canDeleteMessage = (timestamp: string) => {
      const msgTime = new Date(timestamp).getTime();
      const now = Date.now();
      return (now - msgTime) < 300000;
  };

  // --- SOKET BAĞLANTISI (SABİTLENDİ) ---
  const connectSocket = () => {
      if (socketRef.current?.connected) return;

      if (socketRef.current) {
          socketRef.current.removeAllListeners();
          socketRef.current.close();
      }

      // KUTU KALDIRILDI, DİREKT AWS SUNUCUNA BAĞLANIR
      const socket = io("https://xantarescordv2.duckdns.org", {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          timeout: 20000,
          autoConnect: true
      });
      socketRef.current = socket;
      setConnectionState(ConnectionState.CONNECTING);

      socket.on('connect', () => {
          setConnectionState(ConnectionState.CONNECTED);
          setAuthError(""); 

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
          setConnectionState(ConnectionState.ERROR);
          setAuthError(`Bağlantı hatası: ${err.message}`);
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
              isAdmin: user.isAdmin,
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
          if(isLoggedIn) {
             alert(msg);
             disconnect();
          }
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

      socket.on('message-deleted', ({ channelId, messageId, updatedMessage }) => {
          setTextChatData(prev => {
              const channelMessages = prev[channelId] || [];
              const updatedMessages = channelMessages.map(msg => 
                  msg.id === messageId ? updatedMessage : msg
              );
              return {
                  ...prev,
                  [channelId]: updatedMessages
              };
          });
      });

      socket.on('user-update', (users: VoiceUser[]) => {
          setOnlineUsers(users);

          const prevUsers = prevUsersRef.current;
          if (prevUsers.length > 0) {
              const hasJoin = users.some(u => {
                  const prev = prevUsers.find(p => p.id === u.id);
                  return u.voiceChannelId && (!prev || !prev.voiceChannelId);
              });

              const hasLeave = prevUsers.some(p => {
                  const curr = users.find(u => u.id === p.id);
                  return p.voiceChannelId && (!curr || !curr.voiceChannelId);
              });

              if (hasJoin) {
                  const audio = new Audio("https://raw.githubusercontent.com/kurisubrooks/discord-sounds/master/sounds/user_join.mp3");
                  audio.volume = 0.5;
                  audio.play().catch(e => console.log("Audio play failed", e));
              }
              if (hasLeave) {
                  const audio = new Audio("https://raw.githubusercontent.com/kurisubrooks/discord-sounds/master/sounds/user_leave.mp3");
                  audio.volume = 0.5;
                  audio.play().catch(e => console.log("Audio play failed", e));
              }
          }

          prevUsersRef.current = users;

          if (socketRef.current) {
            const me = users.find(u => u.socketId === socketRef.current?.id);
            if (me) {
                setCurrentUser(prev => prev ? { ...prev, ...me } : me);
            }
          }
      });

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
          setTimeout(() => {
              setAuthLoading(false);
              alert("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
              setAuthMode('login');
              setResetEmail("");
          }, 1500);
          return;
      }

      if (!authUsername.trim() || !authPassword.trim()) {
          setAuthError("Kullanıcı adı ve şifre zorunludur.");
          return;
      }
      
      const cleanUsername = authUsername.trim();
      const cleanPassword = authPassword.trim();
      
      localStorage.setItem('saved_username', cleanUsername);
      localStorage.setItem('saved_password', cleanPassword);

      if (!socketRef.current || !socketRef.current.connected) {
           setAuthError("Sunucuya bağlı değil. Yeniden bağlanılıyor...");
           connectSocket();
           return;
      }

      setAuthLoading(true);
      setAuthError("");

      if (authMode === 'register') {
          socketRef.current.emit('auth-register', { username: cleanUsername, password: cleanPassword });
      } else {
          socketRef.current.emit('auth-login', { username: cleanUsername, password: cleanPassword });
      }
  };

  const createPeerConnection = async (targetSocketId: string, isInitiator: boolean) => {
      const peer = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peersRef.current[targetSocketId] = peer;

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
          
          if (event.track.kind === 'video') {
             remoteVideoStreamsRef.current[targetSocketId] = stream;
             forceUpdate({});
          } else {
             if (!remoteAudioRefs.current[targetSocketId]) {
                 const audioEl = document.createElement('audio');
                 audioEl.srcObject = stream;
                 audioEl.autoplay = true;
                 
                 const isLocallyMuted = locallyMutedUsers.has(targetSocketId);
                 audioEl.muted = isDeafened || isLocallyMuted;

                 document.body.appendChild(audioEl);
                 remoteAudioRefs.current[targetSocketId] = audioEl;
             }
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
          stream.getAudioTracks().forEach(track => track.enabled = !isMuted);

          socketRef.current.emit('join-voice-channel', { channelId });
          
          onlineUsers.forEach(u => {
              if (u.voiceChannelId === channelId && u.socketId !== socketRef.current?.id) {
                  createPeerConnection(u.socketId, true);
              }
          });

      } catch (e) {
          consoleerror("Mikrofon hatası", e);
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
      
      Object.values(peersRef.current).forEach((p: RTCPeerConnection) => p.close());
      peersRef.current = {};
      remoteVideoStreamsRef.current = {};
      
      Object.values(remoteAudioRefs.current).forEach((el: HTMLAudioElement) => el.remove());
      remoteAudioRefs.current = {};
      
      setLocallyHiddenVideos(new Set());
      setLocallyMutedUsers(new Set());

      if (socketRef.current) {
          socketRef.current.emit('leave-voice-channel');
      }
      setActiveVoiceChannelId('default-voice');
  };

  const disconnect = () => {
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
       if (screenStreamRef.current) {
           screenStreamRef.current.getTracks().forEach(t => t.stop());
           screenStreamRef.current = null;
       }
       setIsScreenSharing(false);
       if (socketRef.current) socketRef.current.emit('update-status', { isStreaming: false });
       
       alert("Ekran paylaşımı durduruldu.");
       leaveVoiceChannel();
       setTimeout(() => joinVoiceChannel(activeVoiceChannelId), 500);

    } else {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ 
                video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
                audio: true 
            });
            
            screenStreamRef.current = stream;
            setIsScreenSharing(true);
            if (socketRef.current) socketRef.current.emit('update-status', { isStreaming: true });

            stream.getTracks().forEach(track => {
                 track.onended = () => {
                     if (screenStreamRef.current) {
                         screenStreamRef.current.getTracks().forEach(t => t.stop());
                         screenStreamRef.current = null;
                     }
                     setIsScreenSharing(false);
                     if (socketRef.current) socketRef.current.emit('update-status', { isStreaming: false });
                     leaveVoiceChannel();
                     setTimeout(() => joinVoiceChannel(activeVoiceChannelId), 500);
                 }; 
                 
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

  const toggleMute = () => {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      
      if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach(track => {
              track.enabled = !newMuted;
          });
      }
      
      if (socketRef.current) {
          socketRef.current.emit('update-status', { isMuted: newMuted });
      }
  };

  const toggleDeafen = () => {
      const newDeafened = !isDeafened;
      setIsDeafened(newDeafened);
      
      Object.values(remoteAudioRefs.current).forEach((audio: HTMLAudioElement, index) => {
          const socketId = Object.keys(remoteAudioRefs.current)[index];
          const isLocallyMuted = locallyMutedUsers.has(socketId);
          audio.muted = newDeafened || isLocallyMuted;
      });

      if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach(track => {
              track.enabled = !newDeafened && !isMuted;
          });
      }

      if (socketRef.current) {
          socketRef.current.emit('update-status', { isDeafened: newDeafened });
      }
  };

  const toggleRemoteAudioLocal = (targetSocketId: string) => {
     const newSet = new Set(locallyMutedUsers);
     if (newSet.has(targetSocketId)) {
         newSet.delete(targetSocketId);
     } else {
         newSet.add(targetSocketId);
     }
     setLocallyMutedUsers(newSet);

     const audioEl = remoteAudioRefs.current[targetSocketId];
     if (audioEl) {
         audioEl.muted = isDeafened || newSet.has(targetSocketId);
     }
  };

  const toggleRemoteVideoLocal = (targetSocketId: string) => {
      const newSet = new Set(locallyHiddenVideos);
      if (newSet.has(targetSocketId)) {
          newSet.delete(targetSocketId);
      } else {
          newSet.add(targetSocketId);
      }
      setLocallyHiddenVideos(newSet);
      forceUpdate({});
  };

  const handleBanUser = (userId: string, userName: string) => {
      if(!window.confirm(`${userName} kullanıcısını sunucudan kalıcı olarak banlamak istediğine emin misin?`)) return;
      if (socketRef.current) {
          socketRef.current.emit('admin-ban-user', { targetUserId: userId });
      }
  };

  const handleDeleteMessage = (channelId: string, messageId: string) => {
      if(window.confirm('Bu mesajı silmek istediğine emin misin?')) {
          if (socketRef.current) {
              socketRef.current.emit('delete-message', { channelId, messageId });
          }
      }
  };

  const handleCreateInvite = () => {
     const config = { n: serverName, i: serverIcon, t: textChannels, v: voiceChannels };
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

  const handleLogout = () => {
      localStorage.removeItem('saved_username');
      localStorage.removeItem('saved_password');
      disconnect();
      setIsSettingsOpen(false);
  };

  const handleTextSubmit = (e: React.FormEvent, isVoiceChat: boolean = false) => {
    e.preventDefault();
    const msgText = isVoiceChat ? voiceChatInput : inputMessage;
    const targetChannel = isVoiceChat ? (openVoiceChatId || activeVoiceChannelId) : activeTextChannelId;
    
    if (!msgText.trim() || !socketRef.current) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: socketRef.current.id || 'me',
      senderId: currentUser?.id,
      senderName: currentUser?.name || 'Ben',
      senderAvatar: currentUser?.avatar || DEFAULT_AVATAR,
      text: msgText.trim(),
      timestamp: new Date().toISOString(),
      replyTo: replyingTo && !isVoiceChat ? {
         id: replyingTo.id,
         senderName: replyingTo.senderName,
         text: replyingTo.text
      } : undefined
    };

    socketRef.current.emit('send-message', { channelId: targetChannel, message: newMessage });
    
    if(isVoiceChat) setVoiceChatInput("");
    else {
        setInputMessage("");
        setReplyingTo(null);
    }
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

  const handleUserAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.match(/^image\//)) {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                const newAvatar = reader.result;
                if (currentUser) {
                    setCurrentUser({ ...currentUser, avatar: newAvatar });
                }
                if (socketRef.current) {
                    socketRef.current.emit('update-profile', { avatar: newAvatar });
                }
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

  const currentTextChannelName = textChannels.find(c => c.id === activeTextChannelId)?.name || 'genel';
  const usersInActiveVoice = onlineUsers.filter(u => u.voiceChannelId === activeVoiceChannelId);
  const activeStreamer = usersInActiveVoice.find(u => u.isStreaming);

  const getStatusUI = () => {
     switch(connectionState) {
         case ConnectionState.CONNECTED:
             return { color: 'bg-green-500', text: 'Sohbete Bağlandın', glow: 'shadow-[0_0_10px_rgba(34,197,94,0.6)]', textColor: 'text-green-400' };
         case ConnectionState.CONNECTING:
             return { color: 'bg-yellow-500', text: 'Sohbete Bağlanıyor', glow: 'animate-pulse', textColor: 'text-yellow-400' };
         default:
             return { color: 'bg-red-500', text: 'Sohbetle Bağlantın Kesildi', glow: '', textColor: 'text-red-400' };
     }
  };
  const statusUI = getStatusUI();

  if (!isLoggedIn) {
      return (
          <div className="flex h-screen w-screen bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center items-center justify-center font-sans relative">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
              
              <div className="bg-[#313338] p-8 rounded shadow-2xl w-full max-w-sm relative z-10">
                  <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-white mb-2">
                          {authMode === 'login' ? 'Tekrar Hoş Geldin!' : (authMode === 'register' ? 'Hesap Oluştur' : 'Şifre Sıfırlama')}
                      </h2>
                      <p className="text-gray-400 text-sm">
                          {authMode === 'login' ? 'Seni tekrar görmek çok güzel!' : (authMode === 'register' ? 'Aramıza katılmaya hazır mısın?' : 'Endişelenme, hallederiz.')}
                      </p>
                      
                      <div className="mt-2 text-xs">
                          {connectionState === ConnectionState.CONNECTED ? 
                              <span className="text-green-500">● Sunucuya Bağlı</span> : 
                              (connectionState === ConnectionState.CONNECTING ? 
                                  <span className="text-yellow-500">● Sunucuya Bağlanıyor...</span> : 
                                  <span className="text-red-500">● Sunucu Bağlantısı Yok</span>
                              )
                          }
                          {connectionState === ConnectionState.DISCONNECTED && (
                             <button onClick={() => connectSocket()} className="ml-2 text-blue-400 hover:underline">Tekrar Dene</button>
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
                             <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">E-Posta</label>
                             <input 
                                  type="email" 
                                  className="w-full bg-[#1e1f22] text-white p-3 rounded-lg border-2 border-[#1e1f22] focus:border-indigo-500 outline-none transition-all duration-300"
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
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Kullanıcı Adı</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-[#1e1f22] text-white p-3 rounded-lg border-2 border-[#1e1f22] focus:border-indigo-500 outline-none transition-all duration-300"
                                    value={authUsername}
                                    onChange={e => setAuthUsername(e.target.value)}
                                    required
                                    disabled={authLoading}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Şifre</label>
                                <input 
                                    type="password" 
                                    className="w-full bg-[#1e1f22] text-white p-3 rounded-lg border-2 border-[#1e1f22] focus:border-indigo-500 outline-none transition-all duration-300"
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
                                            className="text-xs text-indigo-400 hover:underline"
                                        >
                                            Şifremi Unuttum?
                                        </button>
                                    </div>
                                )}
                            </div>
                          </>
                      )}
                      
                      {authError && <div className="text-red-500 text-sm font-medium">{authError}</div>}

                      <button type="submit" disabled={authLoading} className={`bg-indigo-500 w-full py-2.5 rounded text-white font-bold hover:bg-indigo-600 transition-colors ${authLoading ? 'opacity-50' : ''}`}>
                          {authLoading ? 'İşleniyor...' : (authMode === 'login' ? 'Giriş Yap' : (authMode === 'register' ? 'Kayıt Ol' : 'Gönder'))}
                      </button>
                  </form>

                  <div className="mt-4 text-sm text-gray-400 text-center">
                      {authMode === 'login' ? (
                          <>Hesabın yok mu? <button onClick={() => {setAuthMode('register'); setAuthError("");}} className="text-indigo-400 hover:underline">Kaydol</button></>
                      ) : (
                          authMode === 'register' ? (
                              <>Zaten hesabın var mı? <button onClick={() => {setAuthMode('login'); setAuthError("");}} className="text-indigo-400 hover:underline">Giriş Yap</button></>
                          ) : (
                             <button onClick={() => {setAuthMode('login'); setAuthError("");}} className="text-indigo-400 hover:underline">Giriş ekranına dön</button>
                          )
                      )}
                  </div>
              </div>
          </div>
      );
  }

  // --- ANA ARAYÜZ (Kutular Gitti) ---
  return (
    <div className="flex h-screen w-screen bg-[#313338] font-sans overflow-hidden">
      {/* 1. Sol İkon Menüsü */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 space-y-2 shrink-0">
        <div className="w-12 h-12 bg-indigo-500 rounded-[15px] flex items-center justify-center text-white cursor-pointer overflow-hidden">
          <img src={serverIcon} alt={serverName} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* 2. Kanal Listesi */}
      <div className="w-48 bg-[#2b2d31] flex flex-col shrink-0">
        <div onClick={() => setIsSettingsOpen(true)} className="h-12 shadow-sm flex items-center justify-between px-3 font-bold text-white border-b border-black/10 hover:bg-[#35373c] cursor-pointer">
          <span className="truncate text-base">{serverName}</span>
          <div className="flex space-x-1">
             <button onClick={(e) => { e.stopPropagation(); handleCreateInvite(); }} className="hover:text-white text-gray-400"><InviteIcon className="w-4 h-4" /></button>
             <SettingsIcon className="w-4 h-4 opacity-50" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pt-3 px-2">
          {/* Metin Kanalları */}
          <div className="flex items-center justify-between text-gray-400 px-2 mb-1 mt-2">
             <span className="text-xs font-bold uppercase cursor-pointer">Metin Kanalları</span>
             {currentUser?.isAdmin && <button onClick={() => openChannelModal('create', 'text')} className="hover:text-white"><PlusIcon className="w-3 h-3" /></button>}
          </div>
          {textChannels.map(channel => (
             <div key={channel.id} onClick={() => { setViewMode('chat'); setActiveTextChannelId(channel.id); }} className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer mb-0.5 ${activeTextChannelId === channel.id && viewMode === 'chat' ? 'bg-[#35373c] text-white' : 'text-gray-400 hover:bg-[#35373c] hover:text-gray-200'}`}>
                <div className="flex items-center overflow-hidden">
                  <HashtagIcon className="shrink-0 mr-2 w-4 h-4" />
                  <span className="font-medium truncate text-base">{channel.name}</span>
                </div>
                {currentUser?.isAdmin && <button onClick={(e) => { e.stopPropagation(); openChannelModal('edit', 'text', channel); }} className="hidden group-hover:block hover:text-white"><SettingsIcon className="w-3 h-3" /></button>}
             </div>
          ))}

          {/* Ses Kanalları */}
          <div className="flex items-center justify-between text-gray-400 px-2 mb-1 mt-4">
            <span className="text-xs font-bold uppercase cursor-pointer">Ses Kanalları</span>
            {currentUser?.isAdmin && <button onClick={() => openChannelModal('create', 'voice')} className="hover:text-white"><PlusIcon className="w-3 h-3" /></button>}
          </div>
          {voiceChannels.map(channel => (
             <div key={channel.id}>
                <div onClick={() => { setViewMode('voice'); setActiveVoiceChannelId(channel.id); }} className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${activeVoiceChannelId === channel.id && viewMode === 'voice' ? 'bg-[#35373c] text-white' : 'text-gray-400 hover:bg-[#35373c] hover:text-gray-200'}`}>
                  <div className="flex items-center overflow-hidden">
                    <Volume2Icon className="shrink-0 mr-2 w-4 h-4" />
                    <span className="font-medium truncate text-base">{channel.name}</span>
                  </div>
                   <div className="hidden group-hover:flex items-center space-x-1">
                       <button onClick={(e) => { e.stopPropagation(); setOpenVoiceChatId(prev => prev === channel.id ? null : channel.id); }} className="hover:text-white" title="Sohbeti Göster"><MessageSquareIcon className="w-3 h-3" /></button>
                       {currentUser?.isAdmin && <button onClick={(e) => { e.stopPropagation(); openChannelModal('edit', 'voice', channel); }} className="hover:text-white"><SettingsIcon className="w-3 h-3" /></button>}
                   </div>
                </div>
                {/* Kanaldaki Kullanıcılar */}
                <div className="pl-4">
                    {onlineUsers.filter(u => u.voiceChannelId === channel.id).map(user => (
                        <div key={user.socketId} className="flex items-center py-1 group cursor-pointer">
                            <div className="relative">
                                <img src={user.avatar} className={`w-5 h-5 rounded-full border-2 ${user.isStreaming ? 'border-red-500' : 'border-gray-500'}`} />
                                {user.isAdmin && <div className="absolute -top-1.5 -right-1 text-yellow-500"><CrownIcon className="w-3 h-3 drop-shadow-md" /></div>}
                            </div>
                            <div className="flex flex-col ml-2 overflow-hidden">
                                <span className={`text-base truncate ${user.socketId === socketRef.current?.id ? 'text-white font-bold' : 'text-gray-400'}`}>{user.name}</span>
                                <div className="flex items-center space-x-1">
                                    {user.isStreaming && <span className="text-[10px] bg-red-500 text-white px-1 rounded">LIVE</span>}
                                    {user.isMuted && <MicOffIcon className="w-3 h-3 text-red-500" />}
                                    {user.isDeafened && <HeadphoneOffIcon className="w-3 h-3 text-red-500" />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          ))}
        </div>

        {/* Alt Kullanıcı Paneli */}
        <div className="h-[52px] bg-[#232428] flex items-center px-2 space-x-1 shrink-0">
          <div className="relative">
              <img src={currentUser?.avatar || DEFAULT_AVATAR} className="w-8 h-8 rounded-full" />
              {currentUser?.isAdmin && <div className="absolute -top-2 -right-1 text-yellow-500"><CrownIcon className="w-4 h-4 drop-shadow-md" /></div>}
          </div>
          <div className="flex-1 overflow-hidden ml-1">
            <div className="text-white text-base font-bold truncate">{currentUser?.name}</div>
            <div className="text-xs text-gray-400">{getDisplayId(currentUser)}</div>
          </div>
          <div className="flex items-center">
              <button onClick={toggleMute} className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 rounded relative">
                  {isMuted ? <MicOffIcon className="w-4 h-4 text-red-500" /> : <MicIcon className="w-4 h-4" />}
              </button>
              <button onClick={toggleDeafen} className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 rounded relative">
                   {isDeafened ? <HeadphoneOffIcon className="w-4 h-4 text-red-500" /> : <HeadphoneIcon className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsUserSettingsOpen(true)} className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 rounded"><SettingsIcon className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* 3. Ana Ekran */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#313338] relative">
        <div className="h-12 flex items-center justify-between px-4 border-b border-black/20 shrink-0">
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">{viewMode === 'chat' ? <HashtagIcon /> : <Volume2Icon />}</span>
            <span className="text-white font-bold text-lg">{viewMode === 'chat' ? currentTextChannelName : (voiceChannels.find(c => c.id === activeVoiceChannelId)?.name)}</span>
          </div>
          {viewMode === 'chat' && (
              <div className="flex items-center">
                   <button onClick={() => setShowMemberList(!showMemberList)} className={`text-gray-400 hover:text-white ${showMemberList ? 'text-white' : ''}`}><UsersIcon /></button>
              </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden relative">
            {/* SES / YAYIN EKRANI */}
            <div className={`absolute inset-0 p-4 transition-opacity duration-300 ${viewMode === 'voice' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`} onMouseMove={handleMouseMove}>
                <div className="h-full bg-black rounded-xl overflow-hidden relative flex">
                    <div className="flex-1 relative flex flex-wrap content-center justify-center p-4 gap-4">
                        {usersInActiveVoice.length === 0 && <div className="text-gray-500">Kanala bağlı kimse yok.</div>}
                        
                        {activeStreamer ? (
                           <div id="stream-spotlight" className="w-full h-full relative flex items-center justify-center bg-black">
                                {locallyHiddenVideos.has(activeStreamer.socketId) ? (
                                    <div className="flex flex-col items-center justify-center text-gray-500"><EyeOffIcon className="w-16 h-16 mb-4" /><span className="text-xl">Görüntü Gizlendi</span></div>
                                ) : (
                                    <video 
                                        ref={(el: HTMLVideoElement | null) => {
                                            if (!el) return;
                                            const remoteStream = remoteVideoStreamsRef.current[activeStreamer.socketId];
                                            const localStream = screenStreamRef.current;
                                            if (activeStreamer.socketId !== socketRef.current?.id && remoteStream) {
                                                if (el.srcObject !== remoteStream) el.srcObject = remoteStream;
                                            } else if (activeStreamer.socketId === socketRef.current?.id && localStream) {
                                                if (el.srcObject !== localStream) { el.srcObject = localStream; el.muted = true; }
                                            }
                                        }}
                                        className="w-full h-full object-contain" autoPlay playsInline 
                                    />
                                )}
                                <button onClick={() => { const el = document.getElementById('stream-spotlight'); if (el && el.requestFullscreen) { el.requestFullscreen(); } }} className={`absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white p-2 rounded-lg backdrop-blur-sm transition-opacity duration-500 z-20 group ${showControls ? 'opacity-100' : 'opacity-0'}`}><MaximizeIcon className="w-6 h-6" /></button>
                                {activeStreamer.socketId !== socketRef.current?.id && (
                                    <div className={`absolute top-4 left-4 flex space-x-2 transition-opacity duration-500 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                                        <button onClick={() => toggleRemoteVideoLocal(activeStreamer.socketId)} className={`p-2 rounded-lg backdrop-blur-sm ${locallyHiddenVideos.has(activeStreamer.socketId) ? 'bg-red-600 text-white' : 'bg-black/60 text-gray-300 hover:text-white'}`}>{locallyHiddenVideos.has(activeStreamer.socketId) ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}</button>
                                        <button onClick={() => toggleRemoteAudioLocal(activeStreamer.socketId)} className={`p-2 rounded-lg backdrop-blur-sm ${locallyMutedUsers.has(activeStreamer.socketId) ? 'bg-red-600 text-white' : 'bg-black/60 text-gray-300 hover:text-white'}`}>{locallyMutedUsers.has(activeStreamer.socketId) ? <VolumeXIcon className="w-5 h-5"/> : <Volume2Icon className="w-5 h-5"/>}</button>
                                    </div>
                                )}
                                <div className={`absolute bottom-24 left-4 bg-black/60 px-4 py-2 rounded text-white font-bold backdrop-blur-sm z-20 border border-white/10 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>{activeStreamer.name} yayını</div>
                           </div>
                        ) : (
                           (usersInActiveVoice || []).map(user => (
                            <div key={user.socketId} className={`relative bg-gray-800 rounded-lg overflow-hidden transition-all group ${user.isStreaming ? 'w-full h-full' : 'w-48 h-48'}`}>
                                <div className="w-full h-full flex items-center justify-center flex-col relative">
                                    <div className="relative mb-2">
                                        <img src={user.avatar} className="w-16 h-16 rounded-full" />
                                        {user.isAdmin && <div className="absolute -top-3 -right-2 text-yellow-500"><CrownIcon className="w-6 h-6 drop-shadow-md" /></div>}
                                    </div>
                                    <span className="text-white font-bold text-lg">{user.name}</span>
                                    <div className="flex mt-2 space-x-2">
                                        {user.isMuted && <MicOffIcon className="text-red-500 w-4 h-4" />}
                                        {user.isDeafened && <HeadphoneOffIcon className="text-red-500 w-4 h-4" />}
                                    </div>
                                </div>
                                {user.socketId !== socketRef.current?.id && (
                                    <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-1">
                                        <button onClick={(e) => { e.stopPropagation(); toggleRemoteAudioLocal(user.socketId); }} className={`p-1 rounded hover:bg-gray-700 ${locallyMutedUsers.has(user.socketId) ? 'text-red-500' : 'text-gray-300'}`}>{locallyMutedUsers.has(user.socketId) ? <VolumeXIcon className="w-4 h-4"/> : <Volume2Icon className="w-4 h-4"/>}</button>
                                        {currentUser?.isAdmin && <button onClick={(e) => { e.stopPropagation(); handleBanUser(user.id, user.name); }} className="p-1 rounded hover:bg-red-600 text-gray-300 hover:text-white"><HammerIcon className="w-4 h-4" /></button>}
                                    </div>
                                )}
                                <div className={`absolute bottom-2 left-2 bg-black/50 px-2 rounded text-white text-sm transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>{user.name}</div>
                            </div>
                           ))
                        )}

                        {currentUser?.voiceChannelId === activeVoiceChannelId && (
                            <div className={`absolute bottom-24 left-1/2 transform -translate-x-1/2 flex items-center bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md transition-opacity duration-500 z-30 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                                 <div className={`w-2 h-2 rounded-full mr-2 ${statusUI.color} ${statusUI.glow}`}></div>
                                 <span className={`text-xs font-bold ${statusUI.textColor}`}>{statusUI.text}</span>
                            </div>
                        )}

                        <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/80 px-6 py-3 rounded-2xl border border-white/10 z-30 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                            {localStreamRef.current ? (
                                <>
                                    <button onClick={leaveVoiceChannel} className="bg-red-500 p-3 rounded-full text-white hover:bg-red-600"><PhoneMissedIcon /></button>
                                    <button onClick={toggleScreenShare} className={`p-3 rounded-full ${isScreenSharing ? 'bg-white text-black' : 'bg-gray-700 text-white'}`}><ScreenShareIcon /></button>
                                    <button onClick={() => setOpenVoiceChatId(prev => prev ? null : activeVoiceChannelId)} className={`p-3 rounded-full ${openVoiceChatId ? 'bg-white text-black' : 'bg-gray-700 text-white'}`} title="Sohbeti Göster"><MessageSquareIcon /></button>
                                </>
                            ) : (
                                <button onClick={() => joinVoiceChannel(activeVoiceChannelId)} className="bg-green-600 px-6 py-2 rounded-full text-white font-bold flex items-center hover:bg-green-700">
                                    <PhoneIcon className="mr-2" /> Sese Katıl
                                </button>
                            )}
                        </div>
                    </div>

                    {openVoiceChatId && (
                        <div className="w-80 bg-[#2b2d31] border-l border-white/10 flex flex-col shrink-0 animate-slideIn">
                             <div className="h-12 border-b border-black/20 flex items-center justify-between px-4 shrink-0 shadow-sm bg-[#313338]">
                                <span className="font-bold text-white flex items-center"><MessageSquareIcon className="w-4 h-4 mr-2 text-gray-400" />Sohbet</span>
                                <button onClick={() => setOpenVoiceChatId(null)} className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10"><CloseIcon className="w-5 h-5" /></button>
                             </div>
                             
                             <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={voiceChatScrollRef}>
                                {(textChatData[openVoiceChatId] || []).map((msg, i, arr) => {
                                    const prevMsg = arr[i-1];
                                    const showHeader = !prevMsg || prevMsg.sender !== msg.sender || (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() > 60000 * 5);
                                    
                                    return (
                                        <div key={msg.id} className={`group flex flex-col ${!showHeader ? 'mt-0.5' : 'mt-4'}`}>
                                            {showHeader && (
                                                <div className="flex items-center mb-1">
                                                    <img src={msg.senderAvatar} className="w-8 h-8 rounded-full mr-2" />
                                                    <div className="flex items-baseline space-x-2">
                                                        <span className="font-bold text-white text-sm">{msg.senderName}</span>
                                                        <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="pl-10 relative group">
                                                 {msg.isDeleted ? <span className="text-gray-400 text-sm">Mesaj silindi.</span> : <p className="text-gray-100 text-sm">{msg.text}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="p-3 bg-[#2b2d31] shrink-0">
                                <form onSubmit={(e) => handleTextSubmit(e, true)} className="bg-[#383a40] rounded-lg p-2 flex items-center">
                                    <input className="bg-transparent text-gray-200 w-full outline-none px-2" placeholder="Mesaj gönder" value={voiceChatInput} onChange={e => setVoiceChatInput(e.target.value)} />
                                    <button type="submit" disabled={!voiceChatInput.trim()} className={`${voiceChatInput.trim() ? 'text-indigo-400' : 'text-gray-500'}`}><SendIcon className="w-4 h-4" /></button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SOHBET EKRANI */}
            <div className={`absolute inset-0 flex flex-row transition-opacity duration-300 ${viewMode === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                 <div className="flex-1 flex flex-col min-w-0 bg-[#313338]">
                     <div className="flex-1 overflow-y-auto p-4 space-y-1" ref={textChatScrollRef}>
                        <div className="flex flex-col justify-end min-h-full">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mb-4"><HashtagIcon className="w-10 h-10 text-white" /></div>
                                <h1 className="text-3xl font-bold text-white mb-1">#{currentTextChannelName}</h1>
                                <p className="text-gray-400">Bu kanalın başlangıcına hoş geldin.</p>
                            </div>
                            
                            {(textChatData[activeTextChannelId] || []).map((msg, i, arr) => {
                                const prevMsg = arr[i-1];
                                const isNewGroup = !prevMsg || prevMsg.sender !== msg.sender || (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() > 60000 * 5);
                                const dateDivider = !prevMsg || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();
                                const isMe = msg.sender === (socketRef.current?.id || 'me');

                                return (
                                    <div key={msg.id}>
                                        {dateDivider && (
                                            <div className="relative flex items-center py-4">
                                                <div className="flex-grow border-t border-gray-700"></div>
                                                <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-medium">{formatDateDivider(msg.timestamp)}</span>
                                                <div className="flex-grow border-t border-gray-700"></div>
                                            </div>
                                        )}
                                        
                                        <div className={`group flex pr-4 hover:bg-[#2e3035] -mx-4 px-4 py-0.5 ${isNewGroup ? 'mt-4' : ''}`}>
                                            {isNewGroup ? <img src={msg.senderAvatar} className="w-10 h-10 rounded-full mr-4 mt-0.5" /> : <div className="w-10 mr-4"></div>}
                                            <div className="flex-1 min-w-0">
                                                {isNewGroup && (
                                                    <div className="flex items-center">
                                                        <span className="font-bold text-white mr-2">{msg.senderName}</span>
                                                        <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                )}
                                                <div className="text-gray-100 whitespace-pre-wrap break-words relative">
                                                    {msg.isDeleted ? <span className="italic text-gray-500 text-sm">Bu mesaj silindi.</span> : 
                                                    <>
                                                        {msg.text}
                                                        {(msg.timestamp && canDeleteMessage(msg.timestamp) && (isMe || currentUser?.isAdmin)) && (
                                                            <div className="absolute -top-4 right-0 bg-[#313338] shadow rounded flex items-center p-1 opacity-0 group-hover:opacity-100 border border-black/20">
                                                                <button onClick={() => handleDeleteMessage(activeTextChannelId, msg.id)} className="text-gray-400 hover:text-red-500 p-1"><TrashIcon className="w-4 h-4" /></button>
                                                            </div>
                                                        )}
                                                    </>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                     </div>

                     <div className="p-4 shrink-0">
                        <form onSubmit={(e) => handleTextSubmit(e, false)} className="bg-[#383a40] flex items-center px-4 py-2.5 rounded-lg">
                            <button type="button" className="text-gray-400 hover:text-white mr-3"><PlusIcon className="w-5 h-5 bg-gray-400 text-[#383a40] rounded-full p-0.5 hover:bg-white" /></button>
                            <input className="bg-transparent flex-1 text-gray-200 outline-none" placeholder={`#${currentTextChannelName} kanalına mesaj gönder`} value={inputMessage} onChange={e => setInputMessage(e.target.value)} />
                        </form>
                     </div>
                 </div>

                 {showMemberList && (
                     <div className="w-60 bg-[#2b2d31] flex flex-col shrink-0 overflow-y-auto p-4 border-l border-white/5">
                         <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2">ÇEVRİMİÇİ — {onlineUsers.length}</h3>
                         {onlineUsers.map(user => (
                             <div key={user.socketId} className="flex items-center py-2 px-2 hover:bg-[#35373c] rounded cursor-pointer">
                                 <div className="relative">
                                     <img src={user.avatar} className={`w-8 h-8 rounded-full ${user.isStreaming ? 'border-2 border-red-500' : ''}`} />
                                     <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#2b2d31] rounded-full"></div>
                                 </div>
                                 <span className={`ml-3 font-medium truncate ${user.isAdmin ? 'text-pink-400' : 'text-gray-300'}`}>{user.name}</span>
                             </div>
                         ))}
                     </div>
                 )}
            </div>
        </div>
      </div>

      {/* MODALLAR */}
      {isUserSettingsOpen && (
          <div className="absolute inset-0 bg-[#313338] z-50 flex">
              <div className="w-[30%] bg-[#2b2d31] flex justify-end p-4 pt-12">
                  <div className="w-48 text-gray-400 space-y-1">
                      <h3 className="text-xs font-bold uppercase mb-2 px-2">Kullanıcı Ayarları</h3>
                      <div className="px-2 py-1.5 bg-[#404249] text-white rounded cursor-pointer">Hesabım</div>
                      <div className="h-[1px] bg-gray-700 my-2"></div>
                      <div onClick={handleLogout} className="px-2 py-1.5 text-red-400 hover:text-red-500 rounded cursor-pointer flex justify-between">
                          <span>Çıkış Yap</span><LogOutIcon className="w-4 h-4" />
                      </div>
                  </div>
              </div>
              <div className="flex-1 p-12 overflow-y-auto relative">
                  <h2 className="text-xl font-bold text-white mb-6">Hesabım</h2>
                  <div className="bg-[#2b2d31] p-6 rounded-lg mb-8">
                       <div className="flex items-center">
                            <img src={currentUser?.avatar || DEFAULT_AVATAR} className="w-20 h-20 rounded-full" />
                            <div className="ml-6">
                                <h3 className="text-white text-xl font-bold">{currentUser?.name}</h3>
                                <p className="text-gray-400">{getDisplayId(currentUser)}</p>
                            </div>
                       </div>
                  </div>
                  <div className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer" onClick={() => setIsUserSettingsOpen(false)}>
                      <CloseIcon className="w-8 h-8" />
                  </div>
              </div>
          </div>
      )}

      {isSettingsOpen && !isUserSettingsOpen && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
               <div className="bg-[#313338] p-6 rounded-lg w-96 relative">
                   <h2 className="text-xl font-bold text-white mb-4">Sunucu Ayarları</h2>
                   <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Sunucu Adı</label>
                            <input className="w-full bg-[#1e1f22] text-white p-2 rounded outline-none" value={serverName} onChange={(e) => setServerName(e.target.value)} />
                        </div>
                   </div>
                   <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><CloseIcon /></button>
               </div>
          </div>
      )}

      {channelModal.isOpen && (
          <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center">
              <div className="bg-[#313338] p-6 rounded shadow-lg w-96">
                  <h2 className="text-xl font-bold text-white mb-4">{channelModal.mode === 'create' ? 'Kanal Oluştur' : 'Kanalı Düzenle'}</h2>
                  <div className="mb-6">
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Kanal Adı</label>
                      <input className="w-full bg-[#1e1f22] text-white p-2 rounded outline-none" value={modalInputName} onChange={e => setModalInputName(e.target.value.replace(/\s+/g, '-').toLowerCase())} />
                  </div>
                  <div className="flex justify-between">
                      {channelModal.mode === 'edit' && <button onClick={deleteChannel} className="text-red-400 text-sm">Kanalı Sil</button>}
                      <div className="flex space-x-3 ml-auto">
                          <button onClick={() => setChannelModal({ ...channelModal, isOpen: false })} className="text-white text-sm px-4">İptal</button>
                          <button onClick={handleChannelModalSubmit} className="bg-indigo-500 px-4 py-2 rounded text-white text-sm font-bold">Kaydet</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
