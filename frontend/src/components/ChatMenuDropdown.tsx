import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserMinus } from "react-icons/fa6";
import { MdReport } from "react-icons/md";
import { AiOutlineClear } from "react-icons/ai";

type ChatMenuDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  onRemoveFriend?: () => void;
  onReport?: () => void;
  onClearChats?: () => void;
};

/* ── Shared dark confirm modal ── */
const ConfirmModal = ({
  isOpen, onCancel, onConfirm, icon, title, description, confirmLabel, accentColor,
}: {
  isOpen: boolean; onCancel: () => void; onConfirm: () => void;
  icon: string; title: string; description: string; confirmLabel: string; accentColor: string;
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel}
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
          }}
        />
        <div style={{
          position: "fixed", inset: 0, zIndex: 310,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px",
          pointerEvents: "none",
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 24 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={e => e.stopPropagation()}
            style={{
              pointerEvents: "all",
              width: "100%", maxWidth: 360,
              background: "rgba(7,10,15,0.98)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 22,
              padding: "32px 28px 26px",
              boxShadow: "0 40px 90px rgba(0,0,0,0.85)",
              backdropFilter: "blur(24px)",
              fontFamily: "'DM Sans', sans-serif",
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            {/* Top glow line */}
            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
              style={{
                position: "absolute", top: 0, left: "10%", width: "80%", height: 1,
                background: `linear-gradient(90deg, transparent, ${accentColor}70, transparent)`,
                transformOrigin: "left",
              }}
            />

            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, type: "spring", stiffness: 380, damping: 22 }}
              style={{
                width: 60, height: 60, borderRadius: 18, margin: "0 auto 20px",
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26,
              }}
            >
              {icon}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div style={{
                color: "#fff", fontWeight: 700, fontSize: 18,
                fontFamily: "'Syne', sans-serif", marginBottom: 10, letterSpacing: "-0.3px",
              }}>
                {title}
              </div>
              <div style={{
                color: "rgba(255,255,255,0.42)", fontSize: 13.5, lineHeight: 1.65, marginBottom: 28,
              }}>
                {description}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{ display: "flex", gap: 10 }}
            >
              <motion.button
                whileHover={{ background: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.97 }}
                onClick={onCancel}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 13,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: 500,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s",
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: `0 0 24px ${accentColor}50` }}
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 13, border: "none",
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
                  color: "#000", fontSize: 14, fontWeight: 700,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  boxShadow: `0 4px 16px ${accentColor}30`,
                }}
              >
                {confirmLabel}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);

const MENU_ITEMS = [
  { key: "remove",  icon: <FaUserMinus size={13} />, label: "Remove Friend", color: "#ff4d6a", hoverBg: "rgba(255,77,106,0.07)", iconBg: "rgba(255,77,106,0.1)", border: "rgba(255,77,106,0.22)" },
  { key: "clear",   icon: <AiOutlineClear size={14}/>, label: "Clear Chat",   color: "rgba(255,255,255,0.65)", hoverBg: "rgba(255,255,255,0.05)", iconBg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.12)" },
  { key: "report",  icon: <MdReport size={15} />,    label: "Report User",  color: "#f5c400", hoverBg: "rgba(245,196,0,0.07)",  iconBg: "rgba(245,196,0,0.1)",  border: "rgba(245,196,0,0.22)" },
];

const ChatMenuDropdown = ({ isOpen, onClose, onRemoveFriend, onReport, onClearChats }: ChatMenuDropdownProps) => {
  const [showRemove, setShowRemove] = useState(false);
  const [showClear, setShowClear]   = useState(false);

  const handleClick = (key: string) => {
    onClose();
    if (key === "remove") setShowRemove(true);
    else if (key === "clear") setShowClear(true);
    else if (key === "report") onReport?.();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -12 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0,
              zIndex: 200, width: 206,
              background: "rgba(7,10,15,0.97)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18, overflow: "hidden",
              backdropFilter: "blur(28px)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.03)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {/* Top accent */}
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,77,106,0.45), transparent)" }} />

            <div style={{ padding: "8px 6px" }}>
              {MENU_ITEMS.map((item, i) => (
                <div key={item.key}>
                  {/* divider before Report */}
                  {i === 2 && (
                    <div style={{ margin: "4px 12px", height: 1, background: "rgba(255,255,255,0.06)" }} />
                  )}
                  <motion.button
                    onClick={() => handleClick(item.key)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 360, damping: 26 }}
                    whileHover={{ x: 3, backgroundColor: item.hoverBg }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px", background: "none", border: "none",
                      cursor: "pointer", color: item.color, fontSize: 13, fontWeight: 500,
                      fontFamily: "'DM Sans', sans-serif", textAlign: "left", borderRadius: 12,
                    }}
                  >
                    <span style={{
                      width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                      background: item.iconBg, border: `1px solid ${item.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {item.icon}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 11, opacity: 0.3 }}>›</span>
                  </motion.button>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(245,196,0,0.25), transparent)" }} />
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showRemove}
        onCancel={() => setShowRemove(false)}
        onConfirm={() => { onRemoveFriend?.(); setShowRemove(false); }}
        icon="👤"
        title="Remove Friend?"
        description="This person will be removed from your friends list. You can always add them back later."
        confirmLabel="Yes, Remove"
        accentColor="#ff4d6a"
      />

      <ConfirmModal
        isOpen={showClear}
        onCancel={() => setShowClear(false)}
        onConfirm={() => { onClearChats?.(); setShowClear(false); }}
        icon="🗑️"
        title="Clear All Messages?"
        description="Every message in this conversation will be permanently deleted. This cannot be undone."
        confirmLabel="Clear Chat"
        accentColor="#f5c400"
      />
    </>
  );
};

export default ChatMenuDropdown;
