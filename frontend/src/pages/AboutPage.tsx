import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/* ─── data ───────────────────────────────────────────────────────────────────── */
const TIMELINE = [
  { year: "The idea",    text: "Frustrated with chat apps that were either too bloated or too basic, we started sketching what a simpler, faster alternative could look like." },
  { year: "Building",   text: "We built StoneChat from scratch — real-time WebSocket messaging, end-to-end encryption, a friend system, and a notification layer that actually works." },
  { year: "Today",      text: "StoneChat is live and free for anyone to use. We're a small team and this is version one. There's a lot more coming." },
];

const VALUES = [
  { icon: "⚡", title: "Speed first",    desc: "Messages should arrive instantly. We built the entire architecture around real-time delivery, not retrofitted it.",                    accent: "#00f5a0" },
  { icon: "🔒", title: "Private by default", desc: "Encryption isn't a paid tier or a toggle. Every conversation on StoneChat is encrypted. Full stop.",                       accent: "#00d9f5" },
  { icon: "🎯", title: "No bloat",       desc: "We don't add features to look impressive. Every feature in StoneChat exists because it makes communication better.",            accent: "#7b2fff" },
  { icon: "🤝", title: "Built for people", desc: "Not for enterprises, not for marketing teams. StoneChat is for real people who want to stay in touch with other real people.", accent: "#00f5a0" },
];

const TEAM = [
  { name: "Ogunnaike Usman",    role: "Founder & Lead Developer",  initials: "OU", color: "#00b87a",  bio: "Built the core messaging engine and socket infrastructure. Obsessed with latency." },
  { name: "Usman Stonebridge",     role: "Frontend Engineer",         initials: "US", color: "#7b2fff",  bio: "Responsible for the UI you're looking at right now. Cares deeply about the details." },
  { name: "Olusegun Usman",  role: "Backend & Security",        initials: "OU", color: "#00d9f5",  bio: "Handles encryption, authentication, and everything that keeps your data safe." },
];

const PRINCIPLES = [
  { num: "01", title: "We don't read your messages",  body: "Our encryption means we literally can't. We don't want to and we've built the system so we have no way to." },
  { num: "02", title: "No ads. Ever.",                body: "StoneChat doesn't run ads and we have no plans to. If that changes we'll be upfront about it." },
  { num: "03", title: "We're honest about what we are", body: "StoneChat is a new product built by a small team. We're not going to pretend otherwise." },
  { num: "04", title: "Free means free",              body: "No feature gating, no artificial limits on free users, no pressure to upgrade. Chat is free." },
];

/* ─── atoms ──────────────────────────────────────────────────────────────────── */
const ShimmerBtn = ({ children, onClick, style = {} }: any) => (
  <motion.button onClick={onClick} whileHover={{ scale: 1.05, boxShadow: "0 0 44px rgba(0,245,160,0.45)" }} whileTap={{ scale: 0.97 }}
    style={{ background: "linear-gradient(135deg,#00f5a0,#00d9f5)", color: "#000", border: "none", borderRadius: 50, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,245,160,0.25)", ...style }}>
    <motion.div animate={{ x: ["-120%", "160%"] }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
      style={{ position: "absolute", inset: 0, width: "45%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)", pointerEvents: "none" }} />
    <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
  </motion.button>
);

/* ─── page ───────────────────────────────────────────────────────────────────── */
const AboutPage = () => {
  const navigate = useNavigate();

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
        <motion.div animate={{ y: [0, -24, 0] }} transition={{ duration: 10, repeat: Infinity }}
          style={{ position: "absolute", top: -80, right: -80, width: 500, height: 500, borderRadius: "50%", background: "#00d9f5", filter: "blur(130px)", opacity: 0.05 }} />
        <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          style={{ position: "absolute", bottom: -60, left: -60, width: 400, height: 400, borderRadius: "50%", background: "#7b2fff", filter: "blur(130px)", opacity: 0.06 }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)", backgroundSize: "52px 52px" }} />
      </div>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(7,10,15,0.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: 64, display: "flex", alignItems: "center", gap: 24 }}>
          <div onClick={() => navigate("/")} style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, background: "linear-gradient(90deg,#00f5a0,#00d9f5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", cursor: "pointer", flexShrink: 0 }}>
            StoneChat
          </div>
          <div style={{ flex: 1 }} />
          <motion.button onClick={() => navigate("/features")} whileHover={{ color: "#fff" }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Features
          </motion.button>
          <ShimmerBtn onClick={() => navigate("/auth/signup")} style={{ padding: "9px 22px", fontSize: 14 }}>Get Started</ShimmerBtn>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 1, padding: "110px 28px 80px", maxWidth: 800, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(0,245,160,0.07)", border: "1px solid rgba(0,245,160,0.2)", borderRadius: 50, padding: "6px 18px", fontSize: 12, color: "#00f5a0", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 32 }}>
          About us
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(48px,6vw,84px)", fontWeight: 800, letterSpacing: "-3.5px", lineHeight: 1.0, marginBottom: 28 }}>
          We built the chat app
          <br />
          <span style={{ background: "linear-gradient(90deg,#00f5a0,#00d9f5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>we wanted to use.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ color: "rgba(255,255,255,0.5)", fontSize: 19, lineHeight: 1.85, maxWidth: 640 }}>
          StoneChat started from one question: why does every messaging app feel like it's designed for someone else? Too many notifications. Too much noise. Too slow. We decided to build something different.
        </motion.p>
      </section>

      {/* Timeline */}
      <section style={{ position: "relative", zIndex: 1, padding: "60px 28px 100px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {TIMELINE.map((t, i) => (
            <motion.div key={t.year} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              style={{ display: "flex", gap: 28, marginBottom: 44, position: "relative" }}>
              {/* Line */}
              {i < TIMELINE.length - 1 && (
                <div style={{ position: "absolute", left: 23, top: 40, bottom: -24, width: 1, background: "linear-gradient(to bottom, rgba(0,245,160,0.3), rgba(0,245,160,0.03))" }} />
              )}
              {/* Dot */}
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,245,160,0.08)", border: "1px solid rgba(0,245,160,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
                {["💡", "🔨", "🚀"][i]}
              </div>
              <div>
                <div style={{ color: "#00f5a0", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>{t.year}</div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.8 }}>{t.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ position: "relative", zIndex: 1, padding: "60px 28px 100px", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(32px,4vw,52px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: 12 }}>What we believe in</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 15 }}>These aren't marketing slogans. They're the decisions we make every day.</p>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18 }}>
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ borderColor: `${v.accent}30` }}
                style={{ padding: "26px 22px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, transition: "border-color 0.25s" }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{v.icon}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{v.title}</div>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.75 }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ position: "relative", zIndex: 1, padding: "100px 28px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(32px,4vw,52px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: 12 }}>The team</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
              A small group of engineers who decided to build the messaging app we always wanted.
            </p>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {TEAM.map((m, i) => (
              <motion.div key={m.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                style={{ padding: "28px 26px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 22, position: "relative", overflow: "hidden" }}>
                {/* Ambient glow */}
                <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: m.color, filter: "blur(60px)", opacity: 0.1, pointerEvents: "none" }} />

                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                    {m.initials}
                  </div>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{m.name}</div>
                    <div style={{ color: m.color, fontSize: 12, marginTop: 2 }}>{m.role}</div>
                  </div>
                </div>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.75 }}>{m.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section style={{ position: "relative", zIndex: 1, padding: "60px 28px 100px", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 52 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(30px,3.5vw,48px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: 12 }}>Our commitments</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 15 }}>Things we promise to our users — in plain language.</p>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 16 }}>
            {PRINCIPLES.map((p, i) => (
              <motion.div key={p.num} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                style={{ display: "flex", gap: 18, padding: "22px 22px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: "rgba(0,245,160,0.4)", letterSpacing: 1, flexShrink: 0, marginTop: 2 }}>{p.num}</div>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{p.title}</div>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.75 }}>{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 1, padding: "100px 28px" }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(36px,5vw,64px)", fontWeight: 800, letterSpacing: "-3px", lineHeight: 1.05, marginBottom: 20 }}>
            Say hello.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 17, marginBottom: 40, lineHeight: 1.8, maxWidth: 480, margin: "0 auto 40px" }}>
            Sign up, add a friend, and send your first message. It takes less than a minute.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <ShimmerBtn onClick={() => navigate("/auth/signup")} style={{ padding: "16px 44px", fontSize: 16 }}>Create free account →</ShimmerBtn>
            <motion.button onClick={() => navigate("/features")} whileHover={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }} whileTap={{ scale: 0.97 }}
              style={{ padding: "16px 32px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 50, background: "none", color: "rgba(255,255,255,0.5)", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}>
              See features
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "36px 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, background: "linear-gradient(90deg,#00f5a0,#00d9f5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>StoneChat</div>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ l: "Home", h: "/" }, { l: "Features", h: "/features" }, { l: "Sign up", h: "/auth/signup" }].map(({ l, h }) => (
              <motion.a key={l} onClick={e => { e.preventDefault(); navigate(h); }} href={h} whileHover={{ color: "rgba(255,255,255,0.8)" }} style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", fontSize: 13, cursor: "pointer" }}>{l}</motion.a>
            ))}
          </div>
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>© 2025 StoneChat</div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;