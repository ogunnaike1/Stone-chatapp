import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const NAV_LINKS = ["Features", "Pricing", "About", "Blog"];

const FEATURES = [
  {
    icon: "⚡",
    title: "Real-time Messaging",
    desc: "Sub-50ms delivery across the globe. Your words arrive before the thought fades.",
  },
  {
    icon: "🔒",
    title: "End-to-End Encrypted",
    desc: "Military-grade encryption on every byte. Zero knowledge architecture by default.",
  },
  {
    icon: "🌐",
    title: "Cross-Platform Sync",
    desc: "Seamlessly move between phone, desktop, and web. Your flow never breaks.",
  },
  {
    icon: "🤖",
    title: "AI Co-Pilot",
    desc: "Your built-in assistant drafts, summarizes, and translates on the fly.",
  },
  {
    icon: "🎙️",
    title: "Voice & Video",
    desc: "Crystal clear calls with adaptive bitrate. No lag. No drop-offs.",
  },
  {
    icon: "📁",
    title: "File Vaults",
    desc: "Store and share up to 10GB per conversation. Never lose a file again.",
  },
];

const TESTIMONIALS = [
  {
    name: "Aria Chen",
    role: "Product Lead @ Figma",
    text: "Switched our entire team to StoneChat. The speed is unreal and the UI is chef's kiss.",
    avatar: "AC",
  },
  {
    name: "Marcus Lee",
    role: "CTO @ Drift",
    text: "Finally a chat app that doesn't make me want to throw my laptop. 10/10.",
    avatar: "ML",
  },
  {
    name: "Priya Nair",
    role: "Founder @ Loops",
    text: "StoneChat replaced Slack, Discord, AND WhatsApp for us. Wildly good product.",
    avatar: "PN",
  },
];

const MOCK_MESSAGES = [
  { from: "them", text: "hey, you seeing those new StoneChat features? 👀", delay: 0 },
  { from: "me", text: "yeah omg the AI reply drafts are insane", delay: 0.6 },
  { from: "them", text: "and it's actually fast this time", delay: 1.2 },
  { from: "me", text: "no more lag 🙏 finally", delay: 1.8 },
  { from: "them", text: "this is replacing everything lol", delay: 2.4 },
];

function FloatingOrb({ x, y, size, color, delay }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(80px)",
        opacity: 0.15,
        pointerEvents: "none",
      }}
      animate={{
        y: [0, -30, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

function MockChat() {
  const [visible, setVisible] = useState([]);
  useEffect(() => {
    MOCK_MESSAGES.forEach((msg, i) => {
      setTimeout(() => {
        setVisible((v) => [...v, i]);
      }, msg.delay * 1000 + 800);
    });
  }, []);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        padding: "24px 20px",
        width: 320,
        backdropFilter: "blur(20px)",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
      }}
    >
      {/* Chat header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          ZN
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>StoneChat Team</div>
          <div style={{ color: "#00f5a0", fontSize: 11 }}>● Online</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
      </div>
      {/* Messages */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
        <AnimatePresence>
          {MOCK_MESSAGES.map((msg, i) =>
            visible.includes(i) ? (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                  display: "flex",
                  justifyContent: msg.from === "me" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    background:
                      msg.from === "me"
                        ? "linear-gradient(135deg, #00f5a0, #00d9f5)"
                        : "rgba(255,255,255,0.08)",
                    color: msg.from === "me" ? "#000" : "#fff",
                    padding: "8px 14px",
                    borderRadius: msg.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    fontSize: 13,
                    maxWidth: "80%",
                    fontWeight: msg.from === "me" ? 500 : 400,
                  }}
                >
                  {msg.text}
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>
      {/* Input bar */}
      <div
        style={{
          marginTop: 16,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 50,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, flex: 1 }}>
          Type a message...
        </span>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
          }}
        >
          ↑
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6, scale: 1.02 }}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "28px 24px",
        cursor: "default",
        transition: "border-color 0.3s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(0,245,160,0.05), transparent)",
          opacity: 0,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>
        {title}
      </div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7 }}>{desc}</div>
    </motion.div>
  );
}

function TestimonialCard({ name, role, text, avatar, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "24px",
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>
        "{text}"
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#000",
          }}
        >
          {avatar}
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{name}</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{role}</div>
        </div>
      </div>
    </motion.div>
  );
}

  const ChatLanding = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(0,0,0,0)", "rgba(0,0,0,0.85)"]);
  const heroY = useTransform(scrollY, [0, 400], [0, -80]);

  return (
    <div
      style={{
        background: "#070a0f",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        color: "#fff",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #070a0f; }
        ::-webkit-scrollbar-thumb { background: #00f5a0; border-radius: 3px; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Floating Orbs Background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <FloatingOrb x="10%" y="15%" size={400} color="#00f5a0" delay={0} />
        <FloatingOrb x="65%" y="5%" size={350} color="#00d9f5" delay={1.5} />
        <FloatingOrb x="80%" y="60%" size={300} color="#7b2fff" delay={3} />
        <FloatingOrb x="20%" y="70%" size={250} color="#00f5a0" delay={2} />
      </div>

      {/* NAV */}
      <motion.nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: navBg,
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 22,
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
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: "flex", gap: 36, alignItems: "center" }}
            className="nav-links"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.6)")}
              >
                {link}
              </a>
            ))}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
                color: "#000",
                border: "none",
                borderRadius: 50,
                padding: "9px 22px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </motion.nav>

      {/* HERO */}
      <motion.section
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 80px",
          y: heroY,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 60,
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(0,245,160,0.08)",
              border: "1px solid rgba(0,245,160,0.2)",
              borderRadius: 50,
              padding: "6px 16px",
              fontSize: 13,
              color: "#00f5a0",
              fontWeight: 500,
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#00f5a0" }}
            />
            v2.0 is live — faster, smarter, better
          </motion.div>

          {/* Headline */}
          <div style={{ textAlign: "center" }}>
            {["Talk faster.", "Think together."].map((line, i) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <span
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "clamp(52px, 8vw, 96px)",
                    fontWeight: 800,
                    letterSpacing: "-3px",
                    lineHeight: 1,
                    display: "block",
                    background: i === 1 ? "linear-gradient(90deg, #00f5a0, #00d9f5)" : "#fff",
                    WebkitBackgroundClip: i === 1 ? "text" : undefined,
                    WebkitTextFillColor: i === 1 ? "transparent" : undefined,
                  }}
                >
                  {line}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.5)",
              fontSize: "clamp(16px, 2vw, 20px)",
              maxWidth: 560,
              lineHeight: 1.7,
              marginTop: -20,
            }}
          >
            The chat app built for teams that move at the speed of thought. Encrypted, instant, and intelligently designed.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0,245,160,0.4)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
                color: "#000",
                border: "none",
                borderRadius: 50,
                padding: "16px 36px",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Start for free →
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 50,
                padding: "16px 36px",
                fontSize: 16,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "background 0.2s",
              }}
            >
              Watch demo
            </motion.button>
          </motion.div>

          {/* Mock Chat UI */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "relative" }}
          >
            {/* Glow behind chat */}
            <div
              style={{
                position: "absolute",
                inset: -40,
                background: "radial-gradient(ellipse, rgba(0,245,160,0.12), transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <MockChat />
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}
          >
            <div style={{ display: "flex" }}>
              {["#e91e8c", "#9c27b0", "#2196f3", "#4caf50", "#ff9800"].map((c, i) => (
                <div
                  key={c}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: c,
                    border: "2px solid #070a0f",
                    marginLeft: i === 0 ? 0 : -10,
                    zIndex: 5 - i,
                    position: "relative",
                  }}
                />
              ))}
            </div>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
              Trusted by <strong style={{ color: "#fff" }}>50,000+</strong> teams worldwide
            </span>
          </motion.div>
        </div>
      </motion.section>

      {/* FEATURES */}
      <section style={{ position: "relative", zIndex: 1, padding: "100px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 64 }}
          >
            <div
              style={{
                display: "inline-block",
                color: "#00f5a0",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Everything you need
            </div>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(36px, 5vw, 60px)",
                fontWeight: 800,
                letterSpacing: "-2px",
                lineHeight: 1.1,
              }}
            >
              Built for the way <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #00f5a0, #00d9f5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                real teams work.
              </span>
            </h2>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 56 }}
          >
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(32px, 4vw, 52px)",
                fontWeight: 800,
                letterSpacing: "-2px",
              }}
            >
              People love StoneChat.
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={t.name} {...t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ position: "relative", zIndex: 1, padding: "100px 24px 140px" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            maxWidth: 800,
            margin: "0 auto",
            background: "rgba(0,245,160,0.05)",
            border: "1px solid rgba(0,245,160,0.15)",
            borderRadius: 32,
            padding: "72px 40px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background shimmer */}
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "40%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(0,245,160,0.06), transparent)",
              pointerEvents: "none",
            }}
          />
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(36px, 5vw, 60px)",
              fontWeight: 800,
              letterSpacing: "-2px",
              marginBottom: 20,
            }}
          >
            Start chatting.
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #00f5a0, #00d9f5)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Free forever.
            </span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, marginBottom: 40, lineHeight: 1.7 }}>
            No credit card required. Set up your team in under 60 seconds.
          </p>
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: "0 0 50px rgba(0,245,160,0.5)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
              color: "#000",
              border: "none",
              borderRadius: 50,
              padding: "18px 48px",
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Create your workspace →
          </motion.button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "32px 24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 20,
            fontWeight: 800,
            background: "linear-gradient(90deg, #00f5a0, #00d9f5)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          StoneChat
        </div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
          © 2026 StoneChat Inc. Built with ♥ for fast teams.
        </div>
      </footer>
    </div>
  );
}

export default ChatLanding;