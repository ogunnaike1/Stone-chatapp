import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdSearch } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import LogoutModal from "./LogoutModal";
import { logout } from "../utils/auth";
import type { Conversation } from "./ChatRoom";
import SettingsForm from "./SettingsForm";
import ChatDropdown from "./ChatDropDown";
import FindFriendsModal from "./FindFriendsModal";

type MessageListProps = {
  conversations: Conversation[];
  setActiveChat: (chat: Conversation) => void;
  activeChatId?: string;
};

const MessageList = ({ conversations, setActiveChat, activeChatId }: MessageListProps) => {
  const [showLogout, setShowLogout]       = useState(false);
  const [showDropDown, setShowDropDown]   = useState(false);
  const [showFindFriend, setShowFindFriend] = useState(false);
  const [showSetting, setShowSettings]    = useState(false);
  const [searchTerm, setSearchTerm]       = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/auth/login"); };

  const sortedConversations = useMemo(() => {
    return [...conversations]
      .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      });
  }, [conversations, searchTerm]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .msg-list-scroll::-webkit-scrollbar { width: 4px; }
        .msg-list-scroll::-webkit-scrollbar-track { background: transparent; }
        .msg-list-scroll::-webkit-scrollbar-thumb { background: rgba(0,245,160,0.2); border-radius: 4px; }
        .msg-list-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,245,160,0.4); }
        ::placeholder { color: rgba(255,255,255,0.25) !important; }
      `}</style>

      <div style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#070a0f",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Subtle background orb */}
        <motion.div
          animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: "-60px", left: "-60px",
            width: 260, height: 260, borderRadius: "50%",
            background: "#00f5a0", filter: "blur(90px)", opacity: 0.07, pointerEvents: "none",
          }}
        />

        {/* ── HEADER ── */}
        <div style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
          zIndex: 2,
          flexShrink: 0,
        }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 20,
                fontWeight: 800,
                background: "linear-gradient(90deg, #00f5a0, #00d9f5)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
              StoneChat
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              {/* Add friend button */}
              <motion.button
                whileHover={{ scale: 1.08, background: "rgba(0,245,160,0.15)" }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowFindFriend(true)}
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "rgba(0,245,160,0.08)",
                  border: "1px solid rgba(0,245,160,0.2)",
                  color: "#00f5a0", display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", fontSize: 14,
                }}
              >
                <FaPlus />
              </motion.button>

              {/* Menu button */}
              <div style={{ position: "relative" }}>
                <motion.button
                  whileHover={{ scale: 1.08, background: "rgba(255,255,255,0.08)" }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setShowDropDown(p => !p)}
                  style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer", fontSize: 16,
                  }}
                >
                  <BsThreeDotsVertical />
                </motion.button>
                <ChatDropdown
                  isOpen={showDropDown}
                  onFindFriends={() => { setShowDropDown(false); setShowFindFriend(true); }}
                  onSettings={() => { setShowDropDown(false); setShowSettings(true); }}
                  onLogout={() => { setShowDropDown(false); setShowLogout(true); }}
                />
              </div>
            </motion.div>
          </div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ position: "relative" }}
          >
            {/* Focus ring */}
            <motion.div
              animate={{ opacity: searchFocused ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute", inset: -1, borderRadius: 13,
                background: "linear-gradient(135deg, rgba(0,245,160,0.3), rgba(0,217,245,0.3))",
                pointerEvents: "none",
              }}
            />
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: searchFocused ? "rgba(0,245,160,0.05)" : "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderColor: searchFocused ? "transparent" : "rgba(255,255,255,0.08)",
              borderRadius: 12, padding: "9px 14px",
              transition: "background 0.2s",
              position: "relative", zIndex: 1,
            }}>
              <IoMdSearch style={{ color: searchFocused ? "#00f5a0" : "rgba(255,255,255,0.3)", fontSize: 18, flexShrink: 0, transition: "color 0.2s" }} />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search conversations…"
                style={{
                  background: "none", border: "none", outline: "none",
                  color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  width: "100%",
                }}
              />
              <AnimatePresence>
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={() => setSearchTerm("")}
                    style={{
                      background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%",
                      width: 18, height: 18, color: "rgba(255,255,255,0.5)", cursor: "pointer",
                      fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, padding: 0,
                    }}
                  >×</motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Conversations count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: 1, textTransform: "uppercase" }}
          >
            {sortedConversations.length} conversation{sortedConversations.length !== 1 ? "s" : ""}
          </motion.div>
        </div>

        {/* ── CHAT LIST ── */}
        <div className="msg-list-scroll" style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          <AnimatePresence mode="popLayout">
            {sortedConversations.length > 0 ? (
              sortedConversations.map((conv, i) => {
                const isActive = conv._id === activeChatId;
                return (
                  <motion.div
                    key={conv._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    onClick={() => setActiveChat(conv)}
                    whileHover={{ background: isActive ? "rgba(0,245,160,0.08)" : "rgba(255,255,255,0.04)" }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 20px",
                      cursor: "pointer",
                      background: isActive ? "rgba(0,245,160,0.07)" : "transparent",
                      borderLeft: isActive ? "2px solid #00f5a0" : "2px solid transparent",
                      transition: "background 0.2s, border-color 0.2s",
                      position: "relative",
                    }}
                  >
                    {/* Avatar with online dot */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        style={{
                          width: 44, height: 44, borderRadius: "50%", objectFit: "cover",
                          border: isActive ? "2px solid rgba(0,245,160,0.5)" : "2px solid rgba(255,255,255,0.08)",
                          transition: "border-color 0.2s",
                        }}
                        onError={e => ((e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/149/149071.png")}
                      />
                      <div style={{
                        position: "absolute", bottom: 1, right: 1,
                        width: 10, height: 10, borderRadius: "50%",
                        background: "#00f5a0",
                        border: "2px solid #070a0f",
                      }} />
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{
                          color: isActive ? "#fff" : "rgba(255,255,255,0.85)",
                          fontSize: 14, fontWeight: 600,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {conv.name}
                        </span>
                        <span style={{ color: isActive ? "#00f5a0" : "rgba(255,255,255,0.25)", fontSize: 11, flexShrink: 0, marginLeft: 8 }}>
                          {conv.time || ""}
                        </span>
                      </div>
                      <p style={{
                        color: "rgba(255,255,255,0.35)", fontSize: 12,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        margin: 0,
                      }}>
                        {conv.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: "center", padding: "48px 24px", color: "rgba(255,255,255,0.2)" }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                <div style={{ fontSize: 14 }}>
                  {searchTerm ? `No results for "${searchTerm}"` : "No conversations yet"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modals */}
        {showFindFriend && <FindFriendsModal isOpen={showFindFriend} onClose={() => setShowFindFriend(false)} />}
        {showSetting && <SettingsForm onCloseSettings={() => setShowSettings(false)} />}
        {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
      </div>
    </>
  );
};

export default MessageList;
