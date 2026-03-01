import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Users, 
  Star, 
  Bot, 
  User, 
  Plus, 
  Wifi, 
  WifiOff, 
  Send, 
  ThumbsUp, 
  MessageSquare, 
  Share2,
  BookOpen,
  Languages,
  BrainCircuit,
  HelpCircle,
  Activity,
  Cpu,
  Database as DbIcon,
  Zap,
  ShieldCheck,
  Globe,
  Settings,
  Bell,
  Lock,
  Eye,
  Smartphone,
  Moon,
  Sun,
  HardDrive,
  CreditCard,
  LogOut,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Image as ImageIcon,
  FileText,
  Mic,
  ArrowLeft
} from 'lucide-react';
import * as socketIo from 'socket.io-client';
const io = (socketIo as any).default || (socketIo as any).io || socketIo;
import { Post, Group, Message, Conversation, Reaction } from './types';
import { offlineStorage } from './services/offlineStorage';
import { geminiService } from './services/geminiService';

// Mock User for Demo
const CURRENT_USER = {
  id: 'user_1',
  name: 'Josephat Athanas',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joseph',
  phone: '+255 718 573 799'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [syncQueueCount, setSyncQueueCount] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<'EN' | 'SW'>('EN');
  const [systemStatus, setSystemStatus] = useState({
    cpu: 12,
    mem: 45,
    nodes: 1,
    latency: 14
  });
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Elite Mesh Connection (WebSockets)
    socketRef.current = io();
    
    socketRef.current.on('connect', () => {
      console.log('Node linked to JSL FastLine Mesh');
    });

    socketRef.current.on('sync:complete', (data) => {
      console.log('Mesh sync complete:', data);
      setSyncQueueCount(0);
      loadConversations();
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    loadConversations();
    setSyncQueueCount(offlineStorage.getSyncQueue().length);

    // Simulate real-time system metrics
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        cpu: Math.floor(Math.random() * 20) + 5,
        mem: Math.floor(Math.random() * 10) + 40,
        nodes: isOnline ? 4 : 1,
        latency: isOnline ? Math.floor(Math.random() * 20) + 10 : 0
      }));
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      socketRef.current?.disconnect();
      clearInterval(interval);
    };
  }, [isOnline]);

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      setConversations(data);
    } catch (e) {
      console.error("Failed to load conversations", e);
    }
  };

  const handleSync = () => {
    if (!isOnline) return;
    socketRef.current?.emit('sync:start', { queue: offlineStorage.getSyncQueue() });
    offlineStorage.clearSyncQueue();
  };

  return (
    <div className={`flex h-screen w-full bg-deep-graphite transition-colors duration-300 ${theme === 'light' ? 'light-theme' : 'dark'}`}>
      {/* DESKTOP LEFT SIDEBAR (NAV) */}
      <aside className="hidden md:flex flex-col w-[280px] border-r border-white/5 bg-deep-graphite/50 p-6 gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-fastline-blue/20">
            <img 
              src="https://api.dicebear.com/7.x/shapes/svg?seed=JSLFastLine&backgroundColor=0A84FF" 
              className="w-full h-full object-cover" 
              alt="JSL FastLine Logo"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-black tracking-tighter leading-none text-white">JSL FastLine</h1>
            <span className="text-[8px] font-mono text-electric-teal uppercase tracking-[0.2em] opacity-70">Fast Connections, Smart Future</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarNavButton icon={<Home />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <SidebarNavButton icon={<Users />} label="Groups" active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} />
          <SidebarNavButton icon={<Star />} label="Highlights" active={activeTab === 'highlights'} onClick={() => setActiveTab('highlights')} />
          <SidebarNavButton icon={<Bot />} label="AI Assistant" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
          <SidebarNavButton icon={<User />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>

        <div className="mt-auto p-4 widget-container bg-white/5 border-white/5">
          <div className="flex items-center gap-3">
            <img src={CURRENT_USER.avatar} className="w-10 h-10 rounded-xl" referrerPolicy="no-referrer" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold truncate">{CURRENT_USER.name}</span>
              <span className="text-[10px] text-text-secondary truncate">{CURRENT_USER.phone}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto md:mx-0 md:max-w-none border-x border-white/5 relative">
        {/* MOBILE HEADER */}
        <header className="md:hidden p-4 flex justify-between items-center border-b border-white/10 bg-deep-graphite/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-fastline-blue/20">
              <img 
                src="FastLine.png" 
                className="w-full h-full object-cover" 
                alt="JSL FastLine Logo"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-black tracking-tighter leading-none text-white">JSL FastLine</h1>
              <span className="text-[8px] font-mono text-electric-teal uppercase tracking-[0.2em] opacity-70">Fast Connections, Smart Future</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-online-green animate-pulse' : 'bg-offline-red'}`} />
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-50">
                  {isOnline ? 'Network Online' : 'Offline Mode'}
                </span>
              </div>
              {syncQueueCount > 0 && (
                <button 
                  onClick={handleSync}
                  className="text-[8px] font-bold text-energy-orange hover:underline"
                >
                  {syncQueueCount} UPDATES PENDING
                </button>
              )}
            </div>
          </div>
        </header>

        {/* DESKTOP SEARCH BAR */}
        <div className="hidden md:flex p-4 border-b border-white/5 bg-deep-graphite/30 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex-1 flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 border border-white/5 focus-within:border-fastline-blue/50 transition-colors">
            <Search size={16} className="text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search JSL FastLine..." 
              className="bg-transparent border-none focus:ring-0 text-xs w-full placeholder:text-text-secondary"
            />
          </div>
        </div>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <ChatSystem 
                conversations={conversations} 
                activeConversation={activeConversation}
                setActiveConversation={setActiveConversation}
                isOnline={isOnline}
              />
            )}
            {activeTab === 'groups' && <GroupsPage />}
            {activeTab === 'highlights' && <HighlightsPage />}
            {activeTab === 'ai' && <AIPage isOnline={isOnline} />}
            {activeTab === 'profile' && (
              <ProfilePage 
                user={CURRENT_USER} 
                isOnline={isOnline} 
                theme={theme} 
                setTheme={setTheme}
                language={language}
                setLanguage={setLanguage}
              />
            )}
          </AnimatePresence>
        </main>

        {/* MOBILE BOTTOM NAV */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-deep-graphite/90 backdrop-blur-xl border-t border-white/10 px-6 py-4 flex justify-between items-center z-50">
          <NavButton icon={<Home />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavButton icon={<Users />} label="Groups" active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} />
          <NavButton icon={<Star />} label="Highlights" active={activeTab === 'highlights'} onClick={() => setActiveTab('highlights')} />
          <NavButton icon={<Bot />} label="AI Assistant" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
          <NavButton icon={<User />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
      </div>

      {/* DESKTOP RIGHT SIDEBAR (STATUS & TRENDING) */}
      <aside className="hidden lg:flex flex-col w-[350px] border-l border-white/5 bg-deep-graphite/50 p-6 gap-6">
        <div className="widget-container p-4 space-y-4">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary">Network Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <Metric label="CPU" value={`${systemStatus.cpu}%`} />
            <Metric label="MEM" value={`${systemStatus.mem}%`} />
            <Metric label="NODES" value={systemStatus.nodes} />
            <Metric label="LAT" value={`${systemStatus.latency}ms`} />
          </div>
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-secondary">Sync Status</span>
              <span className="text-[10px] text-online-green font-bold">OPTIMAL</span>
            </div>
          </div>
        </div>

        <div className="widget-container p-4 space-y-4">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary">Trending Clusters</h3>
          <div className="space-y-3">
            {['#Physics2026', '#SwahiliTech', '#MeshNetwork', '#NeuralCore'].map((tag) => (
              <div key={tag} className="flex flex-col hover:bg-white/5 p-2 rounded-lg cursor-pointer transition-colors">
                <span className="text-xs font-bold text-fastline-blue">{tag}</span>
                <span className="text-[9px] text-text-secondary">1.2k broadcasts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto text-center p-4">
          <p className="text-[10px] text-text-secondary">© 2026 JSL FastLine Infrastructure</p>
          <p className="text-[8px] text-text-secondary opacity-50 mt-1">v1.2.0-stable | Node_ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
        </div>
      </aside>
    </div>
  );
}

function SidebarNavButton({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-fastline-blue text-white shadow-lg shadow-fastline-blue/20' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
    >
      {React.cloneElement(icon, { size: 20, strokeWidth: active ? 2.5 : 2 })}
      <span className="text-sm font-bold tracking-wide">{label}</span>
    </button>
  );
}

function Metric({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex flex-col">
      <span className="text-[7px] font-mono uppercase text-text-secondary tracking-widest">{label}</span>
      <span className="text-[10px] font-mono text-electric-teal font-bold">{value}</span>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? 'text-fastline-blue scale-110' : 'text-text-secondary hover:text-text-primary'}`}
    >
      <div className={`${active ? 'bg-fastline-blue/10 p-2 rounded-xl' : ''}`}>
        {React.cloneElement(icon, { size: 18, strokeWidth: active ? 2.5 : 2 })}
      </div>
      <span className="text-[9px] font-mono uppercase tracking-[0.15em]">{label}</span>
    </button>
  );
}

function ChatSystem({ conversations, activeConversation, setActiveConversation, isOnline }: any) {
  if (activeConversation) {
    return (
      <ChatWindow 
        conversation={activeConversation} 
        onBack={() => setActiveConversation(null)} 
        isOnline={isOnline}
      />
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary">Recent Chats</h3>
          <div className="flex gap-2">
            <button className="p-2 bg-fastline-blue/10 text-fastline-blue rounded-lg"><Plus size={18} /></button>
          </div>
        </div>

        <div className="space-y-1">
          {conversations.map((conv: Conversation) => (
            <div 
              key={conv.id} 
              onClick={() => setActiveConversation(conv)}
              className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 group"
            >
              <div className="relative">
                <img 
                  src={conv.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.name}`} 
                  className="w-12 h-12 rounded-2xl border border-white/10" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-online-green rounded-full border-2 border-card-bg" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold truncate group-hover:text-fastline-blue transition-colors">{conv.name}</h4>
                  <span className="text-[10px] text-text-secondary font-mono">12:45</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-text-secondary truncate pr-4">{(conv as any).last_message_content || "No messages yet"}</p>
                  {conv.unread_count > 0 && (
                    <span className="bg-fastline-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ChatWindow({ conversation, onBack, isOnline }: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // Simulate typing indicator
    const timer = setTimeout(() => setIsTyping(true), 2000);
    const timer2 = setTimeout(() => setIsTyping(false), 5000);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [conversation.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  };

  const handleSend = async (type: any = 'text', content: string = input, mediaUrl?: string) => {
    if (!content.trim() && !mediaUrl) return;
    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      conversation_id: conversation.id,
      user_id: CURRENT_USER.id,
      user_name: CURRENT_USER.name,
      content: content,
      type: type,
      media_url: mediaUrl,
      status: 'sent',
      created_at: new Date().toISOString()
    };

    setMessages([...messages, msg]);
    setInput('');

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const handleReaction = async (msgId: string, emoji: string) => {
    try {
      await fetch(`/api/messages/${msgId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: CURRENT_USER.id, emoji })
      });
      loadMessages();
    } catch (e) {
      console.error("Failed to add reaction", e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-deep-graphite"
    >
      {/* CHAT HEADER */}
      <div className="p-4 flex items-center gap-3 border-b border-white/5 bg-deep-graphite/50 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="relative">
          <img 
            src={conversation.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.name}`} 
            className="w-10 h-10 rounded-xl border border-white/10" 
            referrerPolicy="no-referrer" 
          />
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-online-green rounded-full border-2 border-card-bg" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold truncate">{conversation.name}</h4>
          <p className="text-[10px] text-text-secondary font-mono uppercase tracking-widest">
            {isTyping ? 'Typing...' : 'Online'}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-text-secondary hover:text-white transition-colors"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-90"
      >
        <div className="flex justify-center">
          <span className="bg-black/20 backdrop-blur-sm text-[10px] text-white/50 px-3 py-1 rounded-full font-mono uppercase tracking-widest">
            End-to-End Encrypted
          </span>
        </div>

        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            isMe={msg.user_id === CURRENT_USER.id} 
            onReact={(emoji) => handleReaction(msg.id, emoji)}
          />
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-fastline-blue rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-fastline-blue rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-fastline-blue rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHAT INPUT */}
      <div className="p-4 bg-deep-graphite border-t border-white/5 relative">
        <AnimatePresence>
          {showAttachMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 left-4 right-4 bg-card-bg border border-white/10 rounded-3xl p-4 grid grid-cols-3 gap-4 shadow-2xl z-20"
            >
              <AttachButton icon={<ImageIcon className="text-purple-400" />} label="Gallery" onClick={() => { handleSend('image', 'Sent an image', 'https://picsum.photos/seed/chat/800/600'); setShowAttachMenu(false); }} />
              <AttachButton icon={<FileText className="text-blue-400" />} label="Document" onClick={() => setShowAttachMenu(false)} />
              <AttachButton icon={<User className="text-orange-400" />} label="Contact" onClick={() => setShowAttachMenu(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {isRecording ? (
            <div className="flex-1 flex items-center justify-between bg-fastline-blue/10 rounded-2xl p-3 border border-fastline-blue/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-fastline-blue">0:0{Math.floor(Math.random() * 9)} Recording...</span>
              </div>
              <button onClick={() => setIsRecording(false)} className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Cancel</button>
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-2xl p-1.5 pl-4 border border-white/5 focus-within:border-fastline-blue/50 transition-colors">
              <button className="text-text-secondary hover:text-fastline-blue"><Smile size={20} /></button>
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 placeholder:text-text-secondary"
              />
              <button 
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`transition-transform ${showAttachMenu ? 'rotate-45 text-fastline-blue' : 'text-text-secondary hover:text-fastline-blue'}`}
              >
                <Paperclip size={20} />
              </button>
            </div>
          )}
          
          <button 
            onClick={() => {
              if (isRecording) {
                handleSend('audio', 'Voice message', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
                setIsRecording(false);
              } else if (input.trim()) {
                handleSend();
              } else {
                setIsRecording(true);
              }
            }}
            className={`p-3 rounded-full text-white shadow-lg transition-all active:scale-90 ${input.trim() || isRecording ? 'primary-gradient shadow-fastline-blue/20' : 'bg-white/5 text-text-secondary'}`}
          >
            {input.trim() || isRecording ? <Send size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AttachButton({ icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <span className="text-[10px] text-text-secondary font-medium">{label}</span>
    </button>
  );
}

const MessageBubble = ({ message, isMe, onReact }: any) => {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}>
      <div 
        className={`max-w-[85%] p-3 rounded-2xl text-sm font-sans leading-relaxed relative ${
          isMe 
            ? 'bg-fastline-blue text-white rounded-tr-none shadow-lg shadow-fastline-blue/10' 
            : 'bg-white/5 border border-white/10 text-text-primary rounded-tl-none backdrop-blur-md'
        }`}
        onDoubleClick={() => setShowReactions(!showReactions)}
      >
        {message.type === 'image' && message.media_url && (
          <img src={message.media_url} className="w-full rounded-lg mb-2 border border-white/10" referrerPolicy="no-referrer" />
        )}
        {message.type === 'audio' && (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-white rounded-full" />
            </div>
            <span className="text-[10px] opacity-70">0:04</span>
          </div>
        )}
        {message.content}
        <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-white/50' : 'text-text-secondary'}`}>
          <span className="text-[9px] font-mono">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isMe && (
            message.status === 'read' ? <CheckCheck size={12} className="text-electric-teal" /> : <Check size={12} />
          )}
        </div>

        {/* Reactions Display */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`absolute -bottom-2 ${isMe ? 'left-0' : 'right-0'} flex gap-1`}>
            {message.reactions.map((r, i) => (
              <span key={i} className="bg-card-bg border border-white/10 rounded-full px-1 text-[10px] shadow-sm">
                {r.emoji}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Reaction Picker (Simplified) */}
      <AnimatePresence>
        {showReactions && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className={`absolute -top-10 ${isMe ? 'right-0' : 'left-0'} bg-card-bg border border-white/10 rounded-full p-1 flex gap-2 shadow-2xl z-20`}
          >
            {['❤️', '👍', '😂', '😮', '😢', '🔥'].map(emoji => (
              <button 
                key={emoji} 
                onClick={() => { onReact(emoji); setShowReactions(false); }}
                className="hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function GroupsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-soft-white/50">Communities</h2>
        <button className="p-2 bg-fastline-blue/10 text-fastline-blue rounded-lg border border-fastline-blue/20"><Plus size={18} /></button>
      </div>
 
      <div className="grid gap-3">
        {['Physics_Alpha', 'Class_2026_Main', 'Tech_Hub_Local'].map((name, i) => (
          <div key={i} className="widget-container p-4 flex items-center gap-4 hover:border-fastline-blue/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-fastline-blue group-hover:primary-gradient group-hover:text-white transition-all">
              <Users size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xs">#{name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-online-green" />
                <span className="text-[9px] font-mono text-soft-white/30 uppercase">12 Active Members</span>
              </div>
            </div>
            <Zap size={14} className="text-soft-white/20 group-hover:text-energy-orange transition-colors" />
          </div>
        ))}
      </div>
 
      <div className="pt-4 space-y-4">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-soft-white/30">Find Nearby</h3>
        <div className="widget-container p-8 relative overflow-hidden flex flex-col items-center justify-center text-center space-y-4">
          <div className="scan-line absolute top-0 left-0 w-full" />
          <div className="w-16 h-16 radial-track flex items-center justify-center">
            <Globe className="w-8 h-8 text-fastline-blue animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-electric-teal uppercase tracking-widest">Searching for nearby connections...</p>
            <p className="text-[9px] text-soft-white/40">Looking for JSL FastLine users nearby</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HighlightsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 space-y-6"
    >
      <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-soft-white/50">Highlights</h2>
      
      <div className="grid gap-4">
        <HighlightCard 
          icon={<Activity size={18} />} 
          color="text-electric-teal" 
          label="Trending Now" 
          title="#PhysicsExams2026" 
          desc="High activity detected in campus study groups." 
        />
        <HighlightCard 
          icon={<DbIcon size={18} />} 
          color="text-ai-purple" 
          label="New Resource" 
          title="Organic Chemistry v2.0" 
          desc="New high-quality notes added to your library." 
        />
        <HighlightCard 
          icon={<ShieldCheck size={18} />} 
          color="text-energy-orange" 
          label="Security" 
          title="End-to-End Encryption" 
          desc="All communications are now secured via advanced encryption." 
        />
      </div>
    </motion.div>
  );
}

function HighlightCard({ icon, color, label, title, desc }: any) {
  return (
    <div className="widget-container p-4 space-y-3 border-l-2 border-l-transparent hover:border-l-current transition-all" style={{ color: color.replace('text-', '') }}>
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-[9px] font-mono uppercase tracking-[0.2em]">{label}</span>
      </div>
      <h3 className="font-bold text-sm text-white">{title}</h3>
      <p className="text-[11px] text-soft-white/50 leading-relaxed">{desc}</p>
    </div>
  );
}

function AIPage({ isOnline }: { isOnline: boolean }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages([...messages, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      if (isOnline) {
        const response = await geminiService.answerQuestion(userMsg);
        setMessages(prev => [...prev, { role: 'ai', content: response || "Neural link failed." }]);
      } else {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'ai', 
            content: "LOCAL_MODE: Neural link offline. Basic heuristics active. Please connect to mesh for full intelligence." 
          }]);
        }, 800);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: "CRITICAL_ERROR: AI microservice unreachable." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-deep-graphite/50">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
            <div className="w-20 h-20 rounded-3xl ai-gradient flex items-center justify-center shadow-2xl shadow-ai-purple/20 relative">
              <div className="absolute inset-0 rounded-3xl border border-white/20 animate-ping opacity-20" />
              <BrainCircuit size={40} className="text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-mono uppercase tracking-[0.3em] text-white">AI Assistant</h3>
              <p className="text-[10px] text-soft-white/40 max-w-[240px] leading-relaxed">
                JSL FastLine Smart Assistant. Optimized for educational support and Swahili language processing.
              </p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-sans leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-fastline-blue text-white rounded-tr-none shadow-lg shadow-fastline-blue/10' 
                : 'bg-white/5 border border-white/10 text-soft-white rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-electric-teal rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-electric-teal rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-electric-teal rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>
 
      <div className="p-4 bg-deep-graphite border-t border-white/10">
        <div className="flex gap-2 bg-white/5 rounded-xl p-1.5 pl-4 items-center border border-white/10 focus-within:border-fastline-blue/50 transition-colors">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the AI assistant..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-xs py-2 font-mono placeholder:text-soft-white/20"
          />
          <button 
            onClick={handleSend}
            className="p-2.5 ai-gradient rounded-lg text-white shadow-lg shadow-ai-purple/20 active:scale-90 transition-transform"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ user, isOnline, theme, setTheme, language, setLanguage }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-6 pb-12"
    >
      <div className="flex flex-col items-center text-center space-y-4 pt-4">
        <div className="relative">
          <div className="absolute inset-0 primary-gradient rounded-3xl blur-2xl opacity-20 animate-pulse" />
          <img src={user.avatar} className="w-24 h-24 rounded-3xl border-2 border-white/10 relative z-10" referrerPolicy="no-referrer" />
          <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-md border border-white/10 text-[8px] font-mono uppercase z-20 ${isOnline ? 'bg-online-green text-white' : 'bg-offline-red text-white'}`}>
            {isOnline ? 'Active_Node' : 'Isolated'}
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black tracking-tight">{user.name}</h2>
          <p className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em]">{user.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Posts" value="12" />
        <StatCard label="Followers" value="1.2k" />
        <StatCard label="Following" value="450" />
      </div>

      {/* SETTINGS SECTIONS */}
      <div className="space-y-6">
        {/* Account Section */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary px-1">Account</h3>
          <div className="widget-container divide-y divide-white/5">
            <ProfileMenuItem icon={<User size={16} />} label="Edit Profile" />
            <ProfileMenuItem icon={<Lock size={16} />} label="Privacy & Security" />
            <ProfileMenuItem icon={<CreditCard size={16} />} label="Payments" />
            <ProfileMenuItem icon={<Bell size={16} />} label="Notifications" />
          </div>
        </div>

        {/* Preferences Section */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary px-1">Preferences</h3>
          <div className="widget-container divide-y divide-white/5">
            <ProfileMenuItem 
              icon={<Languages size={16} />} 
              label="Language" 
              value={language === 'EN' ? 'English' : 'Kiswahili'} 
              onClick={() => setLanguage(language === 'EN' ? 'SW' : 'EN')}
            />
            <ProfileMenuItem 
              icon={theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} 
              label="Appearance" 
              value={theme === 'dark' ? 'Dark Mode' : 'Light Mode'} 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
            <ProfileMenuItem icon={<Smartphone size={16} />} label="Accessibility" />
          </div>
        </div>

        {/* Data & Storage Section */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary px-1">Data & Storage</h3>
          <div className="widget-container p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <HardDrive size={16} className="text-fastline-blue" />
                  <span className="text-[11px] font-medium uppercase tracking-wider">Storage Used</span>
                </div>
                <span className="text-[10px] font-mono text-text-secondary">1.2 GB / 5 GB</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[24%] primary-gradient rounded-full" />
              </div>
            </div>
            <div className="pt-2 border-t border-white/5">
              <ProfileMenuItem icon={<Activity size={16} />} label="Data Usage" value="Low Data Mode" />
              <ProfileMenuItem icon={<Smartphone size={16} />} label="Media Auto-Download" value="Wi-Fi Only" />
            </div>
          </div>
        </div>

        {/* Accessibility Section */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary px-1">Accessibility</h3>
          <div className="widget-container divide-y divide-white/5">
            <ProfileMenuItem icon={<Eye size={16} />} label="High Contrast" value="Off" />
            <ProfileMenuItem icon={<Smartphone size={16} />} label="Font Size" value="Default" />
            <ProfileMenuItem icon={<Activity size={16} />} label="Reduce Motion" value="Off" />
          </div>
        </div>

        {/* Support Section */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary px-1">Support</h3>
          <div className="widget-container divide-y divide-white/5">
            <ProfileMenuItem icon={<HelpCircle size={16} />} label="Help Center" />
            <ProfileMenuItem icon={<ShieldCheck size={16} />} label="Terms of Service" />
          </div>
        </div>

        {/* Logout */}
        <button className="w-full py-4 widget-container flex items-center justify-center gap-2 text-offline-red hover:bg-offline-red/5 transition-colors">
          <LogOut size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Logout Node</span>
        </button>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="widget-container p-3 text-center space-y-1">
      <span className="text-[7px] font-mono uppercase text-text-secondary tracking-widest">{label}</span>
      <h4 className="text-sm font-black">{value}</h4>
    </div>
  );
}

function ProfileMenuItem({ icon, label, value, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="text-fastline-blue group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      {value && <span className="text-[10px] font-mono text-text-secondary">{value}</span>}
    </div>
  );
}
