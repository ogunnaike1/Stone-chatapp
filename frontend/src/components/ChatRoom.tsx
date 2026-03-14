import React, { useRef, useEffect, type ChangeEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaChevronLeft } from "react-icons/fa6";
import { FiFile, FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ChatInput, { type AttachedFile } from "./ChatInput";
import LogoutModal from "./LogoutModal";
import { logout } from "../utils/auth";
import { socket } from "../utils/socket";
import { formatTime } from "../utils/formatTime";
import ChatMenuDropdown from "./ChatMenuDropdown";
import ReportUserModal from "./ReportUserModal";
import { useNotification } from "./NotificationContext";
import { NotificationContainer } from "./NotificationToast";
import api from "../api/axios";

/* ── TYPES ── */
export type MessageAttachment = {
  type: "image" | "video" | "document";
  url: string;
  name: string;
  sizeLabel?: string;
};

export type Message = {
  text: string;
  sender: "me" | "other";
  time: string;
  id: string;
  attachments?: MessageAttachment[];
};

export type Conversation = {
  _id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  time?: string;
  rawTime?: string;
  messages: Message[];
};

const FALLBACK_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

/* ── ATTACHMENT RENDERERS ── */
const ImageAttachment = ({ url, name }: { url: string; name: string }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ marginBottom: 4 }}>
    <img
      src={url} alt={name}
      style={{
        maxWidth: "min(240px, 55vw)",
        maxHeight: "clamp(120px, 22vw, 200px)",
        width: "100%",
        objectFit: "cover",
        borderRadius: "clamp(8px, 1.5vw, 14px)",
        display: "block",
        cursor: "pointer",
      }}
      onClick={() => window.open(url, "_blank")}
    />
  </motion.div>
);

const VideoAttachment = ({ url, name }: { url: string; name: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
    style={{ marginBottom: 4, position: "relative", maxWidth: "min(240px, 55vw)" }}
  >
    <video
      src={url} controls
      style={{
        width: "100%",
        maxHeight: "clamp(120px, 22vw, 200px)",
        borderRadius: "clamp(8px, 1.5vw, 14px)",
        display: "block",
        background: "#000",
      }}
    />
  </motion.div>
);

const DocumentAttachment = ({ url, name, sizeLabel, isMe }: { url: string; name: string; sizeLabel?: string; isMe: boolean }) => (
  <motion.a
    href={url} target="_blank" rel="noreferrer"
    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
    whileHover={{ background: isMe ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)" }}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "clamp(6px, 1.5vw, 10px)",
      padding: "clamp(7px, 1.5vw, 11px) clamp(8px, 2vw, 13px)",
      borderRadius: "clamp(8px, 1.5vw, 13px)",
      background: isMe ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.04)",
      border: isMe ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.08)",
      textDecoration: "none",
      marginBottom: 4,
      maxWidth: "min(240px, 55vw)",
    }}
  >
    <div style={{
      width: "clamp(26px, 4vw, 34px)",
      height: "clamp(26px, 4vw, 34px)",
      borderRadius: "clamp(6px, 1vw, 9px)",
      background: isMe ? "rgba(0,0,0,0.1)" : "rgba(0,217,245,0.12)",
      border: isMe ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(0,217,245,0.2)",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <FiFile style={{ color: isMe ? "#000" : "#00d9f5", fontSize: "clamp(11px, 2vw, 15px)" }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        color: isMe ? "#000" : "#fff",
        fontSize: "clamp(10px, 2vw, 12px)",
        fontWeight: 600,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {name}
      </div>
      {sizeLabel && (
        <div style={{
          color: isMe ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.35)",
          fontSize: "clamp(9px, 1.5vw, 11px)",
          marginTop: 1,
        }}>
          {sizeLabel}
        </div>
      )}
    </div>
    <FiDownload style={{ color: isMe ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)", fontSize: "clamp(11px, 2vw, 14px)", flexShrink: 0 }} />
  </motion.a>
);

/* ── MESSAGE BUBBLE ── */
const MessageBubble = ({ msg, otherAvatar, myAvatar }: { msg: Message; otherAvatar?: string; myAvatar?: string }) => {
  const isMe = msg.sender === "me";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        display: "flex",
        alignItems: "flex-end",
        marginBottom: 8,
        justifyContent: isMe ? "flex-end" : "flex-start",
        // Avatar gap scales with viewport
        gap: "clamp(4px, 1vw, 8px)",
      }}
    >
      {/* Other person's avatar */}
      {!isMe && (
        <img
          src={otherAvatar || FALLBACK_AVATAR}
          onError={e => ((e.target as HTMLImageElement).src = FALLBACK_AVATAR)}
          alt="avatar"
          style={{
            // Avatar scales: 22px on tiny screens → 30px on desktop
            width: "clamp(22px, 4vw, 30px)",
            height: "clamp(22px, 4vw, 30px)",
            borderRadius: "50%",
            flexShrink: 0,
            border: "1.5px solid rgba(0,245,160,0.2)",
            objectFit: "cover",
          }}
        />
      )}

      <div style={{
        // Bubble column width: tighter on small screens
        maxWidth: "clamp(60%, 70%, 75%)",
        display: "flex",
        flexDirection: "column",
        alignItems: isMe ? "flex-end" : "flex-start",
      }}>
        {/* Attachments above text */}
        {msg.attachments?.map((att, i) => {
          if (att.type === "image") return <ImageAttachment key={i} url={att.url} name={att.name} />;
          if (att.type === "video") return <VideoAttachment key={i} url={att.url} name={att.name} />;
          return <DocumentAttachment key={i} url={att.url} name={att.name} sizeLabel={att.sizeLabel} isMe={isMe} />;
        })}

        {/* Text bubble */}
        {msg.text && (
          <div style={{
            background: isMe ? "linear-gradient(135deg, #00f5a0, #00d9f5)" : "rgba(255,255,255,0.07)",
            color: isMe ? "#000" : "#fff",
            // Padding scales: tighter on phones
            padding: "clamp(7px, 1.5vw, 11px) clamp(10px, 2vw, 15px)",
            borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            // Font: 12px minimum on smallest screens, 14px on tablets+, 15px max
            fontSize: "clamp(12px, 3.2vw, 15px)",
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.55,
            fontWeight: isMe ? 500 : 400,
            border: !isMe ? "1px solid rgba(255,255,255,0.08)" : "none",
            boxShadow: isMe ? "0 4px 16px rgba(0,245,160,0.2)" : "0 2px 8px rgba(0,0,0,0.3)",
            wordBreak: "break-word",
          }}>
            {msg.text}
          </div>
        )}

        {/* Timestamp */}
        <span style={{
          // Timestamp: 9px on phones → 11px on desktop
          fontSize: "clamp(9px, 2vw, 11px)",
          color: "rgba(255,255,255,0.25)",
          marginTop: "clamp(2px, 0.5vw, 4px)",
          paddingLeft: 2,
          paddingRight: 2,
        }}>
          {msg.time}
        </span>
      </div>

      {/* My avatar */}
      {isMe && (
        <img
          src={myAvatar || FALLBACK_AVATAR}
          alt="me"
          style={{
            width: "clamp(22px, 4vw, 30px)",
            height: "clamp(22px, 4vw, 30px)",
            borderRadius: "50%",
            flexShrink: 0,
            border: "1.5px solid rgba(0,217,245,0.3)",
            objectFit: "cover",
          }}
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
  const [uploading, setUploading]             = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef    = useRef<HTMLTextAreaElement | null>(null);

  const currentChat = conversations.find(c => c._id === activeChat?._id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value);

  const uploadFile = async (att: AttachedFile): Promise<MessageAttachment> => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", att.file);
    formData.append("type", att.type);
    const res = await api.post("/messages/upload", formData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    });
    return { type: att.type, url: res.data.url, name: att.name, sizeLabel: att.sizeLabel };
  };

  const handleSend = async (attachedFiles?: AttachedFile[]) => {
    const text = message.trim();
    if (!text && (!attachedFiles || attachedFiles.length === 0)) return;
    if (!currentChat) return;

    const time      = formatTime();
    const rawTime   = new Date().toISOString();
    const messageId = Date.now().toString();

    const optimisticAttachments: MessageAttachment[] | undefined = attachedFiles?.map(a => ({
      type: a.type, url: a.previewUrl ?? "", name: a.name, sizeLabel: a.sizeLabel,
    }));

    setConversations(prev => prev.map(conv =>
      conv._id === currentChat._id
        ? { ...conv, lastMessage: text || `📎 ${attachedFiles?.[0]?.name ?? "File"}`, time, rawTime, messages: [...conv.messages, { text, sender: "me", time, id: messageId, attachments: optimisticAttachments }] }
        : conv
    ));
    setMessage("");

    let uploadedAttachments: MessageAttachment[] | undefined;
    if (attachedFiles && attachedFiles.length > 0) {
      setUploading(true);
      try {
        uploadedAttachments = await Promise.all(attachedFiles.map(uploadFile));
        setConversations(prev => prev.map(conv =>
          conv._id === currentChat._id
            ? { ...conv, messages: conv.messages.map(m => m.id === messageId ? { ...m, attachments: uploadedAttachments } : m) }
            : conv
        ));
      } catch {
        error("Upload failed", "Could not upload one or more files. Please try again.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    socket.emit("send_message", {
      senderId: loggedInUser, receiverId: currentChat._id,
      text, messageId, attachments: uploadedAttachments ?? [],
    });
  };

  const handleClearChat = async () => {
    if (!activeChat) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/messages/clear/${loggedInUser}/${activeChat._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setConversations(prev => prev.map(conv => conv._id === activeChat._id ? { ...conv, messages: [], lastMessage: "", time: "", rawTime: "" } : conv));
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#070a0f", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" }}>
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.1, 0.06] }} transition={{ duration: 5, repeat: Infinity }}
            style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "#00f5a0", filter: "blur(100px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ fontSize: "clamp(36px, 8vw, 56px)", marginBottom: 20 }}>💬</motion.div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(16px, 4vw, 22px)", fontWeight: 700, color: "#fff", marginBottom: 8 }}>Select a conversation</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(12px, 3vw, 14px)" }}>Choose from your chats on the left to start messaging</div>
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

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "clamp(10px, 2vw, 14px) clamp(12px, 3vw, 20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)", position: "relative", zIndex: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <motion.button whileHover={{ scale: 1.08, background: "rgba(255,255,255,0.08)" }} whileTap={{ scale: 0.94 }}
              onClick={onBack} className="lg:hidden"
              style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#00f5a0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>
              <FaChevronLeft />
            </motion.button>
            <div style={{ position: "relative" }}>
              <motion.button whileHover={{ scale: 1.08, background: "rgba(255,255,255,0.08)" }} whileTap={{ scale: 0.94 }}
                onClick={() => setShowMenu(p => !p)}
                style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>
                <RxHamburgerMenu />
              </motion.button>
              <ChatMenuDropdown isOpen={showMenu} onClose={() => setShowMenu(false)} onRemoveFriend={handleRemoveFriend} onReport={() => setShowReportModal(true)} onClearChats={handleClearChat} />
            </div>
          </div>

          <motion.div key={currentChat._id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <img src={currentChat.avatar || FALLBACK_AVATAR} onError={e => ((e.target as HTMLImageElement).src = FALLBACK_AVATAR)}
                style={{ width: "clamp(30px, 5vw, 38px)", height: "clamp(30px, 5vw, 38px)", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(0,245,160,0.3)" }} alt="chat avatar" />
              <div style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: "#00f5a0", border: "2px solid #070a0f" }} />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: "clamp(13px, 2.5vw, 15px)", lineHeight: 1.2 }}>{currentChat.name}</div>
              <div style={{ color: "#00f5a0", fontSize: "clamp(9px, 1.8vw, 11px)" }}>● Online</div>
            </div>
          </motion.div>

          <div style={{ width: 34 }} />
        </motion.div>

        {/* Upload indicator */}
        <AnimatePresence>
          {uploading && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 28, opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(0,245,160,0.08)", borderBottom: "1px solid rgba(0,245,160,0.15)", overflow: "hidden", flexShrink: 0 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(0,245,160,0.3)", borderTopColor: "#00f5a0" }} />
              <span style={{ color: "#00f5a0", fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>Uploading files…</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MESSAGES */}
        <div className="messages-scroll"
          style={{ flex: 1, overflowY: "auto", padding: "clamp(12px, 3vw, 20px) clamp(10px, 3vw, 20px) 10px", display: "flex", flexDirection: "column", gap: 2, background: "radial-gradient(ellipse at 50% 0%, rgba(0,245,160,0.03) 0%, transparent 60%), #070a0f" }}>

          {currentChat.messages.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 16px" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "rgba(255,255,255,0.2)", letterSpacing: 1, textTransform: "uppercase" }}>Today</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </motion.div>
          )}

          {currentChat.messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", gap: 10, padding: "60px 0" }}>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                <div style={{ fontSize: "clamp(28px, 7vw, 40px)" }}>👋</div>
              </motion.div>
              <span style={{ fontSize: "clamp(12px, 3vw, 14px)" }}>Say hello to {currentChat.name}!</span>
            </motion.div>
          )}

          {currentChat.messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} otherAvatar={currentChat.avatar} myAvatar={myAvatar} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "clamp(8px, 2vw, 12px) clamp(8px, 2vw, 16px)", background: "rgba(255,255,255,0.02)", flexShrink: 0 }}>
          <ChatInput message={message} textareaRef={textareaRef} handleInput={handleInput} onSend={handleSend} />
        </div>

        <ReportUserModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} onSubmit={(reason, details) => console.log(reason, details)} />
        {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
      </div>
    </>
  );
};

export default ChatRoom;