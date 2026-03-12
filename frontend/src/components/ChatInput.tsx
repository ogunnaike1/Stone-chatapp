import React, { useState, type ChangeEvent, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoSendSharp } from "react-icons/io5";
import { BsEmojiSmile, BsPaperclip, BsMic } from "react-icons/bs";

type ChatInputProps = {
  message: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  handleInput: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
};

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  textareaRef,
  handleInput,
  onSend,
}) => {
  const [focused, setFocused] = useState(false);
  const [hoverSend, setHoverSend] = useState(false);
  const hasText = message.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div style={{
      width: "100%",
      display: "flex",
      justifyContent: "center",
      padding: "0 8px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Outer glow ring when focused */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 780,
      }}>

        {/* Animated focus border */}
        <motion.div
          animate={{ opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: 18,
            background: "linear-gradient(135deg, rgba(0,245,160,0.35), rgba(0,217,245,0.35))",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Input container */}
        <div style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          background: focused ? "rgba(0,245,160,0.04)" : "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 17,
          padding: "10px 10px 10px 16px",
          backdropFilter: "blur(20px)",
          transition: "background 0.2s",
          boxShadow: focused
            ? "0 8px 32px rgba(0,245,160,0.08)"
            : "0 4px 16px rgba(0,0,0,0.3)",
        }}>

          {/* Left action icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0, paddingBottom: 2 }}>
            {[
              { icon: <BsEmojiSmile size={18} />, label: "emoji" },
              { icon: <BsPaperclip size={18} />, label: "attach" },
            ].map(({ icon, label }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.12, color: "#00f5a0" }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.3)",
                  padding: "5px 6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  transition: "color 0.15s",
                }}
              >
                {icon}
              </motion.button>
            ))}
          </div>

          {/* Divider */}
          <div style={{
            width: 1,
            height: 20,
            background: "rgba(255,255,255,0.07)",
            flexShrink: 0,
            alignSelf: "center",
          }} />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Type a message…"
            rows={1}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              resize: "none",
              color: "#fff",
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              lineHeight: 1.55,
              padding: "3px 0",
              minHeight: "26px",
              maxHeight: "96px",
              overflowY: "auto",
              caretColor: "#00f5a0",
            }}
          />

          {/* Right side: mic OR send */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, paddingBottom: 2 }}>
            <AnimatePresence mode="wait">
              {!hasText ? (
                /* Mic button */
                <motion.button
                  key="mic"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  whileHover={{ scale: 1.1, color: "#00f5a0" }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.3)",
                    padding: "5px 6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    transition: "color 0.15s",
                  }}
                >
                  <BsMic size={18} />
                </motion.button>
              ) : (
                /* Send button */
                <motion.button
                  key="send"
                  initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7, rotate: 20 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  onClick={onSend}
                  onHoverStart={() => setHoverSend(true)}
                  onHoverEnd={() => setHoverSend(false)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
                    color: "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: hoverSend
                      ? "0 0 20px rgba(0,245,160,0.45)"
                      : "0 4px 12px rgba(0,245,160,0.2)",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {/* Shimmer sweep */}
                  <motion.div
                    animate={{ x: ["-120%", "160%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "50%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                      pointerEvents: "none",
                    }}
                  />
                  <IoSendSharp size={15} style={{ position: "relative", zIndex: 1, marginLeft: 1 }} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Hint text */}
        <AnimatePresence>
          {focused && !hasText && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                bottom: -22,
                left: 16,
                fontSize: 11,
                color: "rgba(255,255,255,0.2)",
                pointerEvents: "none",
              }}
            >
              Enter to send · Shift+Enter for new line
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatInput;
