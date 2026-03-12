import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ── Floating ghost chat bubbles ── */
const GHOST_BUBBLES = [
  { text: "hello?",            x: "8%",  y: "18%", delay: 0,    duration: 7,  size: 13 },
  { text: "is anyone there?",  x: "72%", y: "12%", delay: 1.2,  duration: 8,  size: 12 },
  { text: "...",               x: "15%", y: "62%", delay: 2.4,  duration: 6,  size: 16 },
  { text: "message not found", x: "65%", y: "70%", delay: 0.7,  duration: 9,  size: 11 },
  { text: "404",               x: "82%", y: "45%", delay: 3.1,  duration: 7,  size: 14 },
  { text: "lost in transit…",  x: "4%",  y: "80%", delay: 1.8,  duration: 8,  size: 11 },
  { text: "where did it go?",  x: "55%", y: "88%", delay: 2.9,  duration: 6,  size: 12 },
  { text: "💬",                x: "88%", y: "82%", delay: 0.4,  duration: 10, size: 18 },
  { text: "🔍",                x: "38%", y: "6%",  delay: 1.5,  duration: 8,  size: 17 },
];

/* ── Animated glitch text ── */
const GlitchText = () => {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const glitchCycle = () => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
      setTimeout(glitchCycle, 3000 + Math.random() * 2000);
    };
    const t = setTimeout(glitchCycle, 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Main text */}
      <span style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: "clamp(96px, 18vw, 180px)",
        fontWeight: 800,
        letterSpacing: "-8px",
        lineHeight: 1,
        background: "linear-gradient(135deg, #00f5a0 0%, #00d9f5 50%, #7b2fff 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        display: "block",
        userSelect: "none",
      }}>
        404
      </span>

      {/* Glitch layer 1 */}
      <AnimatePresence>
        {glitch && (
          <>
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
              style={{
                position: "absolute", top: -2, left: 3,
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(96px, 18vw, 180px)",
                fontWeight: 800, letterSpacing: "-8px", lineHeight: 1,
                color: "#00f5a0", display: "block",
                clipPath: "inset(30% 0 40% 0)",
                userSelect: "none", pointerEvents: "none",
                mixBlendMode: "screen",
              }}
            >
              404
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              style={{
                position: "absolute", top: 2, left: -3,
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(96px, 18vw, 180px)",
                fontWeight: 800, letterSpacing: "-8px", lineHeight: 1,
                color: "#7b2fff", display: "block",
                clipPath: "inset(60% 0 10% 0)",
                userSelect: "none", pointerEvents: "none",
                mixBlendMode: "screen",
              }}
            >
              404
            </motion.span>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Typing indicator that loops ── */
const TypingIndicator = () => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px 20px 20px 4px",
    padding: "9px 14px",
  }}>
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
        style={{ width: 7, height: 7, borderRadius: "50%", background: "#00f5a0" }}
      />
    ))}
  </div>
);

/* ── Scan line effect ── */
const ScanLine = () => (
  <motion.div
    animate={{ y: ["-100%", "100vh"] }}
    transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
    style={{
      position: "absolute", left: 0, right: 0, height: 2,
      background: "linear-gradient(90deg, transparent, rgba(0,245,160,0.15), rgba(0,245,160,0.3), rgba(0,245,160,0.15), transparent)",
      pointerEvents: "none", zIndex: 1,
    }}
  />
);

/* ── Main 404 page ── */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      position: "relative",
      width: "100%", minHeight: "100vh",
      background: "#070a0f",
      overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* ── Grid background ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,245,160,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,245,160,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
      }} />

      {/* ── Ambient orbs ── */}
      {[
        { x: "10%",  y: "15%", size: 400, color: "#00f5a0", delay: 0   },
        { x: "70%",  y: "10%", size: 320, color: "#00d9f5", delay: 1.5 },
        { x: "80%",  y: "65%", size: 280, color: "#7b2fff", delay: 3   },
        { x: "15%",  y: "72%", size: 240, color: "#00f5a0", delay: 2   },
      ].map((orb, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -24, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 7 + orb.delay, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
          style={{
            position: "absolute", left: orb.x, top: orb.y,
            width: orb.size, height: orb.size, borderRadius: "50%",
            background: orb.color, filter: "blur(90px)", opacity: 0.1,
            pointerEvents: "none", zIndex: 0,
          }}
        />
      ))}

      {/* ── Scan line ── */}
      <ScanLine />

      {/* ── Ghost bubbles ── */}
      {GHOST_BUBBLES.map((b, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.18, 0.18, 0],
            y: [10, 0, 0, -10],
            scale: [0.85, 1, 1, 0.9],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute", left: b.x, top: b.y,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px 16px 16px 4px",
            padding: "7px 12px",
            fontSize: b.size,
            color: "rgba(255,255,255,0.7)",
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
            backdropFilter: "blur(10px)",
            pointerEvents: "none", zIndex: 1,
          }}
        >
          {b.text}
        </motion.div>
      ))}

      {/* ── Main content ── */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", textAlign: "center",
        padding: "40px 24px", maxWidth: 600,
      }}>

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,77,106,0.08)",
            border: "1px solid rgba(255,77,106,0.25)",
            borderRadius: 50, padding: "6px 16px", marginBottom: 32,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff4d6a" }}
          />
          <span style={{ color: "#ff4d6a", fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
            Page not found
          </span>
        </motion.div>

        {/* 404 glitch number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.1 }}
        >
          <GlitchText />
        </motion.div>

        {/* Chat bubble context */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          style={{
            display: "flex", flexDirection: "column", alignItems: "flex-start",
            gap: 10, margin: "28px 0 36px",
          }}
        >
          {/* Received bubble */}
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#000",
            }}>SC</div>
            <div style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px 16px 16px 4px",
              padding: "10px 16px", fontSize: 14,
              color: "rgba(255,255,255,0.75)",
              maxWidth: 320,
            }}>
              Hmm, that page seems to have gone offline. Let me search for it…
            </div>
          </div>

          {/* Typing indicator */}
          <div style={{ paddingLeft: 42 }}>
            <TypingIndicator />
          </div>

          {/* System message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            style={{ paddingLeft: 42 }}
          >
            <div style={{
              background: "rgba(255,77,106,0.07)",
              border: "1px solid rgba(255,77,106,0.18)",
              borderRadius: "16px 16px 16px 4px",
              padding: "10px 16px", fontSize: 13,
              color: "rgba(255,100,130,0.9)",
            }}>
              ❌ Message delivery failed — destination not found.
            </div>
          </motion.div>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            color: "rgba(255,255,255,0.35)", fontSize: 14,
            lineHeight: 1.7, maxWidth: 380, marginBottom: 36,
          }}
        >
          The page you're looking for got lost in transit. It might have been deleted, moved, or never existed.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 32px rgba(0,245,160,0.45)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/chat")}
            style={{
              padding: "13px 28px", borderRadius: 50, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
              color: "#000", fontSize: 14, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 4px 20px rgba(0,245,160,0.25)",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Shimmer */}
            <motion.div
              animate={{ x: ["-120%", "160%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
              style={{
                position: "absolute", inset: 0, width: "45%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                pointerEvents: "none",
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>↩ Back to chat</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            style={{
              padding: "13px 28px", borderRadius: 50, cursor: "pointer",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif", transition: "background 0.18s",
            }}
          >
            ← Go back
          </motion.button>
        </motion.div>

        {/* Bottom error code */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            marginTop: 52,
            display: "flex", alignItems: "center", gap: 8,
            color: "rgba(255,255,255,0.12)", fontSize: 11,
            letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div style={{ width: 24, height: 1, background: "rgba(255,255,255,0.12)" }} />
          StoneChat · Error 404 · Page Not Found
          <div style={{ width: 24, height: 1, background: "rgba(255,255,255,0.12)" }} />
        </motion.div>
      </div>

      {/* ── Bottom vignette ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(7,10,15,0.7) 100%)",
      }} />
    </div>
  );
}
