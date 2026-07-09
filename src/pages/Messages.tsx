import { useState, useEffect, useRef } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Plus, Hash, User, Users, FileText, Image as ImageIcon,
  Paperclip, Send, Phone, Video, MoreVertical, Smile, Reply,
  Pin, Bookmark, CheckCircle2, Circle, Clock, Info, Shield,
  GitPullRequest, LayoutTemplate, Sparkles, X, ChevronRight,
  TrendingUp, MapPin, Mic, FileArchive, CheckCircle, Rocket, Filter, MessageSquare
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

// --- Mock Data ---
type ChatType = "direct" | "team" | "startup";

interface Chat {
  id: string;
  type: ChatType;
  name: string;
  avatarGradient?: string;
  avatarText?: string;
  unread: number;
  online?: boolean;
  lastMessage: string;
  lastMessageTime: string;
  participants: number;
}

const MOCK_CHATS: Chat[] = [
  { id: "1", type: "team", name: "Nexus AI Team", avatarGradient: "from-blue-600 to-indigo-600", avatarText: "N", unread: 3, lastMessage: "Priya: I pushed the new Auth components to main.", lastMessageTime: "10:42 AM", participants: 4 },
  { id: "2", type: "direct", name: "Sneha R.", avatarGradient: "from-emerald-500 to-teal-600", avatarText: "S", unread: 1, online: true, lastMessage: "Sounds great! Let's schedule a call tomorrow.", lastMessageTime: "9:15 AM", participants: 2 },
  { id: "3", type: "startup", name: "Campus Delivery MVP", avatarGradient: "from-orange-500 to-rose-600", avatarText: "C", unread: 0, lastMessage: "Dhruv: The investor pitch went exactly as planned.", lastMessageTime: "Yesterday", participants: 6 },
  { id: "4", type: "direct", name: "Karan J.", avatarGradient: "from-purple-500 to-pink-600", avatarText: "K", unread: 0, online: false, lastMessage: "Here is the Figma link you requested.", lastMessageTime: "Yesterday", participants: 2 },
  { id: "5", type: "direct", name: "Priya Patel", avatarGradient: "from-cyan-500 to-blue-600", avatarText: "P", unread: 0, online: true, lastMessage: "Got it.", lastMessageTime: "Mon", participants: 2 },
];

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  attachments?: { type: "image" | "file" | "code"; name: string; url?: string; size?: string }[];
  reactions?: { emoji: string; count: number; reacted: boolean }[];
  replyTo?: string;
}

const MOCK_MESSAGES: Message[] = [
  { id: "m1", chatId: "1", senderId: "u1", senderName: "Priya Patel", senderAvatar: "P", text: "Hey team! I've just finished the initial setup for the authentication flow using Supabase. Could someone review the PR?", timestamp: "10:30 AM", isMe: false },
  { id: "m2", chatId: "1", senderId: "u2", senderName: "Karan J.", senderAvatar: "K", text: "Awesome work! I'll take a look at it right after my current meeting.", timestamp: "10:35 AM", isMe: false, reactions: [{ emoji: "👍", count: 2, reacted: true }] },
  { id: "m3", chatId: "1", senderId: "me", senderName: "You", senderAvatar: "Y", text: "I can test it locally as well. Did you add the required env variables to the documentation?", timestamp: "10:38 AM", isMe: true },
  { id: "m4", chatId: "1", senderId: "u1", senderName: "Priya Patel", senderAvatar: "P", text: "Yes! They are all in the new section of the README file. Let me know if you run into any issues.", timestamp: "10:41 AM", isMe: false, attachments: [{ type: "file", name: "auth_diagram.pdf", size: "1.2 MB" }] },
  { id: "m5", chatId: "1", senderId: "u1", senderName: "Priya Patel", senderAvatar: "P", text: "I pushed the new Auth components to main.", timestamp: "10:42 AM", isMe: false },
];

export function Messages() {
  const { token, user } = useAuth();
  const [activeChatId, setActiveChatId] = useState<string>("1");
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [sidebarFilter, setSidebarFilter] = useState<"all" | "direct" | "team">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = () => {
    if (!token) return;
    fetch("/api/messages/chats", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        return data;
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setChats(data.map((c: any) => ({
            id: c.id,
            type: c.type.toLowerCase() as ChatType,
            name: c.name,
            avatarGradient: c.type === "DIRECT" ? "from-emerald-500 to-teal-600" : "from-blue-600 to-indigo-600",
            avatarText: c.name.charAt(0),
            unread: c.unreadCount || 0,
            lastMessage: c.lastMessage || "No messages yet",
            lastMessageTime: c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
            participants: c.membersCount || 2
          })));
          
          // Set the first chat as active if currently using fallback mock ID
          if (activeChatId === "1" && data[0]?.id !== "1") {
            setActiveChatId(data[0].id);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load chats:", err);
      });
  };

  useEffect(() => {
    if (!token) return;
    fetchChats();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = io({
      auth: { token }
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to Chat socket");
    });

    socket.on("message", (msg: any) => {
      if (msg.chatId === activeChatId) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, {
            id: msg.id,
            chatId: msg.chatId,
            senderId: msg.senderId,
            senderName: msg.senderName || "User",
            senderAvatar: (msg.senderName || "U").charAt(0),
            text: msg.text,
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: msg.senderId === user?.id
          }];
        });
      }

      // Update chats last message and time
      setChats(prevChats => prevChats.map(c => {
        if (c.id === msg.chatId) {
          return {
            ...c,
            lastMessage: `${msg.senderName || "User"}: ${msg.text}`,
            lastMessageTime: "Just now",
            unread: msg.chatId === activeChatId ? c.unread : c.unread + 1
          };
        }
        return c;
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [token, activeChatId]);

  useEffect(() => {
    if (!token || !activeChatId) return;

    if (socketRef.current) {
      socketRef.current.emit("join_room", { chatId: activeChatId });
    }

    fetch(`/api/messages/chats/${activeChatId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        return data;
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data.map((m: any) => ({
            id: m.id,
            chatId: m.chatId,
            senderId: m.senderId,
            senderName: m.sender?.name || "User",
            senderAvatar: (m.sender?.name || "U").charAt(0),
            text: m.text,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: m.senderId === user?.id
          })));
        }
      })
      .catch((err) => {
        console.error("Failed to load historical messages:", err);
      });
  }, [activeChatId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChatId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !token || !activeChatId) return;

    const tempId = Date.now().toString();
    const newMsg: Message = {
      id: tempId,
      chatId: activeChatId,
      senderId: user?.id || "me",
      senderName: user?.name || "You",
      senderAvatar: (user?.name || "Y").charAt(0),
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage("");

    fetch(`/api/messages/chats/${activeChatId}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text: newMsg.text })
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        
        // Update temp message properties
        setMessages(prev => prev.map(m => m.id === tempId ? {
          ...m,
          id: data.id,
          timestamp: new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } : m));
        
        // Refresh chats list to update the lastMessage locally
        fetchChats();
      })
      .catch((err) => {
        console.error("Failed to send message:", err);
      });
  };

  const filteredChats = chats.filter(c => {
    if (sidebarFilter === "direct" && c.type !== "direct") return false;
    if (sidebarFilter === "team" && (c.type !== "team" && c.type !== "startup")) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-screen pt-16 flex flex-col md:flex-row bg-gray-950 text-gray-200 overflow-hidden">
      
      {/* --- LEFT SIDEBAR: CONVERSATIONS --- */}
      <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-white/5 bg-gray-950/50 backdrop-blur-xl z-20 h-[calc(100vh-64px)]">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-medium text-white">Messages</h2>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center hover:bg-blue-500/30 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Sidebar Filters */}
        <div className="flex px-4 py-2 gap-2 border-b border-white/5 overflow-x-auto scrollbar-hide">
          {["all", "direct", "team"].map((filter) => (
             <button
               key={filter}
               onClick={() => setSidebarFilter(filter as any)}
               className={cn(
                 "px-4 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors",
                 sidebarFilter === filter 
                  ? "bg-white text-black" 
                  : "bg-transparent text-gray-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10"
               )}
             >
               {filter}
             </button>
          ))}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChatId(chat.id)}
                className={cn(
                  "p-4 border-b border-white/[0.02] cursor-pointer transition-all flex items-start gap-3 hover:bg-white/[0.02]",
                  activeChatId === chat.id ? "bg-white/[0.04] border-l-2 border-l-blue-500" : "border-l-2 border-l-transparent"
                )}
              >
                <div className="relative shrink-0">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm",
                    chat.type === "direct" ? "rounded-full" : "rounded-xl",
                    !chat.avatarGradient ? "bg-gray-800" : `bg-gradient-to-br ${chat.avatarGradient}`
                  )}>
                    {chat.type === "team" && <Hash className="absolute -top-1 -left-1 w-4 h-4 text-white/50" />}
                    {chat.avatarText}
                  </div>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-gray-950"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={cn("font-medium text-sm truncate", activeChatId === chat.id ? "text-white" : chat.unread > 0 ? "text-white font-semibold" : "text-gray-300")}>
                      {chat.name}
                    </h4>
                    <span className={cn("text-[10px] whitespace-nowrap ml-2", chat.unread > 0 ? "text-blue-400 font-medium" : "text-gray-500")}>
                      {chat.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-xs truncate font-light", chat.unread > 0 ? "text-gray-300 font-medium" : "text-gray-500")}>
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center p-6">
              <MessageSquare className="w-10 h-10 opacity-20 mb-3" />
              <p className="text-xs font-light">No conversations found.</p>
            </div>
          )}
        </div>
      </aside>

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0B0F19] relative z-10 h-[calc(100vh-64px)] shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        
        {/* Chat Header */}
        {activeChat ? (
          <header className="h-[72px] px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-gray-950/80 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 flex items-center justify-center font-bold text-white shadow-sm",
                activeChat.type === "direct" ? "rounded-full" : "rounded-xl",
                !activeChat.avatarGradient ? "bg-gray-800" : `bg-gradient-to-br ${activeChat.avatarGradient}`
              )}>
                {activeChat.avatarText}
              </div>
              <div>
                <h3 className="font-display font-medium text-white flex items-center gap-2">
                  {activeChat.name}
                  {activeChat.type !== "direct" && (
                    <span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] uppercase tracking-wider text-gray-400">
                      {activeChat.type}
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-light text-gray-500 mt-0.5">
                  {activeChat.type === "direct" ? (
                    <>
                      <span className={cn("w-1.5 h-1.5 rounded-full", activeChat.online ? "bg-emerald-500" : "bg-gray-600")} />
                      {activeChat.online ? "Online" : "Offline"}
                    </>
                  ) : (
                    <>
                      <Users className="w-3 h-3" /> {activeChat.participants} members
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setIsCallActive(true)} className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <Phone className="w-4 h-4" />
              </button>
              <button onClick={() => setIsCallActive(true)} className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <Video className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors xl:hidden">
                <Info className="w-4 h-4" />
              </button>
            </div>
          </header>
        ) : (
          <header className="h-[72px] border-b border-white/5 flex items-center px-6 shrink-0 bg-gray-950/80 backdrop-blur-md"></header>
        )}

        {/* Video Call Overlay */}
        <AnimatePresence>
          {isCallActive && activeChat && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-50 bg-[#0B0F19] flex flex-col"
            >
              {/* Call Header */}
              <div className="p-6 flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-3">
                   <div className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full flex items-center gap-2 text-xs font-bold border border-red-500/20">
                     <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                     12:45
                   </div>
                   <h3 className="text-white font-medium">{activeChat.name}</h3>
                </div>
                <button onClick={() => setIsCallActive(false)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Grid */}
              <div className="flex-1 p-6 pt-0 flex gap-4 min-h-0">
                {activeChat.type === "team" ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                     {[...Array(4)].map((_, i) => (
                       <div key={i} className="rounded-2xl bg-gray-900 border border-white/10 overflow-hidden relative group">
                         <div className="absolute top-4 left-4 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-white text-xs font-medium">Participant {i+1}</div>
                         <div className="w-full h-full flex items-center justify-center">
                           <User className="w-16 h-16 text-gray-700" />
                         </div>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="w-full h-full flex gap-4">
                     <div className="flex-1 rounded-3xl bg-gray-900 border border-white/10 overflow-hidden relative">
                         <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white text-sm font-medium">{activeChat.name}</div>
                         <div className="w-full h-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity opacity-40">
                         </div>
                     </div>
                     <div className="w-64 h-48 rounded-2xl bg-gray-800 border border-white/10 overflow-hidden absolute bottom-28 right-10 shadow-2xl">
                         <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-white text-[10px] font-medium">You</div>
                         <div className="w-full h-full flex items-center justify-center">
                           <User className="w-8 h-8 text-gray-600" />
                         </div>
                     </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="h-24 pb-6 flex items-center justify-center gap-4 shrink-0">
                 <button className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/5">
                   <Mic className="w-6 h-6" />
                 </button>
                 <button className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/5">
                   <Video className="w-6 h-6" />
                 </button>
                 <button onClick={() => setIsCallActive(false)} className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                   <Phone className="w-6 h-6 rotate-135" />
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Action Strip (Contextual) */}
        {activeChat?.type === "team" && (
          <div className="px-6 py-2 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
               <Sparkles className="w-3.5 h-3.5" /> AI Workspace Summary ready for this week's discussion.
             </div>
             <button className="text-[10px] uppercase tracking-wider bg-blue-500 text-white font-bold px-2 py-1 rounded">View Summary</button>
          </div>
        )}

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center flex-col text-gray-500">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;

              return (
                <div key={msg.id} className={cn("flex w-full group", msg.isMe ? "justify-end" : "justify-start")}>
                  
                  {!msg.isMe && (
                    <div className="w-10 shrink-0 mr-3">
                      {showAvatar && (
                         <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold text-sm shadow-sm border border-white/10">
                           {msg.senderAvatar}
                         </div>
                      )}
                    </div>
                  )}

                  <div className={cn("flex flex-col max-w-[75%] lg:max-w-[65%]", msg.isMe ? "items-end" : "items-start")}>
                    {/* Sender Name & Time */}
                    {showAvatar && !msg.isMe && (
                      <div className="flex items-baseline gap-2 mb-1 ml-1">
                        <span className="text-sm font-medium text-gray-200">{msg.senderName}</span>
                        <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                      </div>
                    )}
                    {showAvatar && msg.isMe && (
                      <div className="flex items-baseline gap-2 mb-1 mr-1">
                        <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                      </div>
                    )}

                    {/* Bubble */}
                    <div className="relative flex items-center">
                      {msg.isMe && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 flex gap-1">
                           <button className="p-1.5 text-gray-500 hover:text-white rounded hover:bg-white/10"><Reply className="w-3.5 h-3.5"/></button>
                           <button className="p-1.5 text-gray-500 hover:text-white rounded hover:bg-white/10"><Smile className="w-3.5 h-3.5"/></button>
                           <button className="p-1.5 text-gray-500 hover:text-white rounded hover:bg-white/10"><MoreVertical className="w-3.5 h-3.5"/></button>
                        </div>
                      )}

                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 shadow-sm text-[15px] font-light leading-relaxed",
                        msg.isMe 
                          ? "bg-blue-600/90 text-white rounded-tr-sm border border-blue-500/50" 
                          : "bg-white/[0.04] border border-white/10 text-gray-200 rounded-tl-sm"
                      )}>
                        {/* Text */}
                        {msg.text}

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                             {msg.attachments.map((att, i) => (
                               att.type === 'file' ? (
                                 <div key={i} className={cn("flex items-center gap-3 p-2.5 rounded-xl border border-white/10", msg.isMe ? "bg-black/20" : "bg-black/40")}>
                                   <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", msg.isMe ? "bg-white/10" : "bg-white/5 border border-white/5")}>
                                      <FileArchive className="w-5 h-5 text-gray-300" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                     <p className="text-sm font-medium truncate">{att.name}</p>
                                     <p className="text-xs text-gray-400 font-light">{att.size}</p>
                                   </div>
                                 </div>
                               ) : null
                             ))}
                          </div>
                        )}
                      </div>

                      {!msg.isMe && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex gap-1">
                           <button className="p-1.5 text-gray-500 hover:text-white rounded hover:bg-white/10"><Smile className="w-3.5 h-3.5"/></button>
                           <button className="p-1.5 text-gray-500 hover:text-white rounded hover:bg-white/10"><Reply className="w-3.5 h-3.5"/></button>
                           <button className="p-1.5 text-gray-500 hover:text-white rounded hover:bg-white/10"><MoreVertical className="w-3.5 h-3.5"/></button>
                        </div>
                      )}
                    </div>

                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className={cn("flex flex-wrap gap-1 mt-1", msg.isMe ? "justify-end" : "justify-start")}>
                        {msg.reactions.map((r, i) => (
                          <div key={i} className={cn(
                            "px-2 py-0.5 rounded-full text-xs flex items-center gap-1 cursor-pointer border",
                            r.reacted ? "bg-blue-500/20 border-blue-500/30 text-blue-300" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                          )}>
                            <span>{r.emoji}</span> <span>{r.count}</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Contextual Input Area */}
        <div className="p-4 sm:p-6 pb-6 bg-[#0B0F19] shrink-0 border-t border-white/5">
          {/* Smart suggestions */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-hide">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            {["I can review the PR.", "Looks good to me!", "Let's sync up later."].map((sugg, i) => (
               <button key={i} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs text-gray-400 font-light hover:bg-white/10 hover:text-white transition-colors" onClick={() => setNewMessage(sugg)}>
                 {sugg}
               </button>
            ))}
          </div>
          
          <form onSubmit={handleSendMessage} className="relative flex items-end bg-white/[0.02] border border-white/10 rounded-2xl p-2 focus-within:border-white/30 focus-within:bg-white/[0.04] transition-colors shadow-sm">
             <button type="button" className="p-3 text-gray-500 hover:text-white transition-colors shrink-0">
               <Plus className="w-5 h-5" />
             </button>
             
             <textarea 
               value={newMessage}
               onChange={(e) => setNewMessage(e.target.value)}
               placeholder={activeChat ? `Message ${activeChat.name}...` : "Select a conversation..."}
               className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none resize-none px-2 py-3 text-white placeholder:text-gray-600 focus:outline-none scrollbar-hide text-[15px] font-light"
               rows={1}
               disabled={!activeChat}
               onKeyDown={(e) => {
                 if(e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSendMessage(e);
                 }
               }}
             />
             
             <div className="flex items-center gap-1 p-2 shrink-0">
               <button type="button" className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg">
                 <Mic className="w-5 h-5" />
               </button>
               <button 
                 type="submit" 
                 disabled={!newMessage.trim() || !activeChat}
                 className="p-2 ml-1 bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:bg-gray-800 hover:bg-blue-500 transition-colors shadow-lg"
               >
                 <Send className="w-5 h-5" />
               </button>
             </div>
          </form>
          <div className="text-center mt-3 text-[10px] text-gray-600 font-light hidden sm:block">
            <strong>Pro Tip:</strong> Type <span className="bg-white/10 px-1 rounded rounded text-gray-400">/task</span> to assign a todo, or <span className="bg-white/10 px-1 rounded rounded text-gray-400">@</span> to mention.
          </div>
        </div>

      </main>

      {/* --- RIGHT SIDEBAR: CONTEXT INFO (Desktop Only by default) --- */}
      {activeChat && (
        <aside className="hidden xl:flex w-80 flex-col border-l border-white/5 bg-gray-950/50 backdrop-blur-xl h-[calc(100vh-64px)] shrink-0 overflow-y-auto scrollbar-hide">
          <div className="p-6 border-b border-white/5 flex flex-col items-center text-center">
            <div className={cn(
              "w-20 h-20 flex items-center justify-center font-bold text-white text-3xl mb-4 shadow-xl border-4 border-gray-900 ring-1 ring-white/10",
              activeChat.type === "direct" ? "rounded-full" : "rounded-2xl",
              !activeChat.avatarGradient ? "bg-gray-800" : `bg-gradient-to-br ${activeChat.avatarGradient}`
            )}>
              {activeChat.avatarText}
            </div>
            <h2 className="text-xl font-display font-medium text-white mb-1">{activeChat.name}</h2>
            {activeChat.type === "direct" && (
              <p className="text-sm font-light text-blue-400">Full Stack Developer</p>
            )}
            {activeChat.type === "team" && (
              <p className="text-xs font-light text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mt-1">Project Active</p>
            )}
            
            <div className="flex items-center gap-4 mt-6">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1 text-white hover:bg-white/10 cursor-pointer transition-colors"><User className="w-4 h-4"/></div>
                <span className="text-[10px] text-gray-500">Profile</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1 text-white hover:bg-white/10 cursor-pointer transition-colors"><Search className="w-4 h-4"/></div>
                <span className="text-[10px] text-gray-500">Search</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1 text-white hover:bg-white/10 cursor-pointer transition-colors"><MoreVertical className="w-4 h-4"/></div>
                <span className="text-[10px] text-gray-500">More</span>
              </div>
            </div>
          </div>

          {activeChat.type === "team" && (
            <div className="p-6 border-b border-white/5 space-y-4">
              <h3 className="text-sm font-medium text-white flex items-center justify-between">
                Project Tasks <span className="text-xs text-blue-400">View Board</span>
              </h3>
              <div className="space-y-2">
                {[
                  { text: "Finish Supabase Auth", done: true },
                  { text: "Design Landing Page", done: false },
                  { text: "Write API Documentation", done: false }
                ].map((task, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                     <CheckCircle className={cn("w-4 h-4 shrink-0 mt-0.5", task.done ? "text-emerald-500" : "text-gray-600")} />
                     <span className={cn("text-xs font-light", task.done ? "text-gray-500 line-through" : "text-gray-300")}>{task.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 border-b border-white/5 space-y-4">
             <h3 className="text-sm font-medium text-white flex items-center justify-between">Shared Files</h3>
             <div className="space-y-3">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-500"><FileText className="w-5 h-5"/></div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm text-gray-200 font-medium truncate">auth_diagram.pdf</p>
                   <p className="text-xs text-gray-500 font-light">1.2 MB • Today</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-500"><ImageIcon className="w-5 h-5"/></div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm text-gray-200 font-medium truncate">wireframe_v2.png</p>
                   <p className="text-xs text-gray-500 font-light">3.4 MB • Yesterday</p>
                 </div>
               </div>
             </div>
             <button className="text-xs font-medium text-blue-400 hover:text-blue-300 w-full text-center mt-2">See all 24 files</button>
          </div>
          
          <div className="p-6">
            <h3 className="text-sm font-medium text-white mb-3">Members ({activeChat.participants})</h3>
            <div className="space-y-3">
               {["Priya Patel", "Karan J.", "Dhruv (You)"].map((name, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white border border-white/5">{name.charAt(0)}</div>
                   <span className="text-sm text-gray-300 font-light">{name}</span>
                 </div>
               ))}
            </div>
            <button className="w-full h-10 mt-6 rounded-xl border border-white/10 bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center">
              <Plus className="w-4 h-4 mr-2" /> Add Member
            </button>
          </div>

        </aside>
      )}

    </div>
  );
}
