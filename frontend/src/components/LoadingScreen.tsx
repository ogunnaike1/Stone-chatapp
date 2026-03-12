import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type LoadingVariant = "app" | "chat";

interface LoadingScreenProps {
  variant?: LoadingVariant;
  /** Chat variant: name of conversation being loaded */
  chatName?: string;
  /** Chat variant: avatar URL */
  chatAvatar?: string;
  /** Optional: fires when done (for testing / demo) */
  onComplete?: () => void;
}

/* ─────────────────────────────────────────────
   PARTICLES
───────────────────────────────────────────── */
type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
};

function useParticles(count: number): Particle[] {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      color: ["#00f5a0", "#00d9f5", "#7b2fff"][Math.floor(Math.random() * 3)],
      delay: Math.random() * 4,
      duration: 4 + Math.random() * 4,
      drift: (Math.random() - 0.5) * 40,
    }))
  );
  return particles;
}

/* ─────────────────────────────────────────────
   TYPING DOTS
───────────────────────────────────────────── */
const TypingDots = () => (
  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
        transition={{
          duration: 0.7,
          repeat: Infinity,
          delay: i * 0.18,
          ease: "easeInOut",
        }}
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
          boxShadow: "0 0 6px rgba(0,245,160,0.5)",
        }}
      />
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────────── */
const ProgressBar = ({ progress }: { progress: number }) => (
  <div
    style={{
      width: "100%",
      maxWidth: 260,
      height: 3,
      background: "rgba(255,255,255,0.07)",
      borderRadius: 99,
      overflow: "hidden",
    }}
  >
    <motion.div
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        height: "100%",
        background: "linear-gradient(90deg, #00f5a0, #00d9f5)",
        borderRadius: 99,
        boxShadow: "0 0 8px rgba(0,245,160,0.6)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shimmer on bar */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          inset: 0,
          width: "50%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
        }}
      />
    </motion.div>
  </div>
);

/* ─────────────────────────────────────────────
   ROTATING RING
───────────────────────────────────────────── */
const SpinRing = ({
  size,
  strokeWidth = 2,
  color,
  duration,
  reverse = false,
}: {
  size: number;
  strokeWidth?: number;
  color: string;
  duration: number;
  reverse?: boolean;
}) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <motion.svg
      width={size}
      height={size}
      style={{ position: "absolute" }}
      animate={{ rotate: reverse ? [360, 0] : [0, 360] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circ * 0.3} ${circ * 0.7}`}
        strokeLinecap="round"
        opacity={0.6}
      />
    </motion.svg>
  );
};

/* ─────────────────────────────────────────────
   HEX GRID BACKGROUND
───────────────────────────────────────────── */
const HexGrid = () => (
  <svg
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      opacity: 0.04,
      pointerEvents: "none",
    }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        id="hex"
        x="0"
        y="0"
        width="56"
        height="48"
        patternUnits="userSpaceOnUse"
      >
        <polygon
          points="14,2 42,2 56,24 42,46 14,46 0,24"
          fill="none"
          stroke="#00f5a0"
          strokeWidth="0.8"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex)" />
  </svg>
);

/* ─────────────────────────────────────────────
   MOCK CHAT BUBBLE STREAM (chat variant)
───────────────────────────────────────────── */
const BubbleStream = () => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s < 3 ? s + 1 : 0)), 1100);
    return () => clearInterval(id);
  }, []);
  const items = [
    { from: "them", text: "Hey, loading your chat…" },
    { from: "me",   text: "Almost there 🚀"         },
    { from: "them", text: "Syncing messages…"        },
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
        maxWidth: 240,
      }}
    >
      {items.slice(0, step).map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
          style={{
            display: "flex",
            justifyContent: item.from === "me" ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{
              background:
                item.from === "me"
                  ? "linear-gradient(135deg,#00f5a0,#00d9f5)"
                  : "rgba(255,255,255,0.07)",
              color: item.from === "me" ? "#000" : "#fff",
              padding: "8px 14px",
              borderRadius:
                item.from === "me"
                  ? "16px 16px 4px 16px"
                  : "16px 16px 16px 4px",
              fontSize: 12,
              fontWeight: item.from === "me" ? 600 : 400,
              border:
                item.from !== "me"
                  ? "1px solid rgba(255,255,255,0.09)"
                  : "none",
              boxShadow:
                item.from === "me"
                  ? "0 2px 10px rgba(0,245,160,0.25)"
                  : "none",
              fontFamily: "'DM Sans',sans-serif",
              maxWidth: "85%",
            }}
          >
            {item.text}
          </div>
        </motion.div>
      ))}
      {step < 3 && step > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: "flex", justifyContent: "flex-start" }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "16px 16px 16px 4px",
              padding: "9px 14px",
            }}
          >
            <TypingDots />
          </div>
        </motion.div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   APP LOADING SCREEN
───────────────────────────────────────────── */
const APP_STEPS = [
  "Authenticating…",
  "Loading your chats…",
  "Syncing messages…",
  "Almost ready…",
];

const AppLoadingScreen = ({ onComplete }: { onComplete?: () => void }) => {
  const [progress, setProgress]   = useState(0);
  const [stepIdx, setStepIdx]     = useState(0);
  const [done, setDone]           = useState(false);
  const particles                  = useParticles(36);

  useEffect(() => {
    const targets = [22, 48, 74, 100];
    let i = 0;
    const tick = () => {
      if (i >= targets.length) return;
      setProgress(targets[i]);
      setStepIdx(i);
      i++;
      if (i < targets.length) setTimeout(tick, 900);
      else {
        setTimeout(() => {
          setDone(true);
          setTimeout(() => onComplete?.(), 600);
        }, 500);
      }
    };
    setTimeout(tick, 300);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="app-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "#070a0f",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            fontFamily: "'DM Sans',sans-serif",
            overflow: "hidden",
          }}
        >
          {/* Hex grid */}
          <HexGrid />

          {/* Ambient orbs */}
          {[
            { x: "5%",  y: "10%", s: 480, c: "#00f5a0", d: 0   },
            { x: "68%", y: "5%",  s: 380, c: "#00d9f5", d: 1.5 },
            { x: "80%", y: "62%", s: 320, c: "#7b2fff", d: 3   },
            { x: "10%", y: "70%", s: 280, c: "#00f5a0", d: 2   },
          ].map((o, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -22, 0], scale: [1, 1.06, 1] }}
              transition={{ duration: 7 + o.d, repeat: Infinity, ease: "easeInOut", delay: o.d }}
              style={{ position: "absolute", left: o.x, top: o.y, width: o.s, height: o.s, borderRadius: "50%", background: o.c, filter: "blur(110px)", opacity: 0.1, pointerEvents: "none" }}
            />
          ))}

          {/* Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              animate={{ y: [0, p.drift, 0], opacity: [0, 0.6, 0] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: "50%", background: p.color, boxShadow: `0 0 ${p.size * 2}px ${p.color}`, pointerEvents: "none" }}
            />
          ))}

          {/* Center content */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>

            {/* Logo ring stack */}
            <div style={{ position: "relative", width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SpinRing size={120} strokeWidth={1.5} color="#00f5a0" duration={4} />
              <SpinRing size={96}  strokeWidth={1.5} color="#00d9f5" duration={3} reverse />
              <SpinRing size={72}  strokeWidth={1}   color="#7b2fff" duration={5} />

              {/* Center logo */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 32px rgba(0,245,160,0.4), 0 0 64px rgba(0,245,160,0.15)",
                }}
              >
                <span style={{ fontSize: 24 }}>💬</span>
              </motion.div>
            </div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ textAlign: "center" }}
            >
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 32,
                  fontWeight: 800,
                  letterSpacing: "-1px",
                  background: "linear-gradient(90deg, #00f5a0, #00d9f5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: 6,
                }}
              >
                StoneChat
              </div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                Fast. Secure. Effortless.
              </div>
            </motion.div>

            {/* Progress */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
              <ProgressBar progress={progress} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <TypingDots />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={stepIdx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}
                  >
                    {APP_STEPS[stepIdx]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Bottom version tag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{ position: "absolute", bottom: 28, color: "rgba(255,255,255,0.15)", fontSize: 11, letterSpacing: 1 }}
          >
            v2.0.1
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─────────────────────────────────────────────
   CHAT LOADING SCREEN
───────────────────────────────────────────── */
const FALLBACK_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const ChatLoadingScreen = ({
  chatName,
  chatAvatar,
  onComplete,
}: {
  chatName?: string;
  chatAvatar?: string;
  onComplete?: () => void;
}) => {
  const [progress, setProgress] = useState(0);
  const [done, setDone]         = useState(false);
  const particles                = useParticles(20);

  useEffect(() => {
    const steps = [30, 65, 90, 100];
    let i = 0;
    const tick = () => {
      if (i >= steps.length) return;
      setProgress(steps[i++]);
      if (i < steps.length) setTimeout(tick, 700);
      else setTimeout(() => { setDone(true); setTimeout(() => onComplete?.(), 500); }, 400);
    };
    setTimeout(tick, 200);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="chat-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 0%, rgba(0,245,160,0.04) 0%, transparent 60%), #070a0f",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            fontFamily: "'DM Sans',sans-serif",
            overflow: "hidden",
          }}
        >
          {/* Subtle grid */}
          <div
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "linear-gradient(rgba(0,245,160,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,160,0.025) 1px,transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
            }}
          />

          {/* Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              animate={{ y: [0, p.drift, 0], opacity: [0, 0.5, 0] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity }}
              style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: "50%", background: p.color, boxShadow: `0 0 ${p.size * 2}px ${p.color}`, pointerEvents: "none" }}
            />
          ))}

          {/* Single ambient glow */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.1, 0.06] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "#00f5a0", filter: "blur(90px)", pointerEvents: "none" }}
          />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            style={{
              position: "relative",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: "36px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              width: "100%",
              maxWidth: 320,
              backdropFilter: "blur(20px)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Top accent */}
            <div style={{ position: "absolute", top: 0, left: "20%", width: "60%", height: 1, background: "linear-gradient(90deg, transparent, rgba(0,245,160,0.5), transparent)" }} />

            {/* Avatar stack */}
            <div style={{ position: "relative", width: 80, height: 80 }}>
              <SpinRing size={80} strokeWidth={1.5} color="#00f5a0" duration={3} />
              <SpinRing size={64} strokeWidth={1}   color="#00d9f5" duration={2.2} reverse />
              <motion.div
                animate={{ boxShadow: ["0 0 0 0 rgba(0,245,160,0.3)", "0 0 0 10px rgba(0,245,160,0)", "0 0 0 0 rgba(0,245,160,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ position: "absolute", inset: 10, borderRadius: "50%", overflow: "hidden" }}
              >
                <img
                  src={chatAvatar || FALLBACK_AVATAR}
                  onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK_AVATAR)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </motion.div>
              {/* Online dot */}
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ position: "absolute", bottom: 10, right: 10, width: 10, height: 10, borderRadius: "50%", background: "#00f5a0", border: "2px solid #070a0f", boxShadow: "0 0 8px rgba(0,245,160,0.6)" }}
              />
            </div>

            {/* Name */}
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, fontFamily: "'Syne',sans-serif", marginBottom: 4 }}>
                {chatName || "Loading chat…"}
              </div>
              <div style={{ color: "#00f5a0", fontSize: 12, display: "flex", alignItems: "center", gap: 5, justifyContent: "center" }}>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: "50%", background: "#00f5a0" }} />
                Online
              </div>
            </div>

            {/* Bubble stream */}
            <BubbleStream />

            {/* Progress */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%" }}>
              <ProgressBar progress={progress} />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TypingDots />
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
                  Fetching messages…
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─────────────────────────────────────────────
   MAIN EXPORT — unified component
───────────────────────────────────────────── */
const LoadingScreen = ({
  variant = "app",
  chatName,
  chatAvatar,
  onComplete,
}: LoadingScreenProps) => {
  if (variant === "chat") {
    return (
      <ChatLoadingScreen
        chatName={chatName}
        chatAvatar={chatAvatar}
        onComplete={onComplete}
      />
    );
  }
  return <AppLoadingScreen onComplete={onComplete} />;
};

export default LoadingScreen;

/* ─────────────────────────────────────────────
   NAMED EXPORTS for convenience
───────────────────────────────────────────── */
export { AppLoadingScreen, ChatLoadingScreen };
