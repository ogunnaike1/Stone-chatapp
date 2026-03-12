import { motion, AnimatePresence } from "framer-motion";
import { FaSignOutAlt } from "react-icons/fa";

interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal = ({ onConfirm, onCancel }: LogoutModalProps) => {
  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCancel}
        style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 360,
            background: "rgba(7,10,15,0.98)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 24,
            padding: "36px 28px 28px",
            boxShadow: "0 40px 90px rgba(0,0,0,0.85)",
            backdropFilter: "blur(24px)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            style={{
              position: "absolute", top: 0, left: "15%", width: "70%", height: 1,
              background: "linear-gradient(90deg, transparent, rgba(255,77,106,0.6), transparent)",
              transformOrigin: "left",
            }}
          />

          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.08, type: "spring", stiffness: 380, damping: 22 }}
            style={{
              width: 64, height: 64, borderRadius: 20, margin: "0 auto 22px",
              background: "rgba(255,77,106,0.1)",
              border: "1px solid rgba(255,77,106,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <FaSignOutAlt size={24} color="#ff4d6a" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <div style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 20, fontWeight: 800,
              color: "#fff", letterSpacing: "-0.4px", marginBottom: 10,
            }}>
              Log out?
            </div>
            <div style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 14, lineHeight: 1.65, marginBottom: 30,
            }}>
              You'll need to sign back in to access your chats and messages.
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            style={{ display: "flex", gap: 10 }}
          >
            {/* Cancel */}
            <motion.button
              whileHover={{ background: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onCancel}
              style={{
                flex: 1, padding: "13px 0", borderRadius: 14,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.6)",
                fontSize: 14, fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "background 0.15s",
              }}
            >
              Stay
            </motion.button>

            {/* Confirm */}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(255,77,106,0.5)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onConfirm}
              style={{
                flex: 1, padding: "13px 0", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #ff4d6a, #ff6b35)",
                color: "#fff", fontSize: 14, fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 4px 16px rgba(255,77,106,0.3)",
              }}
            >
              Log out
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LogoutModal;
