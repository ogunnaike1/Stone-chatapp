import React, { useRef, useEffect, type ChangeEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaChevronLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import ChatInput from "./ChatInput";
import LogoutModal from "./LogoutModal";
import { logout } from "../utils/auth";
import { socket } from "../utils/socket";
import { formatTime } from "../utils/formatTime";
import ChatMenuDropdown from "./ChatMenuDropDown";
import ReportUserModal from "./ReportUserModal";
import { useNotification } from "./NotificationContext";
import { NotificationContainer } from "./NotificationToast";
import api from "../api/axios";

/* ── TYPES ── */
export type Message = {
  text: string;
  sender: "me" | "other";
  time: string;
  id: string;
};

export type Conversation = {
  _id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  time?: string;
  rawTime?: string;   // ISO string — used by ChatHome for sorting
  messages: Message[];
};

const FALLBACK_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

/* ── MESSAGE BUBBLE ── */
type MessageBubbleProps = {
  msg: Message;
  otherAvatar?: string;
  myAvatar?: string;
  isFirst?: boolean;
};

const MessageBubble = ({ msg, otherAvatar, myAvatar, isFirst }: MessageBubbleProps) => {
  const isMe = msg.sender === "me";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        display: "flex", alignItems: "flex-end", marginBottom: 8,
        justifyContent: isMe ? "flex-end" : "flex-start", gap: 8,
      }}
    >
      {!isMe && (
        <img src={otherAvatar || FALLBACK_AVATAR}
          onError={e => ((e.target as HTMLImageElement).src = FALLBACK_AVATAR)}
          alt="avatar"
          style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, border: "1.5px solid rgba(0,245,160,0.2)", objectFit: "cover" }}
        />
      )}
      <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
        <div style={{
          background: isMe ? "linear-gradient(135deg, #00f5a0, #00d9f5)" : "rgba(255,255,255,0.07)",
          color: isMe ? "#000" : "#fff",
          padding: "10px 14px",
          borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          fontSize: 14, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
          fontWeight: isMe ? 500 : 400,
          border: !isMe ? "1px solid rgba(255,255,255,0.08)" : "none",
          boxShadow: isMe ? "0 4px 16px rgba(0,245,160,0.2)" : "0 2px 8px rgba(0,0,0,0.3)",
          wordBreak: "break-word",
        }}>
          {msg.text}
        </div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4, paddingLeft: 2, paddingRight: 2 }}>
          {msg.time}
        </span>
      </div>
      {isMe && (
        <img src={myAvatar || FALLBACK_AVATAR} alt="me"
          style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, border: "1.5px solid rgba(0,217,245,0.3)", objectFit: "cover" }}
        />
      )}
    </motion.div>
  );
};

/* ── CHAT ROOM ── */
type ChatRoomProps = {
  activeChat: Conversation | null;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  loggedInUser: string;
  myAvatar?: string;
  onBack?: () => void;
};

const ChatRoom = ({ activeChat, conversations, setConversations, loggedInUser, myAvatar, onBack }: ChatRoomProps) => {
  const navigate = useNavigate();
  const { success, error } = useNotification();

  const [message, setMessage]                 = useState("");
  const [showLogout, setShowLogout]           = useState(false);
  const [showMenu, setShowMenu]               = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef    = useRef<HTMLTextAreaElement | null>(null);

  const currentChat = conversations.find(c => c._id === activeChat?._id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  // ✅ NO receive_message socket listener here.
  // ChatHome owns the single source of truth for incoming messages.
  // ChatRoom only handles sending.

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value);

  const handleSend = () => {
    if (!message.trim() || !currentChat) return;
    const text = message.trim();
    const time = formatTime();
    const rawTime = new Date().toISOString();
    const messageId = Date.now().toString();

    setConversations(prev =>
      prev.map(conv =>
        conv._id === currentChat._id
          ? { ...conv, lastMessage: text, time, rawTime, messages: [...conv.messages, { text, sender: "me", time, id: messageId }] }
          : conv
      )
    );

    socket.emit("send_message", { senderId: loggedInUser, receiverId: currentChat._id, text, messageId });
    setMessage("");
  };

  const handleClearChat = async () => {
    if (!activeChat) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/messages/clear/${loggedInUser}/${activeChat._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setConversations(prev =>
        prev.map(conv => conv._id === activeChat._id ? { ...conv, messages: [], lastMessage: "", time: "", rawTime: "" } : conv)
      );
      success("Chat cleared", "All messages have been removed.");
    } catch {
      error("Failed to clear chat", "Something went wrong. Please try again.");
    }
  };

  const handleRemoveFriend = async () => {
    if (!activeChat) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/user/friends/remove/${activeChat._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setConversations(prev => prev.filter(c => c._id !== activeChat._id));
      success("Friend removed", `${activeChat.name} has been removed from your friends.`);
    } catch {
      error("Failed to remove friend", "Something went wrong. Please try again.");
    }
  };

  const handleLogout = () => { logout(); navigate("/auth/login"); };

  /* ── EMPTY STATE ── */
  if (!currentChat) {
    return (
      <>
        <NotificationContainer />
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#070a0f", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.1, 0.06] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "#00f5a0", filter: "blur(100px)", pointerEvents: "none" }}
          />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ fontSize: 56, marginBottom: 20 }}>
              💬
            </motion.div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              Select a conversation
            </div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
              Choose from your chats on the left to start messaging
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  /* ── MAIN UI ── */
  return (
    <>
      <NotificationContainer />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .messages-scroll::-webkit-scrollbar { width: 4px; }
        .messages-scroll::-webkit-scrollbar-track { background: transparent; }
        .messages-scroll::-webkit-scrollbar-thumb { background: rgba(0,245,160,0.15); border-radius: 4px; }
      `}</style>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#070a0f", height: "100vh", fontFamily: "'DM Sans', sans-serif", position: "relative" }}>

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)", position: "relative", zIndex: 10, flexShrink: 0 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.08, background: "rgba(255,255,255,0.08)" }} whileTap={{ scale: 0.94 }}
              onClick={onBack} className="lg:hidden"
              style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#00f5a0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}
            >
              <FaChevronLeft />
            </motion.button>
            <div style={{ position: "relative" }}>
              <motion.button
                whileHover={{ scale: 1.08, background: "rgba(255,255,255,0.08)" }} whileTap={{ scale: 0.94 }}
                onClick={() => setShowMenu(p => !p)}
                style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}
              >
                <RxHamburgerMenu />
              </motion.button>
              <ChatMenuDropdown
                isOpen={showMenu} onClose={() => setShowMenu(false)}
                onRemoveFriend={handleRemoveFriend}
                onReport={() => setShowReportModal(true)}
                onClearChats={handleClearChat}
              />
            </div>
          </div>

          <motion.div key={currentChat._id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <img src={currentChat.avatar || FALLBACK_AVATAR} onError={e => ((e.target as HTMLImageElement).src = FALLBACK_AVATAR)}
                style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(0,245,160,0.3)" }} alt="chat avatar"
              />
              <div style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: "#00f5a0", border: "2px solid #070a0f" }} />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>{currentChat.name}</div>
              <div style={{ color: "#00f5a0", fontSize: 11 }}>● Online</div>
            </div>
          </motion.div>

          <div style={{ width: 34 }} />
        </motion.div>

        {/* ── MESSAGES ── */}
        <div
          className="messages-scroll"
          style={{ flex: 1, overflowY: "auto", padding: "20px 20px 10px", display: "flex", flexDirection: "column", gap: 2, background: "radial-gradient(ellipse at 50% 0%, rgba(0,245,160,0.03) 0%, transparent 60%), #070a0f" }}
        >
          {currentChat.messages.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 16px" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: 1, textTransform: "uppercase" }}>Today</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </motion.div>
          )}

          {currentChat.messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", gap: 10, padding: "60px 0" }}>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                <div style={{ fontSize: 40 }}>👋</div>
              </motion.div>
              <span style={{ fontSize: 14 }}>Say hello to {currentChat.name}!</span>
            </motion.div>
          )}

          {currentChat.messages.map((msg, i) => (
            <MessageBubble key={msg.id} msg={msg} otherAvatar={currentChat.avatar} myAvatar={myAvatar} isFirst={i === 0} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* ── INPUT ── */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px", background: "rgba(255,255,255,0.02)", flexShrink: 0 }}>
          <ChatInput message={message} textareaRef={textareaRef} handleInput={handleInput} onSend={handleSend} />
        </div>

        <ReportUserModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} onSubmit={(reason, details) => console.log(reason, details)} />
        {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
      </div>
    </>
  );
};

export default ChatRoom;