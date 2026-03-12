import { motion, AnimatePresence } from "framer-motion";
import { FaUserPlus, FaCog, FaSignOutAlt } from "react-icons/fa";

type ChatDropdownProps = {
  isOpen: boolean;
  onFindFriends: () => void;
  onSettings: () => void;
  onLogout: () => void;
};

const ITEMS = [
  {
    key: "friends",
    icon: <FaUserPlus size={13} />,
    label: "Find Friends",
    color: "#00f5a0",
    hoverBg: "rgba(0,245,160,0.07)",
    iconBg: "rgba(0,245,160,0.1)",
    border: "rgba(0,245,160,0.2)",
  },
  {
    key: "settings",
    icon: <FaCog size={13} />,
    label: "Settings",
    color: "#00d9f5",
    hoverBg: "rgba(0,217,245,0.07)",
    iconBg: "rgba(0,217,245,0.1)",
    border: "rgba(0,217,245,0.2)",
  },
  {
    key: "logout",
    icon: <FaSignOutAlt size={13} />,
    label: "Logout",
    color: "#ff4d6a",
    hoverBg: "rgba(255,77,106,0.07)",
    iconBg: "rgba(255,77,106,0.1)",
    border: "rgba(255,77,106,0.2)",
  },
];

const ChatDropdown = ({ isOpen, onFindFriends, onSettings, onLogout }: ChatDropdownProps) => {
  const handlers: Record<string, () => void> = {
    friends: onFindFriends,
    settings: onSettings,
    logout: onLogout,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: -12 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            zIndex: 200,
            width: 210,
            background: "rgba(7,10,15,0.97)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            overflow: "hidden",
            backdropFilter: "blur(28px)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.03)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {/* Top accent line */}
          <div style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(0,245,160,0.5), rgba(0,217,245,0.3), transparent)",
          }} />

          <div style={{ padding: "8px 6px" }}>
            {ITEMS.map((item, i) => (
              <motion.button
                key={item.key}
                onClick={handlers[item.key]}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 360, damping: 26 }}
                whileHover={{ x: 3, backgroundColor: item.hoverBg }}
                whileTap={{ scale: 0.96 }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: item.color,
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: "left",
                  borderRadius: 12,
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
            ))}
          </div>

          <div style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(255,77,106,0.25), transparent)",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatDropdown;
