import React, { useRef, useEffect, type ChangeEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaChevronLeft } from "react-icons/fa6";
import { FiFile, FiDownload, FiTrash2 } from "react-icons/fi";
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
  deletedForMe?: boolean;
  deletedForEveryone?: boolean;
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

/* ── DOWNLOAD HELPER ── */
const downloadFile = async (url: string, name: string) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch {
    window.open(url, "_blank");
  }
};

/* ── ATTACHMENT RENDERERS ── */
const ImageAttachment = ({ url, name }: { url: string; name: string }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
    style={{ marginBottom: 4, position: "relative" }}>
    <img
      src={url} alt={name}
      style={{ maxWidth: "min(240px,55vw)", maxHeight: "clamp(120px,22vw,200px)", width: "100%", objectFit: "cover", borderRadius: "clamp(8px,1.5vw,14px)", display: "block", cursor: "pointer" }}
      onClick={() => window.open(url, "_blank")}
    />
    {/* Download overlay button */}
    <motion.button
      whileHover={{ opacity: 1 }} initial={{ opacity: 0 }} animate={{ opacity: 0 }}
      whileFocus={{ opacity: 1 }}
      onClick={() => downloadFile(url, name)}
      style={{ position: "absolute", top: 6, right: 6, width: 28, height: 28, borderRadius: 8, background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", backdropFilter: "blur(8px)" }}
      className="download-btn"
    >
      <FiDownload size={13} />
    </motion.button>
    {/* Always-visible small download under image */}
    <button onClick={() => downloadFile(url, name)}
      style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "'DM Sans',sans-serif", padding: 0 }}>
      <FiDownload size={11} /> Download
    </button>
  </motion.div>
);

const VideoAttachment = ({ url, name }: { url: string; name: string }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
    style={{ marginBottom: 4, maxWidth: "min(240px,55vw)" }}>
    <video src={url} controls
      style={{ width: "100%", maxHeight: "clamp(120px,22vw,200px)", borderRadius: "clamp(8px,1.5vw,14px)", display: "block", background: "#000" }} />
    <button onClick={() => downloadFile(url, name)}
      style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "'DM Sans',sans-serif", padding: 0 }}>
      <FiDownload size={11} /> Download
    </button>
  </motion.div>
);

const DocumentAttachment = ({ url, name, sizeLabel, isMe }: { url: string; name: string; sizeLabel?: string; isMe: boolean }) => (
  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
    style={{ display: "flex", alignItems: "center", gap: "clamp(6px,1.5vw,10px)", padding: "clamp(7px,1.5vw,11px) clamp(8px,2vw,13px)", borderRadius: "clamp(8px,1.5vw,13px)", background: isMe ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)", border: isMe ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(255,255,255,0.1)", marginBottom: 4, maxWidth: "min(240px,55vw)" }}>
    <div style={{ width: "clamp(26px,4vw,34px)", height: "clamp(26px,4vw,34px)", borderRadius: "clamp(6px,1vw,9px)", background: isMe ? "rgba(0,0,0,0.1)" : "rgba(0,217,245,0.12)", border: isMe ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(0,217,245,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <FiFile style={{ color: isMe ? "#000" : "#00d9f5", fontSize: "clamp(11px,2vw,15px)" }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ color: isMe ? "#000" : "#fff", fontSize: "clamp(10px,2vw,12px)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
      {sizeLabel && <div style={{ color: isMe ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.35)", fontSize: "clamp(9px,1.5vw,11px)", marginTop: 1 }}>{sizeLabel}</div>}
    </div>
    {/* Download button */}
    <motion.button
      whileHover={{ scale: 1.1, color: isMe ? "#000" : "#00d9f5" }}
      whileTap={{ scale: 0.9 }}
      onClick={() => downloadFile(url, name)}
      style={{ background: "none", border: "none", cursor: "pointer", color: isMe ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", flexShrink: 0, padding: 4 }}>
      <FiDownload style={{ fontSize: "clamp(13px,2.5vw,16px)" }} />
    </motion.button>
  </motion.div>
);

/* ── DELETE MENU ── */
const DeleteMenu = ({ isMe, onDeleteForMe, onDeleteForEveryone, onClose }: {
  isMe: boolean;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  onClose: () => void;
}) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 6 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      style={{
        position: "absolute", bottom: "calc(100% + 6px)",
        ...(isMe ? { right: 0 } : { left: 0 }),
        zIndex: 50,
        background: "rgba(7,10,15,0.97)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 12, overflow: "hidden",
        boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
        minWidth: 180,
      }}
    >
      {/* Click-away */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: -1 }} />

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#ff4d6a,#7b2fff)" }} />

      <button onClick={() => { onDeleteForMe(); onClose(); }}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.75)", fontSize: 13, textAlign: "left" }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        onMouseLeave={e => (e.currentTarget.style.background = "none")}
      >
        <FiTrash2 size={14} style={{ color: "#f5c400", flexShrink: 0 }} />
        Delete for me
      </button>

      {isMe && (
        <button onClick={() => { onDeleteForEveryone(); onClose(); }}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.75)", fontSize: 13, textAlign: "left", borderTop: "1px solid rgba(255,255,255,0.05)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,77,106,0.08)")}
          onMouseLeave={e => (e.currentTarget.style.background = "none")}
        >
          <FiTrash2 size={14} style={{ color: "#ff4d6a", flexShrink: 0 }} />
          Delete for everyone
        </button>
      )}
    </motion.div>
  </AnimatePresence>
);

/* ── MESSAGE BUBBLE ── */
const MessageBubble = ({
  msg, otherAvatar, myAvatar,
  onDeleteForMe, onDeleteForEveryone,
}: {
  msg: Message;
  otherAvatar?: string;
  myAvatar?: string;
  onDeleteForMe: (id: string) => void;
  onDeleteForEveryone: (id: string) => void;
}) => {
  const isMe = msg.sender === "me";
  const [showDelete, setShowDelete] = useState(false);

  // Deleted states
  if (msg.deletedForEveryone) {
    return (
      <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 8, paddingRight: isMe ? "clamp(28px,5vw,38px)" : 0, paddingLeft: !isMe ? "clamp(28px,5vw,38px)" : 0 }}>
        <span style={{ fontSize: "clamp(11px,2.5vw,12px)", color: "rgba(255,255,255,0.25)", fontStyle: "italic", fontFamily: "'DM Sans',sans-serif" }}>
          🚫 This message was deleted
        </span>
      </div>
    );
  }

  if (msg.deletedForMe) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: "flex", alignItems: "flex-end", marginBottom: "clamp(5px,1.2vw,9px)", justifyContent: isMe ? "flex-end" : "flex-start", gap: "clamp(4px,1vw,8px)" }}
    >
      {/* Other avatar */}
      {!isMe && (
        <img src={otherAvatar || FALLBACK_AVATAR} onError={e => ((e.target as HTMLImageElement).src = FALLBACK_AVATAR)} alt="avatar"
          style={{ width: "clamp(24px,4.5vw,32px)", height: "clamp(24px,4.5vw,32px)", borderRadius: "50%", flexShrink: 0, border: "1.5px solid rgba(0,245,160,0.2)", objectFit: "cover" }} />
      )}

      <div style={{ maxWidth: "clamp(62%,72%,76%)", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", position: "relative" }}>

        {/* Attachments */}
        {msg.attachments?.map((att, i) => {
          if (att.type === "image")    return <ImageAttachment    key={i} url={att.url} name={att.name} />;
          if (att.type === "video")    return <VideoAttachment    key={i} url={att.url} name={att.name} />;
          return <DocumentAttachment key={i} url={att.url} name={att.name} sizeLabel={att.sizeLabel} isMe={isMe} />;
        })}

        {/* Text bubble + long-press / right-click to delete */}
        {msg.text && (
          <div style={{ position: "relative" }}>
            <motion.div
              onContextMenu={e => { e.preventDefault(); setShowDelete(p => !p); }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: isMe ? "linear-gradient(135deg,#00f5a0,#00d9f5)" : "rgba(255,255,255,0.07)",
                color: isMe ? "#000" : "#fff",
                padding: "clamp(6px,1.8vw,10px) clamp(10px,2.5vw,16px)",
                borderRadius: isMe ? "clamp(14px,3vw,18px) clamp(14px,3vw,18px) clamp(3px,0.8vw,5px) clamp(14px,3vw,18px)" : "clamp(14px,3vw,18px) clamp(14px,3vw,18px) clamp(14px,3vw,18px) clamp(3px,0.8vw,5px)",
                fontSize: "clamp(11.5px,2.8vw,14.5px)",
                fontFamily: "'Plus Jakarta Sans','DM Sans',sans-serif",
                fontWeight: isMe ? 500 : 400,
                lineHeight: 1.6,
                letterSpacing: "0.01em",
                border: !isMe ? "1px solid rgba(255,255,255,0.07)" : "none",
                boxShadow: isMe ? "0 2px 12px rgba(0,245,160,0.18)" : "0 1px 6px rgba(0,0,0,0.25)",
                wordBreak: "break-word",
                cursor: "context-menu",
                userSelect: "text",
              }}
            >
              {msg.text}
            </motion.div>

            {/* Delete icon — shows on hover */}
            <motion.button
              onClick={() => setShowDelete(p => !p)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: "absolute",
                top: "50%", transform: "translateY(-50%)",
                ...(isMe ? { left: -28 } : { right: -28 }),
                background: "none", border: "none",
                color: "rgba(255,255,255,0.2)", cursor: "pointer",
                display: "flex", alignItems: "center", padding: 4,
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ff4d6a")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
            >
              <FiTrash2 size={13} />
            </motion.button>

            {/* Delete context menu */}
            {showDelete && (
              <DeleteMenu
                isMe={isMe}
                onDeleteForMe={() => onDeleteForMe(msg.id)}
                onDeleteForEveryone={() => onDeleteForEveryone(msg.id)}
                onClose={() => setShowDelete(false)}
              />
            )}
          </div>
        )}

        {/* Timestamp */}
        <span style={{ fontSize: "clamp(9px,1.8vw,10.5px)", color: "rgba(255,255,255,0.22)", marginTop: "clamp(2px,0.5vw,4px)", paddingLeft: isMe ? 0 : 3, paddingRight: isMe ? 3 : 0, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.02em" }}>
          {msg.time}
        </span>
      </div>

      {/* My avatar */}
      {isMe && (
        <img src={myAvatar || FALLBACK_AVATAR} alt="me"
          style={{ width: "clamp(24px,4.5vw,32px)", height: "clamp(24px,4.5vw,32px)", borderRadius: "50%", flexShrink: 0, border: "1.5px solid rgba(0,217,245,0.3)", objectFit: "cover" }} />
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

  // ── Listen for delete-for-everyone events from the other person ──────────────
  useEffect(() => {
    const handleDeletedForEveryone = ({ messageId }: { messageId: string }) => {
      setConversations(prev => prev.map(conv => ({
        ...conv,
        messages: conv.messages.map(m =>
          m.id === messageId ? { ...m, deletedForEveryone: true, text: "", attachments: [] } : m
        ),
      })));
    };
    socket.on("message_deleted_for_everyone", handleDeletedForEveryone);
    return () => { socket.off("message_deleted_for_everyone", handleDeletedForEveryone); };
  }, [setConversations]);

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value);

  // ── Delete for me (local only) ────────────────────────────────────────────────
  const handleDeleteForMe = (msgId: string) => {
    setConversations(prev => prev.map(conv =>
      conv._id === activeChat?._id
        ? { ...conv, messages: conv.messages.map(m => m.id === msgId ? { ...m, deletedForMe: true } : m) }
        : conv
    ));
  };

  // ── Delete for everyone (socket + backend) ────────────────────────────────────
  const handleDeleteForEveryone = async (msgId: string) => {
    // Optimistic local update
    setConversations(prev => prev.map(conv =>
      conv._id === activeChat?._id
        ? { ...conv, messages: conv.messages.map(m => m.id === msgId ? { ...m, deletedForEveryone: true, text: "", attachments: [] } : m) }
        : conv
    ));

    try {
      const token = localStorage.getItem("token");
      // Delete from DB
      await api.delete(`/messages/${msgId}`, { headers: { Authorization: `Bearer ${token}` } });
      // Notify receiver via socket
      if (activeChat) {
        socket.emit("delete_message_for_everyone", {
          messageId: msgId,
          receiverId: activeChat._id,
        });
      }
    } catch {
      error("Failed to delete", "Could not delete the message. Please try again.");
    }
  };

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
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#070a0f", fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" }}>
          <motion.div animate={{ scale: [1,1.1,1], opacity: [0.06,0.1,0.06] }} transition={{ duration: 5, repeat: Infinity }}
            style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "#00f5a0", filter: "blur(100px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px" }}>
            <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ fontSize: "clamp(36px,8vw,56px)", marginBottom: 20 }}>💬</motion.div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(16px,4vw,22px)", fontWeight: 700, color: "#fff", marginBottom: 8 }}>Select a conversation</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(12px,3vw,14px)" }}>Choose from your chats on the left to start messaging</div>
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .messages-scroll::-webkit-scrollbar { width: 4px; }
        .messages-scroll::-webkit-scrollbar-track { background: transparent; }
        .messages-scroll::-webkit-scrollbar-thumb { background: rgba(0,245,160,0.15); border-radius: 4px; }
        .msg-bubble-wrap:hover .delete-btn { opacity: 1 !important; }
      `}</style>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#070a0f", height: "100vh", fontFamily: "'DM Sans',sans-serif", position: "relative" }}>

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "clamp(10px,2vw,14px) clamp(12px,3vw,20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)", position: "relative", zIndex: 10, flexShrink: 0 }}>
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
                style={{ width: "clamp(30px,5vw,38px)", height: "clamp(30px,5vw,38px)", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(0,245,160,0.3)" }} alt="chat avatar" />
              <div style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: "#00f5a0", border: "2px solid #070a0f" }} />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: "clamp(13px,2.5vw,15px)", lineHeight: 1.2 }}>{currentChat.name}</div>
              <div style={{ color: "#00f5a0", fontSize: "clamp(9px,1.8vw,11px)" }}>● Online</div>
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
          style={{ flex: 1, overflowY: "auto", padding: "clamp(12px,3vw,20px) clamp(14px,3vw,24px) 10px", display: "flex", flexDirection: "column", gap: 2, background: "radial-gradient(ellipse at 50% 0%, rgba(0,245,160,0.03) 0%, transparent 60%), #070a0f" }}>

          {currentChat.messages.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 16px" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: "clamp(9px,2vw,11px)", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" }}>Today</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </motion.div>
          )}

          {currentChat.messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", gap: 10, padding: "60px 0" }}>
              <motion.div animate={{ y: [0,-6,0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                <div style={{ fontSize: "clamp(28px,7vw,40px)" }}>👋</div>
              </motion.div>
              <span style={{ fontSize: "clamp(12px,3vw,14px)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Say hello to {currentChat.name}!</span>
            </motion.div>
          )}

          {currentChat.messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              otherAvatar={currentChat.avatar}
              myAvatar={myAvatar}
              onDeleteForMe={handleDeleteForMe}
              onDeleteForEveryone={handleDeleteForEveryone}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "clamp(8px,2vw,12px) clamp(8px,2vw,16px)", background: "rgba(255,255,255,0.02)", flexShrink: 0 }}>
          <ChatInput message={message} textareaRef={textareaRef} handleInput={handleInput} onSend={handleSend} />
        </div>

        <ReportUserModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} onSubmit={(reason, details) => console.log(reason, details)} />
        {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
      </div>
    </>
  );
};

export default ChatRoom;