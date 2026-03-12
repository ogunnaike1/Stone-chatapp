import { motion, AnimatePresence } from "framer-motion";
import { IoMdSearch, IoMdClose } from "react-icons/io";
import { FaUserCheck, FaUserPlus, FaUserClock, FaCheck, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNotification } from "./NotificationContext";
import { socket } from "../utils/socket";

type UserResult = {
  _id: string;
  username: string;
  profilePicture?: string;
};

type FindFriendsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const FALLBACK_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

/* ── User row ── */
const UserRow = ({
  user, status, onAction, onCancel, onAccept, onReject,
}: {
  user: UserResult;
  status: "friend" | "sent" | "incoming" | "none";
  onAction?: () => void;
  onCancel?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}) => {
  const [hovered, setHovered] = useState(false);

  const StatusBadge = () => {
    if (status === "friend")
      return (
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "5px 11px", borderRadius: 20,
          background: "rgba(0,245,160,0.08)", border: "1px solid rgba(0,245,160,0.2)",
          color: "#00f5a0", fontSize: 11, fontWeight: 600,
        }}>
          <FaUserCheck size={10} /> Friends
        </div>
      );
    if (status === "sent")
      return (
        <motion.button
          whileHover={{ scale: 1.04, background: "rgba(255,77,106,0.12)", borderColor: "rgba(255,77,106,0.3)", color: "#ff4d6a" }}
          whileTap={{ scale: 0.97 }}
          onClick={onCancel}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 11px", borderRadius: 20, cursor: "pointer",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s",
          }}
        >
          <FaUserClock size={10} /> Pending
        </motion.button>
      );
    if (status === "incoming")
      return (
        <div style={{ display: "flex", gap: 6 }}>
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: "0 0 14px rgba(0,245,160,0.35)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onAccept}
            style={{
              width: 30, height: 30, borderRadius: 9, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
              color: "#000", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          ><FaCheck size={11} /></motion.button>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReject}
            style={{
              width: 30, height: 30, borderRadius: 9, cursor: "pointer",
              background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.25)",
              color: "#ff4d6a", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          ><FaTimes size={11} /></motion.button>
        </div>
      );
    return (
      <motion.button
        whileHover={{ scale: 1.04, boxShadow: "0 0 16px rgba(0,245,160,0.3)" }}
        whileTap={{ scale: 0.97 }}
        onClick={onAction}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 13px", borderRadius: 20, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
          color: "#000", fontSize: 12, fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 4px 14px rgba(0,245,160,0.2)",
        }}
      >
        <FaUserPlus size={10} /> Add
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 12px", borderRadius: 14,
        background: hovered ? "rgba(255,255,255,0.04)" : "transparent",
        transition: "background 0.15s", cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative" }}>
          <img
            src={user.profilePicture || FALLBACK_AVATAR}
            onError={e => ((e.target as HTMLImageElement).src = FALLBACK_AVATAR)}
            style={{
              width: 40, height: 40, borderRadius: "50%", objectFit: "cover",
              border: status === "friend" ? "2px solid rgba(0,245,160,0.4)" : "2px solid rgba(255,255,255,0.08)",
            }}
          />
          {status === "incoming" && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                position: "absolute", top: -2, right: -2,
                width: 10, height: 10, borderRadius: "50%",
                background: "#00f5a0", border: "2px solid #070a0f",
              }}
            />
          )}
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{user.username}</div>
          {status === "incoming" && (
            <div style={{ color: "#00f5a0", fontSize: 11, marginTop: 1 }}>Wants to connect</div>
          )}
        </div>
      </div>
      <StatusBadge />
    </motion.div>
  );
};

/* ── Section header ── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 6px" }}>
    <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
    <span style={{
      color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600,
      letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap",
    }}>
      {children}
    </span>
    <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
  </div>
);

/* ── Main modal ── */
const FindFriendsModal = ({ isOpen, onClose }: FindFriendsModalProps) => {
  const { success, error } = useNotification();

  const [search, setSearch]                     = useState("");
  const [results, setResults]                   = useState<UserResult[]>([]);
  const [friends, setFriends]                   = useState<string[]>([]);
  const [sentRequests, setSentRequests]         = useState<string[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<UserResult[]>([]);
  const [allUsers, setAllUsers]                 = useState<UserResult[]>([]);
  const [loading, setLoading]                   = useState(false);
  const [searchFocused, setSearchFocused]       = useState(false);

  const tokenHeader = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
  const myId = localStorage.getItem("userId");

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      try {
        const [fr, se, inc, all] = await Promise.all([
          api.get("/user/friends", tokenHeader),
          api.get("/user/friends/requests/sent", tokenHeader),
          api.get("/user/friends/requests/incoming", tokenHeader),
          api.get("/user/users", tokenHeader),
        ]);
        setFriends(fr.data.map((u: any) => u._id));
        setSentRequests(se.data.map((u: any) => u._id));
        setIncomingRequests(inc.data);
        setAllUsers(all.data.sort((a: any, b: any) => a.username.localeCompare(b.username)));
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/user/friends/search?query=${search}`, tokenHeader);
        setResults(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ── SEND FRIEND REQUEST ── */
  const handleSendRequest = async (receiverId: string) => {
    try {
      const res = await api.post("/user/friends/request", { receiverId }, tokenHeader);
      success("Request sent!", res.data.message || "Friend request sent.");
      setSentRequests(p => [...p, receiverId]);

      // ✅ Notify receiver in real-time via socket
      socket.emit("send_friend_request", { fromId: myId, toId: receiverId });
    } catch (err: any) {
      error("Failed", err?.response?.data?.message || "Could not send request.");
    }
  };

  const handleCancelRequest = async (id: string) => {
    try {
      await api.post("/user/friends/request/cancel", { friendId: id }, tokenHeader);
      setSentRequests(p => p.filter(uid => uid !== id));
    } catch (err) { console.error(err); }
  };

  /* ── ACCEPT FRIEND REQUEST ── */
  const handleAccept = async (senderId: string) => {
    try {
      await api.post("/user/friends/accept", { senderId }, tokenHeader);
      setFriends(p => [...p, senderId]);
      setIncomingRequests(p => p.filter(u => u._id !== senderId));
      success("Friend added!", "You are now connected.");

      // ✅ Notify original sender that their request was accepted
      socket.emit("accept_friend_request", { fromId: senderId, toId: myId });
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post("/user/friends/reject", { senderId: id }, tokenHeader);
      setIncomingRequests(p => p.filter(u => u._id !== id));
    } catch (err) { console.error(err); }
  };

  const displayedUsers = search ? results : allUsers;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 400,
              background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)",
            }}
          />

          {/* Modal */}
          <div style={{
            position: "fixed", inset: 0, zIndex: 410,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px", pointerEvents: "none",
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 28 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{
                pointerEvents: "all",
                width: "100%", maxWidth: 440, maxHeight: "88vh",
                background: "rgba(7,10,15,0.98)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 24, overflow: "hidden",
                backdropFilter: "blur(28px)",
                boxShadow: "0 40px 100px rgba(0,0,0,0.85)",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex", flexDirection: "column",
              }}
            >
              {/* Top accent */}
              <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #00f5a0, #00d9f5, transparent)", flexShrink: 0 }} />

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px 16px", flexShrink: 0 }}>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" }}>
                    Find Friends
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 }}>
                    {allUsers.length > 0 ? `${allUsers.length} people on StoneChat` : "Search for people"}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.08)", color: "#fff" }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer", fontSize: 16, transition: "all 0.15s",
                  }}
                >
                  <IoMdClose />
                </motion.button>
              </div>

              {/* Search bar */}
              <div style={{ padding: "0 22px 6px", flexShrink: 0 }}>
                <motion.div
                  animate={{ boxShadow: searchFocused ? "0 0 0 2px rgba(0,245,160,0.3)" : "0 0 0 1px rgba(255,255,255,0.08)" }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: searchFocused ? "rgba(0,245,160,0.04)" : "rgba(255,255,255,0.04)",
                    borderRadius: 14, padding: "11px 14px", transition: "background 0.2s",
                  }}
                >
                  <motion.div animate={{ color: searchFocused ? "#00f5a0" : "rgba(255,255,255,0.3)" }}>
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ width: 16, height: 16, border: "2px solid rgba(0,245,160,0.3)", borderTopColor: "#00f5a0", borderRadius: "50%" }}
                      />
                    ) : <IoMdSearch size={17} />}
                  </motion.div>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search by username…"
                    style={{
                      flex: 1, background: "none", border: "none", outline: "none",
                      color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                      caretColor: "#00f5a0",
                    }}
                  />
                  <AnimatePresence>
                    {search && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                        onClick={() => setSearch("")}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex" }}
                      >
                        <IoMdClose size={15} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Scrollable content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "0 14px 16px" }} className="modal-scroll">
                <style>{`
                  .modal-scroll::-webkit-scrollbar { width: 4px; }
                  .modal-scroll::-webkit-scrollbar-track { background: transparent; }
                  .modal-scroll::-webkit-scrollbar-thumb { background: rgba(0,245,160,0.15); border-radius: 4px; }
                `}</style>

                {/* Incoming requests */}
                {incomingRequests.length > 0 && (
                  <>
                    <SectionLabel>Friend Requests · {incomingRequests.length}</SectionLabel>
                    {incomingRequests.map(user => (
                      <UserRow
                        key={user._id} user={user} status="incoming"
                        onAccept={() => handleAccept(user._id)}
                        onReject={() => handleReject(user._id)}
                      />
                    ))}
                  </>
                )}

                {/* All / search results */}
                <SectionLabel>{search ? `Results for "${search}"` : "All Users · A–Z"}</SectionLabel>

                {displayedUsers.length === 0 && search && !loading && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.25)", fontSize: 14 }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                    No users found for "{search}"
                  </motion.div>
                )}

                {displayedUsers.map((user, i) => {
                  if (user._id === myId) return null;
                  if (incomingRequests.some(u => u._id === user._id)) return null;
                  const status = friends.includes(user._id) ? "friend" : sentRequests.includes(user._id) ? "sent" : "none";
                  return (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    >
                      <UserRow
                        user={user} status={status}
                        onAction={() => handleSendRequest(user._id)}
                        onCancel={() => handleCancelRequest(user._id)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FindFriendsModal;