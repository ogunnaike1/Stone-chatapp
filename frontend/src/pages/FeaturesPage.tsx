import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/* ─── data ──────────────────────────────────────────────────────────────────── */
const FEATURE_SECTIONS = [
  {
    id: "messaging",
    icon: "⚡",
    accent: "#00f5a0",
    title: "Real-time Messaging",
    tagline: "Your words arrive before the thought fades.",
    description: "StoneChat uses persistent WebSocket connections to deliver messages the instant you hit send. No polling. No refresh. Just conversation at the speed of thought.",
    bullets: [
      "Sub-100ms delivery on a stable connection",
      "Live typing indicators so you know when a reply is coming",
      "Instant read receipts",
      "Messages persist across sessions — your history is always there",
      "Automatic reconnection if your connection drops",
    ],
    visual: "chat",
  },
  {
    id: "security",
    icon: "🔒",
    accent: "#00d9f5",
    title: "End-to-End Encryption",
    tagline: "Nobody reads your messages but you.",
    description: "Every conversation on StoneChat is encrypted before it leaves your device. Your messages can't be read by anyone else — including us. Privacy isn't a feature here, it's the default.",
    bullets: [
      "Messages encrypted with industry-standard protocols",
      "No plaintext storage on our servers",
      "Secure password hashing with bcrypt",
      "OTP-based password reset — no insecure email links",
      "JWT authentication with short-lived tokens",
    ],
    visual: "lock",
  },
  {
    id: "friends",
    icon: "🤝",
    accent: "#7b2fff",
    title: "Friends & Contacts",
    tagline: "Find people. Build your network.",
    description: "Search for anyone on StoneChat by their username. Send a friend request, wait for them to accept, and you're connected. It's the simplest way to control who you talk to.",
    bullets: [
      "Search users by exact or partial username",
      "Send, accept, or decline friend requests",
      "Cancel requests you've already sent",
      "Remove friends at any time",
      "See incoming and outgoing requests separately",
    ],
    visual: "friends",
  },
  {
    id: "notifications",
    icon: "🔔",
    accent: "#f5c400",
    title: "Smart Notifications",
    tagline: "Notified when it matters. Silent when it doesn't.",
    description: "StoneChat keeps you in the loop without overwhelming you. Unread message badges appear on specific conversations. Friend request counts stay separate. Everything is organised so nothing gets lost.",
    bullets: [
      "Per-conversation unread message counts",
      "Friend request badge on the add-friend button",
      "In-app notification centre with full history",
      "Toast notifications for incoming messages",
      "Badge clears automatically when you open a chat",
    ],
    visual: "notifications",
  },
  {
    id: "cross-platform",
    icon: "🌐",
    accent: "#00f5a0",
    title: "Works Everywhere",
    tagline: "Phone. Laptop. Browser. Your choice.",
    description: "StoneChat is a progressive web app built with React. It runs in any modern browser on any device. Your conversations sync automatically so you can pick up right where you left off.",
    bullets: [
      "Responsive layout for mobile and desktop",
      "Smooth mobile slide transitions",
      "Works in Chrome, Firefox, Safari, and Edge",
      "No app install required",
      "Consistent experience across all screen sizes",
    ],
    visual: "cross",
  },
];

const FAQ = [
  { q: "Is StoneChat really free?", a: "Yes, completely. No subscription, no credit card, no hidden limits. Create an account and start chatting immediately." },
  { q: "Who can see my messages?", a: "Only the people you're chatting with. Messages are encrypted and we don't store plaintext content on our servers." },
  { q: "How do I add friends?", a: "Search for someone by their username in the + button at the top of the sidebar. Send them a request and once they accept, you can start chatting." },
  { q: "Can I use StoneChat on my phone?", a: "Yes. StoneChat is fully responsive and works in any mobile browser. The layout adapts with smooth slide transitions between the conversation list and chat view." },
  { q: "What happens if I forget my password?", a: "Use the 'Forgot password' flow on the login page. We'll send a 4-digit OTP to your registered email. Enter it, set a new password, and you're back in." },
  { q: "Can I delete a conversation?", a: "Yes. Open any chat, tap the menu in the top-left, and choose 'Clear chat'. This removes the message history on your end." },
];

/* ─── shared atoms ───────────────────────────────────────────────────────────── */
const ShimmerBtn = ({ children, onClick, style = {} }: any) => (
  <motion.button onClick={onClick} whileHover={{ scale: 1.05, boxShadow: "0 0 44px rgba(0,245,160,0.45)" }} whileTap={{ scale: 0.97 }}
    style={{ background: "linear-gradient(135deg,#00f5a0,#00d9f5)", color: "#000", border: "none", borderRadius: 50, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,245,160,0.25)", ...style }}>
    <motion.div animate={{ x: ["-120%", "160%"] }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
      style={{ position: "absolute", inset: 0, width: "45%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)", pointerEvents: "none" }} />
    <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
  </motion.button>
);

/* ─── visual previews (inline illustrations) ─────────────────────────────────── */
const VisualChat = ({ accent }: { accent: string }) => {
  const msgs = [
    { from: "them", text: "hey, you free later?" },
    { from: "me",   text: "yeah, what's up?" },
    { from: "them", text: "wanna try that new app stonechat" },
    { from: "me",   text: "already on it 😄" },
  ];
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${accent},#00d9f5)` }} />
        <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>Amaka O.</span>
        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f5a0", marginLeft: 4 }} />
      </div>
      {msgs.map((m, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: m.from === "me" ? 12 : -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
          style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
          <div style={{ background: m.from === "me" ? `linear-gradient(135deg,${accent},#00d9f5)` : "rgba(255,255,255,0.07)", color: m.from === "me" ? "#000" : "#fff", padding: "10px 16px", borderRadius: m.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", fontSize: 13, fontWeight: m.from === "me" ? 600 : 400, border: m.from !== "me" ? "1px solid rgba(255,255,255,0.08)" : "none", maxWidth: "75%" }}>
            {m.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const VisualLock = ({ accent }: { accent: string }) => (
  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 28 }}>
    <div style={{ textAlign: "center", marginBottom: 20 }}>
      <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 3, repeat: Infinity }}
        style={{ width: 64, height: 64, borderRadius: "50%", background: `rgba(0,217,245,0.1)`, border: `2px solid ${accent}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 12px" }}>
        🔒
      </motion.div>
      <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Conversation encrypted</div>
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4 }}>Only you and the recipient can read this</div>
    </div>
    {["Message content", "Sender identity", "Timestamps"].map((label, i) => (
      <motion.div key={label} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, marginBottom: 8 }}>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            style={{ width: 60, height: 8, borderRadius: 4, background: `linear-gradient(90deg,${accent}50,${accent}20)` }} />
          <span style={{ fontSize: 10, color: accent }}>✓ Encrypted</span>
        </div>
      </motion.div>
    ))}
  </div>
);

const VisualFriends = ({ accent }: { accent: string }) => {
  const people = [
    { name: "Kemi A.",  color: "#00b87a", status: "friend"  },
    { name: "Jide O.",  color: "#7b2fff", status: "pending" },
    { name: "Ngozi E.", color: "#00d9f5", status: "search"  },
  ];
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
      {people.map((p, i) => (
        <motion.div key={p.name} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {p.name[0]}
          </div>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 500, flex: 1 }}>{p.name}</span>
          <div style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: p.status === "friend" ? "rgba(0,245,160,0.1)" : p.status === "pending" ? "rgba(245,196,0,0.1)" : "rgba(255,255,255,0.06)", color: p.status === "friend" ? "#00f5a0" : p.status === "pending" ? "#f5c400" : "rgba(255,255,255,0.4)", border: `1px solid ${p.status === "friend" ? "rgba(0,245,160,0.2)" : p.status === "pending" ? "rgba(245,196,0,0.2)" : "rgba(255,255,255,0.08)"}` }}>
            {p.status === "friend" ? "Friends" : p.status === "pending" ? "Pending" : "Add friend"}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const VisualNotifications = ({ accent }: { accent: string }) => {
  const notifs = [
    { icon: "💬", title: "Kemi sent a message", sub: "hey, you free?", time: "just now", color: "#00d9f5" },
    { icon: "🤝", title: "Jide wants to be friends", sub: "Friend request", time: "2m ago",  color: "#7b2fff" },
    { icon: "✅", title: "Ngozi accepted your request", sub: "You're now friends", time: "5m ago", color: "#00f5a0" },
  ];
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
      {notifs.map((n, i) => (
        <motion.div key={n.title} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
          style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: i === 0 ? `${n.color}08` : "rgba(255,255,255,0.02)", border: `1px solid ${i === 0 ? n.color + "20" : "rgba(255,255,255,0.05)"}`, borderRadius: 12, position: "relative" }}>
          {i === 0 && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "12px 0 0 12px", background: `linear-gradient(180deg,${n.color},transparent)` }} />}
          <div style={{ fontSize: 18, flexShrink: 0 }}>{n.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: i === 0 ? 600 : 400 }}>{n.title}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 }}>{n.sub}</div>
          </div>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, flexShrink: 0 }}>{n.time}</span>
        </motion.div>
      ))}
    </div>
  );
};

const VisualCross = ({ accent }: { accent: string }) => (
  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 28 }}>
    <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
      {[{ label: "Mobile", icon: "📱" }, { label: "Desktop", icon: "💻" }, { label: "Browser", icon: "🌐" }].map((d, i) => (
        <motion.div key={d.label} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
          style={{ flex: 1, textAlign: "center", padding: "14px 8px", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>{d.icon}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600 }}>{d.label}</div>
          <div style={{ fontSize: 10, color: accent, marginTop: 3 }}>✓ Supported</div>
        </motion.div>
      ))}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", background: `${accent}08`, border: `1px solid ${accent}20`, borderRadius: 10 }}>
      <span style={{ fontSize: 14 }}>🔄</span>
      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Conversations sync automatically across all devices</span>
    </div>
  </div>
);

const VISUAL_MAP: Record<string, any> = {
  chat: VisualChat, lock: VisualLock, friends: VisualFriends, notifications: VisualNotifications, cross: VisualCross,
};

/* ─── FAQ accordion ──────────────────────────────────────────────────────────── */
const FAQItem = ({ q, a, index }: { q: string; a: string; index: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}
      style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden", marginBottom: 10 }}>
      <button onClick={() => setOpen(p => !p)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", background: open ? "rgba(0,245,160,0.05)" : "rgba(255,255,255,0.02)", border: "none", cursor: "pointer", textAlign: "left", gap: 12 }}>
        <span style={{ color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} style={{ color: open ? "#00f5a0" : "rgba(255,255,255,0.3)", fontSize: 20, flexShrink: 0, lineHeight: 1 }}>+</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 22px 18px", color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.75 }}>{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── page ───────────────────────────────────────────────────────────────────── */
const FeaturesPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("messaging");

  return (
    <div style={{ background: "#070a0f", minHeight: "100vh", fontFamily: "'DM Sans',sans-serif", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070a0f; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #070a0f; }
        ::-webkit-scrollbar-thumb { background: rgba(0,245,160,0.3); border-radius: 3px; }
      `}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: "#00d9f5", filter: "blur(130px)", opacity: 0.05 }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 400, height: 400, borderRadius: "50%", background: "#7b2fff", filter: "blur(130px)", opacity: 0.06 }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)", backgroundSize: "52px 52px" }} />
      </div>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(7,10,15,0.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: 64, display: "flex", alignItems: "center", gap: 24 }}>
          <div onClick={() => navigate("/")} style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, background: "linear-gradient(90deg,#00f5a0,#00d9f5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", cursor: "pointer", flexShrink: 0 }}>
            StoneChat
          </div>
          <div style={{ flex: 1 }} />
          <motion.button onClick={() => navigate("/about")} whileHover={{ color: "#fff" }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            About
          </motion.button>
          <ShimmerBtn onClick={() => navigate("/auth/signup")} style={{ padding: "9px 22px", fontSize: 14 }}>Get Started</ShimmerBtn>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 1, padding: "100px 28px 80px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(0,245,160,0.07)", border: "1px solid rgba(0,245,160,0.2)", borderRadius: 50, padding: "6px 18px", fontSize: 12, color: "#00f5a0", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 28 }}>
          What's included
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(44px,6vw,80px)", fontWeight: 800, letterSpacing: "-3px", lineHeight: 1.05, marginBottom: 24 }}>
          Everything you need.<br />
          <span style={{ background: "linear-gradient(90deg,#00f5a0,#00d9f5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Nothing you don't.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ color: "rgba(255,255,255,0.45)", fontSize: 18, maxWidth: 560, margin: "0 auto 44px", lineHeight: 1.8 }}>
          StoneChat is built around the things that actually matter in a chat app — speed, privacy, and a clean experience.
        </motion.p>
      </section>

      {/* Feature nav tabs */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 28px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", padding: 6, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, marginBottom: 64 }}>
            {FEATURE_SECTIONS.map(f => {
              const active = activeSection === f.id;
              return (
                <motion.button key={f.id} onClick={() => setActiveSection(f.id)} whileTap={{ scale: 0.96 }}
                  style={{ padding: "10px 20px", borderRadius: 10, border: active ? `1px solid ${f.accent}30` : "1px solid transparent", background: active ? `${f.accent}10` : "transparent", color: active ? f.accent : "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s" }}>
                  <span>{f.icon}</span> {f.title}
                </motion.button>
              );
            })}
          </div>

          {/* Active feature detail */}
          <AnimatePresence mode="wait">
            {FEATURE_SECTIONS.filter(f => f.id === activeSection).map(f => {
              const Visual = VISUAL_MAP[f.visual];
              return (
                <motion.div key={f.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${f.accent}15`, border: `1px solid ${f.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{f.icon}</div>
                      <div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>{f.title}</div>
                        <div style={{ color: f.accent, fontSize: 13, marginTop: 2 }}>{f.tagline}</div>
                      </div>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.85, marginBottom: 28 }}>{f.description}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {f.bullets.map((b, i) => (
                        <motion.div key={b} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                          style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${f.accent}15`, border: `1px solid ${f.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: f.accent }} />
                          </div>
                          <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.6 }}>{b}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Visual accent={f.accent} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* All features grid */}
      <section style={{ position: "relative", zIndex: 1, padding: "100px 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(32px,4vw,52px)", fontWeight: 800, letterSpacing: "-2px" }}>
              Every feature, at a glance
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
            {FEATURE_SECTIONS.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                onClick={() => { setActiveSection(f.id); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                whileHover={{ borderColor: `${f.accent}40`, background: `${f.accent}05`, cursor: "pointer" }}
                style={{ padding: "24px 22px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, transition: "all 0.2s" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{f.title}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.65 }}>{f.description.slice(0, 80)}…</div>
                <div style={{ marginTop: 14, color: f.accent, fontSize: 12, fontWeight: 600 }}>Learn more →</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ position: "relative", zIndex: 1, padding: "40px 28px 100px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 12 }}>
              Common questions
            </h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Can't find what you're looking for? Reach out via the app.</p>
          </motion.div>
          {FAQ.map((f, i) => <FAQItem key={f.q} {...f} index={i} />)}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 28px 100px" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ maxWidth: 720, margin: "0 auto", background: "rgba(0,245,160,0.04)", border: "1px solid rgba(0,245,160,0.12)", borderRadius: 28, padding: "60px 44px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, left: -60, width: 180, height: 180, borderRadius: "50%", background: "#00f5a0", filter: "blur(70px)", opacity: 0.08, pointerEvents: "none" }} />
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 16 }}>
            Try it for yourself.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, marginBottom: 36, lineHeight: 1.75 }}>
            Free account. No setup. Just sign up and say hello to someone.
          </p>
          <ShimmerBtn onClick={() => navigate("/auth/signup")} style={{ padding: "15px 44px", fontSize: 16 }}>Create free account →</ShimmerBtn>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "36px 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, background: "linear-gradient(90deg,#00f5a0,#00d9f5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>StoneChat</div>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ l: "Home", h: "/" }, { l: "About", h: "/about" }, { l: "Sign up", h: "/auth/signup" }].map(({ l, h }) => (
              <motion.a key={l} onClick={e => { e.preventDefault(); navigate(h); }} href={h} whileHover={{ color: "rgba(255,255,255,0.8)" }} style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", fontSize: 13, cursor: "pointer" }}>{l}</motion.a>
            ))}
          </div>
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>© 2025 StoneChat</div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;