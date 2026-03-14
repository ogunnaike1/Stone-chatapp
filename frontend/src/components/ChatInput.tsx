import React, { useState, useRef, type ChangeEvent, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoSendSharp } from "react-icons/io5";
import { BsEmojiSmile, BsPaperclip, BsFileEarmarkText, BsX, BsPlayCircle } from "react-icons/bs";
import { FiImage, FiFilm, FiFile } from "react-icons/fi";

export type AttachedFile = {
  id: string;
  file: File;
  type: "image" | "video" | "document";
  previewUrl?: string; // only for image/video
  name: string;
  sizeLabel: string;
};

type ChatInputProps = {
  message: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  handleInput: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: (attachments?: AttachedFile[]) => void;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileType = (file: File): AttachedFile["type"] => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
};

// ── Attachment preview chip ────────────────────────────────────────────────────
const AttachChip = ({ att, onRemove }: { att: AttachedFile; onRemove: () => void }) => {
  const isImage = att.type === "image";
  const isVideo = att.type === "video";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 4 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      style={{
        position: "relative",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}
    >
      {(isImage || isVideo) && att.previewUrl ? (
        /* Thumbnail */
        <div style={{ width: 72, height: 72, position: "relative" }}>
          {isImage ? (
            <img src={att.previewUrl} alt={att.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <>
              <video src={att.previewUrl} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} muted />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)" }}>
                <BsPlayCircle style={{ color: "#fff", fontSize: 22 }} />
              </div>
            </>
          )}
        </div>
      ) : (
        /* Document chip */
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", minWidth: 140, maxWidth: 200 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,217,245,0.12)", border: "1px solid rgba(0,217,245,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FiFile style={{ color: "#00d9f5", fontSize: 15 }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#fff", fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, marginTop: 1 }}>{att.sizeLabel}</div>
          </div>
        </div>
      )}

      {/* Remove button */}
      <motion.button
        whileHover={{ scale: 1.15, background: "rgba(255,77,106,0.9)" }}
        whileTap={{ scale: 0.9 }}
        onClick={onRemove}
        style={{
          position: "absolute", top: 3, right: 3,
          width: 18, height: 18, borderRadius: "50%",
          background: "rgba(0,0,0,0.65)", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#fff", fontSize: 10,
        }}
      >
        <BsX />
      </motion.button>
    </motion.div>
  );
};

// ── Attach menu dropdown ───────────────────────────────────────────────────────
const AttachMenu = ({
  isOpen,
  onClose,
  onImageClick,
  onVideoClick,
  onDocClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImageClick: () => void;
  onVideoClick: () => void;
  onDocClick: () => void;
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Click-away */}
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            left: 0,
            zIndex: 20,
            background: "rgba(7,10,15,0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 14,
            padding: 6,
            minWidth: 160,
            boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
          }}
        >
          {/* Top accent */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "14px 14px 0 0", background: "linear-gradient(90deg,#00f5a0,#00d9f5,#7b2fff)" }} />

          {[
            { icon: <FiImage size={15} />, label: "Image", color: "#00f5a0", action: onImageClick },
            { icon: <FiFilm size={15} />, label: "Video",  color: "#7b2fff",  action: onVideoClick },
            { icon: <FiFile  size={15} />, label: "Document", color: "#00d9f5", action: onDocClick },
          ].map(({ icon, label, color, action }) => (
            <motion.button
              key={label}
              whileHover={{ background: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { action(); onClose(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 9, border: "none",
                background: "transparent", cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
                {icon}
              </div>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 500 }}>{label}</span>
            </motion.button>
          ))}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ── Main ChatInput ─────────────────────────────────────────────────────────────
const ChatInput: React.FC<ChatInputProps> = ({ message, textareaRef, handleInput, onSend }) => {
  const [focused, setFocused]       = useState(false);
  const [hoverSend, setHoverSend]   = useState(false);
  const [attachMenu, setAttachMenu] = useState(false);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef   = useRef<HTMLInputElement>(null);

  const hasText = message.trim().length > 0;
  const hasAttachments = attachments.length > 0;
  const canSend = hasText || hasAttachments;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSend = () => {
    if (!canSend) return;
    onSend(attachments.length > 0 ? attachments : undefined);
    setAttachments([]);
    // revoke blob URLs
    attachments.forEach(a => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
  };

  const addFiles = (files: FileList | null, type: AttachedFile["type"]) => {
    if (!files) return;
    const newAtts: AttachedFile[] = Array.from(files).map(file => {
      const fileType = type === "document" ? "document" : getFileType(file);
      const previewUrl = (fileType === "image" || fileType === "video") ? URL.createObjectURL(file) : undefined;
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        type: fileType,
        previewUrl,
        name: file.name,
        sizeLabel: formatSize(file.size),
      };
    });
    setAttachments(prev => [...prev, ...newAtts]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const att = prev.find(a => a.id === id);
      if (att?.previewUrl) URL.revokeObjectURL(att.previewUrl);
      return prev.filter(a => a.id !== id);
    });
  };

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "0 8px", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files, "image")} />
      <input ref={videoInputRef} type="file" accept="video/*" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files, "video")} />
      <input ref={docInputRef}   type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.csv" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files, "document")} />

      <div style={{ position: "relative", width: "100%", maxWidth: 780 }}>

        {/* Focus border */}
        <motion.div
          animate={{ opacity: focused ? 1 : 0 }} transition={{ duration: 0.2 }}
          style={{ position: "absolute", inset: -1, borderRadius: 18, background: "linear-gradient(135deg, rgba(0,245,160,0.35), rgba(0,217,245,0.35))", pointerEvents: "none", zIndex: 0 }}
        />

        <div style={{
          position: "relative", zIndex: 1,
          background: focused ? "rgba(0,245,160,0.04)" : "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 17, backdropFilter: "blur(20px)",
          transition: "background 0.2s",
          boxShadow: focused ? "0 8px 32px rgba(0,245,160,0.08)" : "0 4px 16px rgba(0,0,0,0.3)",
        }}>

          {/* Attachment previews */}
          <AnimatePresence>
            {hasAttachments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{
                  display: "flex", gap: 8, flexWrap: "nowrap", overflowX: "auto",
                  padding: "10px 12px 0",
                  scrollbarWidth: "none",
                }}>
                  {attachments.map(att => (
                    <AttachChip key={att.id} att={att} onRemove={() => removeAttachment(att.id)} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input row */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "10px 10px 10px 16px" }}>

            {/* Left: emoji + attach (with dropdown) */}
            <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0, paddingBottom: 2 }}>
              <motion.button
                whileHover={{ scale: 1.12, color: "#00f5a0" }} whileTap={{ scale: 0.9 }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: "5px 6px", display: "flex", alignItems: "center", borderRadius: 8 }}
              >
                <BsEmojiSmile size={18} />
              </motion.button>

              {/* Attach button with dropdown */}
              <div style={{ position: "relative" }}>
                <motion.button
                  whileHover={{ scale: 1.12, color: attachMenu ? "#00f5a0" : "#00d9f5" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAttachMenu(p => !p)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: attachMenu ? "#00f5a0" : "rgba(255,255,255,0.3)", padding: "5px 6px", display: "flex", alignItems: "center", borderRadius: 8, transition: "color 0.15s" }}
                >
                  <BsPaperclip size={18} />
                </motion.button>

                <AttachMenu
                  isOpen={attachMenu}
                  onClose={() => setAttachMenu(false)}
                  onImageClick={() => imageInputRef.current?.click()}
                  onVideoClick={() => videoInputRef.current?.click()}
                  onDocClick={() => docInputRef.current?.click()}
                />
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.07)", flexShrink: 0, alignSelf: "center" }} />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={hasAttachments ? "Add a caption…" : "Type a message…"}
              rows={1}
              style={{
                flex: 1, background: "none", border: "none", outline: "none", resize: "none",
                color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400, lineHeight: 1.55, padding: "3px 0",
                minHeight: "26px", maxHeight: "96px", overflowY: "auto", caretColor: "#00f5a0",
              }}
            />

            {/* Send button — always visible when there's text OR attachments, otherwise nothing */}
            <div style={{ display: "flex", alignItems: "center", paddingBottom: 2 }}>
              <AnimatePresence mode="wait">
                {canSend ? (
                  <motion.button
                    key="send"
                    initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.7, rotate: 20 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    onClick={handleSend}
                    onHoverStart={() => setHoverSend(true)}
                    onHoverEnd={() => setHoverSend(false)}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.92 }}
                    style={{
                      width: 36, height: 36, borderRadius: 12, border: "none", cursor: "pointer",
                      background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
                      color: "#000", display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, position: "relative", overflow: "hidden",
                      boxShadow: hoverSend ? "0 0 20px rgba(0,245,160,0.45)" : "0 4px 12px rgba(0,245,160,0.2)",
                      transition: "box-shadow 0.2s",
                    }}
                  >
                    <motion.div
                      animate={{ x: ["-120%", "160%"] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                      style={{ position: "absolute", inset: 0, width: "50%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", pointerEvents: "none" }}
                    />
                    <IoSendSharp size={15} style={{ position: "relative", zIndex: 1, marginLeft: 1 }} />
                  </motion.button>
                ) : (
                  /* Empty placeholder so the layout doesn't shift */
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
                    style={{ width: 36, height: 36 }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Hint */}
        <AnimatePresence>
          {focused && !hasText && !hasAttachments && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              style={{ position: "absolute", bottom: -22, left: 16, fontSize: 11, color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}
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