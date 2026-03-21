import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

type MockMessage = { from: string; text: string; delay: number };

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "About",    href: "/about"    },
];

const FEATURES = [
  { icon:"⚡", title:"Real-time Messaging",  desc:"Messages arrive instantly — no polling, no delay. Powered by WebSockets so every conversation feels live.",    accent:"#00f5a0" },
  { icon:"🔒", title:"End-to-End Encrypted", desc:"Every message is encrypted before it leaves your device. Nobody — not even us — can read your conversations.", accent:"#00d9f5" },
  { icon:"🌐", title:"Cross-Platform Sync",  desc:"Start a conversation on your phone and pick it up on your laptop. Your history follows you everywhere.",        accent:"#7b2fff" },
  { icon:"🤝", title:"Friends & Contacts",   desc:"Search for people by username, send friend requests, and build your network at your own pace.",                accent:"#00f5a0" },
  { icon:"🔔", title:"Smart Notifications",  desc:"Get notified when it matters. Unread badges, message previews, and friend request alerts — all in one place.",accent:"#00d9f5" },
  { icon:"📁", title:"Media Sharing",        desc:"Send images, files, and links inline. Everything stays organised inside the conversation where it belongs.",    accent:"#7b2fff" },
];

const TESTIMONIALS = [
  { name:"Abdul Satar",       role:"Software Engineer",    text:"StoneChat is the first app that felt genuinely fast from day one. The UI is clean and the notifications actually work.", avatar:"AS", color:"#00b87a" },
  { name:"Amosu Oyindamola",  role:"Social Media Manager", text:"The friend request system is smooth and message delivery is instant. Exactly what I needed to stay in touch.",           avatar:"AO", color:"#7b2fff" },
  { name:"Ogunnaike Azeezat", role:"Artist",               text:"Finally switched from WhatsApp for my work chats. StoneChat keeps things professional without getting in the way.",       avatar:"OA", color:"#00d9f5" },
];

const MOCK_MESSAGES: MockMessage[] = [
  { from:"them", text:"hey, you seeing those new StoneChat features? 👀", delay:0    },
  { from:"me",   text:"yeah omg the real-time delivery is insane",         delay:2000 },
  { from:"them", text:"and it's actually fast this time",                  delay:4200 },
  { from:"me",   text:"no more lag 🙏 finally",                            delay:6100 },
  { from:"them", text:"this is replacing everything lol",                  delay:8300 },
];

const STATS = [
  { value:"100%",   label:"Free to use"         },
  { value:"<100ms", label:"Message delivery"     },
  { value:"E2EE",   label:"Encrypted by default" },
  { value:"∞",      label:"Message history"      },
];

/* ── HOOK: screen size ── */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
};

/* ── PARTICLE CANVAS ── */
const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let raf: number;
    const COUNT = window.innerWidth < 768 ? 40 : 80; // fewer on mobile
    type P = { x:number; y:number; vx:number; vy:number; r:number; alpha:number };
    const pts: P[] = Array.from({ length: COUNT }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*.4, vy: (Math.random()-.5)*.4,
      r: Math.random()*1.5+.5, alpha: Math.random()*.4+.1,
    }));
    const COLS = ["#00f5a0","#00d9f5","#7b2fff"];
    const CONN = 110;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x<0||p.x>W) p.vx*=-1;
        if (p.y<0||p.y>H) p.vy*=-1;
      });
      for (let i=0;i<COUNT;i++) for (let j=i+1;j<COUNT;j++) {
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if (d<CONN) {
          ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=`rgba(0,245,160,${(1-d/CONN)*.12})`; ctx.lineWidth=.5; ctx.stroke();
        }
      }
      pts.forEach((p,i) => {
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=COLS[i%COLS.length]+Math.round(p.alpha*255).toString(16).padStart(2,"0");
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />;
};

/* ── CHAT PREVIEW CARD ── */
const ChatPreviewCard = ({ compact = false }: { compact?: boolean }) => {
  const [msgs, setMsgs] = useState<MockMessage[]>([]);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const run = () => {
      setMsgs([]); setTyping(false);
      MOCK_MESSAGES.forEach(m => {
        setTimeout(() => { setTyping(true); setTimeout(() => { setTyping(false); setMsgs(p=>[...p,m]); },700); }, m.delay);
      });
    };
    run(); const id=setInterval(run,14000); return ()=>clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity:0, y:24, scale:0.96 }}
      animate={{ opacity:1, y:0, scale:1 }}
      transition={{ duration:0.8, delay:0.5, ease:[0.16,1,0.3,1] }}
      style={{
        width:"100%", maxWidth: compact ? 320 : 340,
        background:"rgba(7,10,15,0.88)",
        backdropFilter:"blur(24px)",
        border:"1px solid rgba(0,245,160,0.15)",
        borderRadius:18,
        overflow:"hidden",
        boxShadow:"0 32px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,245,160,0.04)",
      }}
    >
      {/* Header */}
      <div style={{ padding:"12px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:9, background:"rgba(255,255,255,0.02)" }}>
        <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#00f5a0,#00d9f5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#000", flexShrink:0 }}>T</div>
        <div>
          <div style={{ color:"#fff", fontSize:13, fontWeight:600 }}>Usman o.</div>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <motion.div animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.6, repeat:Infinity }} style={{ width:5, height:5, borderRadius:"50%", background:"#00f5a0" }} />
            <span style={{ color:"#00f5a0", fontSize:10 }}>Online</span>
          </div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:5 }}>
          {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width:9, height:9, borderRadius:"50%", background:c }} />)}
        </div>
      </div>
      {/* Messages */}
      <div style={{ padding:"12px 11px", minHeight: compact ? 150 : 190, display:"flex", flexDirection:"column", gap:7, justifyContent:"flex-end" }}>
        <AnimatePresence>
          {msgs.map((m,i) => (
            <motion.div key={i} initial={{ opacity:0, y:7, scale:0.94 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ type:"spring", stiffness:400, damping:28 }}
              style={{ display:"flex", justifyContent:m.from==="me"?"flex-end":"flex-start" }}>
              <div style={{ background:m.from==="me"?"linear-gradient(135deg,#00f5a0,#00d9f5)":"rgba(255,255,255,0.08)", color:m.from==="me"?"#000":"#fff", padding:"7px 11px", borderRadius:m.from==="me"?"13px 13px 3px 13px":"13px 13px 13px 3px", fontSize:11.5, maxWidth:"84%", fontWeight:m.from==="me"?500:400, lineHeight:1.5, border:m.from!=="me"?"1px solid rgba(255,255,255,0.07)":"none" }}>{m.text}</div>
            </motion.div>
          ))}
          {typing && (
            <motion.div key="t" initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} style={{ display:"flex", justifyContent:"flex-start" }}>
              <div style={{ display:"flex", gap:4, padding:"7px 11px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"13px 13px 13px 3px" }}>
                {[0,1,2].map(i => <motion.div key={i} animate={{ y:[0,-4,0] }} transition={{ duration:.55, repeat:Infinity, delay:i*.16 }} style={{ width:5, height:5, borderRadius:"50%", background:"rgba(255,255,255,0.35)" }} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Input bar */}
      <div style={{ padding:"9px 11px 13px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:11, padding:"7px 11px" }}>
          <span style={{ color:"rgba(255,255,255,0.2)", fontSize:11.5, flex:1 }}>Type a message…</span>
          <div style={{ width:22, height:22, borderRadius:"50%", background:"linear-gradient(135deg,#00f5a0,#00d9f5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#000", fontWeight:700 }}>↑</div>
        </div>
      </div>
    </motion.div>
  );
};

/* ── FEATURE CARD ── */
const FeatureCard = ({ icon, title, desc, accent, index }: { icon:string; title:string; desc:string; accent:string; index:number }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.5, delay:index*.06 }}
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${hov?accent+"40":"rgba(255,255,255,0.07)"}`, borderRadius:18, padding:"clamp(18px,4vw,24px)", position:"relative", overflow:"hidden", cursor:"default", transition:"border-color 0.3s" }}>
      <motion.div animate={{ opacity:hov?1:0 }} transition={{ duration:.3 }} style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 30% 30%, ${accent}10, transparent 70%)`, pointerEvents:"none" }} />
      <motion.div animate={{ scaleX:hov?1:0 }} transition={{ duration:.3 }} style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${accent},transparent)`, transformOrigin:"left" }} />
      <div style={{ fontSize:"clamp(24px,5vw,30px)", marginBottom:12 }}>{icon}</div>
      <div style={{ color:"#fff", fontWeight:700, fontSize:"clamp(14px,3vw,15px)", marginBottom:7, fontFamily:"'Syne',sans-serif" }}>{title}</div>
      <div style={{ color:"rgba(255,255,255,0.42)", fontSize:"clamp(12px,2.5vw,13px)", lineHeight:1.7 }}>{desc}</div>
    </motion.div>
  );
};

/* ── TESTIMONIAL CARD ── */
const TestimonialCard = ({ name, role, text, avatar, color, index }: { name:string; role:string; text:string; avatar:string; color:string; index:number }) => (
  <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.5, delay:index*.1 }}
    style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:"clamp(18px,4vw,24px)", position:"relative", overflow:"hidden" }}>
    <div style={{ position:"absolute", top:12, right:16, fontFamily:"Georgia,serif", fontSize:56, color:"rgba(255,255,255,0.04)", fontWeight:900, lineHeight:1, pointerEvents:"none" }}>"</div>
    <div style={{ color:"rgba(255,255,255,0.7)", fontSize:"clamp(13px,2.5vw,14px)", lineHeight:1.8, marginBottom:20 }}>{text}</div>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ width:36, height:36, borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>{avatar}</div>
      <div>
        <div style={{ color:"#fff", fontWeight:600, fontSize:13 }}>{name}</div>
        <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11, marginTop:1 }}>{role}</div>
      </div>
    </div>
  </motion.div>
);

/* ── SHIMMER BUTTON ── */
const ShimmerBtn = ({ children, onClick, style={}, variant="primary" }: { children:React.ReactNode; onClick:()=>void; style?:React.CSSProperties; variant?:"primary"|"ghost" }) => (
  <motion.button onClick={onClick}
    whileHover={{ scale:1.04, ...(variant==="primary"?{boxShadow:"0 0 36px rgba(0,245,160,0.4)"}:{}) }}
    whileTap={{ scale:0.97 }}
    style={{
      borderRadius:50, fontSize:"clamp(13px,3vw,15px)", fontWeight:700,
      cursor:"pointer", fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden",
      padding:"clamp(11px,2.5vw,14px) clamp(22px,5vw,32px)",
      ...(variant==="primary" ? { background:"linear-gradient(135deg,#00f5a0,#00d9f5)", color:"#000", border:"none", boxShadow:"0 4px 20px rgba(0,245,160,0.25)" }
        : { background:"rgba(255,255,255,0.06)", color:"#fff", border:"1px solid rgba(255,255,255,0.15)" }),
      ...style,
    }}>
    {variant==="primary" && (
      <motion.div animate={{ x:["-120%","160%"] }} transition={{ duration:2.2, repeat:Infinity, ease:"linear", repeatDelay:1.5 }}
        style={{ position:"absolute", inset:0, width:"45%", background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)", pointerEvents:"none" }} />
    )}
    <span style={{ position:"relative", zIndex:1 }}>{children}</span>
  </motion.button>
);

/* ── MAIN ── */
const ChatLanding = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { scrollY } = useScroll();
  const navBg     = useTransform(scrollY, [0,60], ["rgba(7,10,15,0)","rgba(7,10,15,0.97)"]);
  const navBorder = useTransform(scrollY, [0,60], ["rgba(255,255,255,0)","rgba(255,255,255,0.07)"]);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ background:"#070a0f", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", color:"#fff", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#070a0f; }
        ::-webkit-scrollbar-thumb { background:rgba(0,245,160,0.3); border-radius:4px; }
        html { scroll-behavior:smooth; }
        ::selection { background:rgba(0,245,160,0.2); color:#fff; }
      `}</style>

      {/* ══ NAV ══ */}
      <motion.header style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:navBg, borderBottom:navBorder, backdropFilter:"blur(20px)" }}>
        <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 clamp(16px,4vw,28px)", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>

          {/* Logo */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} onClick={() => navigate("/")}
            style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#00f5a0,#00d9f5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#000" }}>S</div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:"#fff", letterSpacing:"-0.3px" }}>StoneChat</span>
          </motion.div>

          {/* Desktop nav */}
          {!isMobile && (
            <motion.nav initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }} style={{ display:"flex", alignItems:"center", gap:4 }}>
              {NAV_LINKS.map((link,i) => (
                <motion.button key={link.label} initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1+i*.08 }}
                  onClick={() => navigate(link.href)} whileHover={{ background:"rgba(255,255,255,0.07)", color:"#fff" }}
                  style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:14, fontWeight:500, cursor:"pointer", padding:"7px 14px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                  {link.label}
                </motion.button>
              ))}
              <div style={{ width:1, height:16, background:"rgba(255,255,255,0.1)", margin:"0 4px" }} />
              <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}
                onClick={() => navigate("/auth/login")} whileHover={{ background:"rgba(255,255,255,0.07)", color:"#fff" }}
                style={{ background:"none", border:"none", color:"rgba(255,255,255,0.6)", fontSize:14, fontWeight:500, cursor:"pointer", padding:"7px 16px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                Sign in
              </motion.button>
              <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
                onClick={() => navigate("/auth/signup")} whileHover={{ scale:1.04, boxShadow:"0 0 20px rgba(0,245,160,0.3)" }} whileTap={{ scale:0.97 }}
                style={{ background:"linear-gradient(135deg,#00f5a0,#00d9f5)", border:"none", color:"#000", fontSize:14, fontWeight:700, cursor:"pointer", padding:"8px 18px", borderRadius:10, fontFamily:"'DM Sans',sans-serif" }}>
                Get started
              </motion.button>
            </motion.nav>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <motion.button onClick={() => setMenuOpen(p=>!p)}
              style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, width:36, height:36, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, padding:0 }}>
              {[0,1,2].map(i => (
                <motion.div key={i}
                  animate={menuOpen?(i===1?{opacity:0}:i===0?{rotate:45,y:8}:{rotate:-45,y:-8}):{opacity:1,rotate:0,y:0}}
                  style={{ width:16, height:1.5, background:"#fff", borderRadius:99 }} />
              ))}
            </motion.button>
          )}
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {menuOpen && isMobile && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }}
              style={{ overflow:"hidden", borderTop:"1px solid rgba(255,255,255,0.07)", background:"rgba(7,10,15,0.99)" }}>
              <div style={{ padding:"14px 20px 18px", display:"flex", flexDirection:"column", gap:2 }}>
                {NAV_LINKS.map(link => (
                  <button key={link.label} onClick={() => { navigate(link.href); setMenuOpen(false); }}
                    style={{ background:"none", border:"none", color:"rgba(255,255,255,0.6)", fontSize:16, fontWeight:500, cursor:"pointer", padding:"11px 0", textAlign:"left", fontFamily:"'DM Sans',sans-serif", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    {link.label}
                  </button>
                ))}
                <button onClick={() => { navigate("/auth/login"); setMenuOpen(false); }}
                  style={{ background:"none", border:"none", color:"rgba(255,255,255,0.6)", fontSize:16, fontWeight:500, cursor:"pointer", padding:"11px 0", textAlign:"left", fontFamily:"'DM Sans',sans-serif", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  Sign in
                </button>
                <button onClick={() => { navigate("/auth/signup"); setMenuOpen(false); }}
                  style={{ background:"linear-gradient(135deg,#00f5a0,#00d9f5)", border:"none", color:"#000", fontSize:15, fontWeight:700, cursor:"pointer", padding:"13px", borderRadius:12, fontFamily:"'DM Sans',sans-serif", marginTop:10 }}>
                  Get started →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ══ HERO ══ */}
      <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden" }}>
        <ParticleField />
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:"10%", left:"5%", width:400, height:400, borderRadius:"50%", background:"#00f5a0", filter:"blur(120px)", opacity:0.06 }} />
          <div style={{ position:"absolute", bottom:"10%", right:"5%", width:350, height:350, borderRadius:"50%", background:"#7b2fff", filter:"blur(120px)", opacity:0.06 }} />
        </div>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:180, background:"linear-gradient(transparent,#070a0f)", pointerEvents:"none", zIndex:2 }} />

        <div style={{
          position:"relative", zIndex:3, maxWidth:1180, margin:"0 auto",
          padding: isMobile ? "90px 20px 50px" : "100px 28px 60px",
          width:"100%",
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 40 : 60,
          alignItems:"center",
        }}>
          {/* Text */}
          <div style={{ textAlign: isMobile ? "center" : "left" }}>
            {/* Badge */}
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.1 }}
              style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(0,245,160,0.08)", border:"1px solid rgba(0,245,160,0.2)", borderRadius:50, padding:"6px 14px", marginBottom:24 }}>
              <motion.div animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.5, repeat:Infinity }} style={{ width:6, height:6, borderRadius:"50%", background:"#00f5a0", flexShrink:0 }} />
              <span style={{ color:"#00f5a0", fontSize:12, fontWeight:600 }}>Now live — completely free</span>
            </motion.div>

            {/* Headline */}
            <div style={{ overflow:"hidden", marginBottom:6 }}>
              <motion.h1 initial={{ y:"100%", opacity:0 }} animate={{ y:"0%", opacity:1 }} transition={{ duration:0.8, delay:0.2, ease:[0.16,1,0.3,1] }}
                style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(36px,8vw,72px)", fontWeight:800, color:"#fff", letterSpacing:"-2px", lineHeight:1.05, margin:0 }}>
                Chat without
              </motion.h1>
            </div>
            <div style={{ overflow:"hidden", marginBottom:20 }}>
              <motion.h1 initial={{ y:"100%", opacity:0 }} animate={{ y:"0%", opacity:1 }} transition={{ duration:0.8, delay:0.32, ease:[0.16,1,0.3,1] }}
                style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(36px,8vw,72px)", fontWeight:800, letterSpacing:"-2px", lineHeight:1.05, margin:0, background:"linear-gradient(90deg,#00f5a0,#00d9f5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                the noise.
              </motion.h1>
            </div>

            <motion.p initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.44 }}
              style={{ color:"rgba(255,255,255,0.45)", fontSize:"clamp(14px,3vw,17px)", lineHeight:1.75, marginBottom:28, maxWidth: isMobile ? "100%" : 420, margin: isMobile ? "0 auto 28px" : "0 0 28px" }}>
              Real-time messaging with end-to-end encryption. Find friends, start conversations, and stay connected — no ads, no noise.
            </motion.p>

            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.56 }}
              style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
              <ShimmerBtn onClick={() => navigate("/auth/signup")}>Create free account →</ShimmerBtn>
              <ShimmerBtn onClick={() => navigate("/auth/login")} variant="ghost">Sign in</ShimmerBtn>
            </motion.div>

            {/* Social proof */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.75 }}
              style={{ display:"flex", alignItems:"center", gap:10, marginTop:24, justifyContent: isMobile ? "center" : "flex-start" }}>
              <div style={{ display:"flex" }}>
                {["#00b87a","#7b2fff","#00d9f5","#ff9800"].map((c,i) => (
                  <div key={c} style={{ width:24, height:24, borderRadius:"50%", background:c, border:"2px solid #070a0f", marginLeft:i===0?0:-7, boxShadow:"0 2px 6px rgba(0,0,0,0.4)" }} />
                ))}
              </div>
              <span style={{ color:"rgba(255,255,255,0.35)", fontSize:12 }}>
                Join the first users — <strong style={{ color:"rgba(255,255,255,0.55)" }}>sign up today</strong>
              </span>
            </motion.div>
          </div>

          {/* Chat card — hidden on very small screens to keep hero clean */}
          {!isMobile && (
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
              <ChatPreviewCard />
            </div>
          )}

          {/* On mobile show a smaller centered card below headline */}
          {isMobile && (
            <div style={{ display:"flex", justifyContent:"center" }}>
              <ChatPreviewCard compact />
            </div>
          )}
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ position:"relative", zIndex:1, borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth:960, margin:"0 auto", padding:"clamp(28px,5vw,44px) clamp(16px,4vw,28px)", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:"clamp(16px,4vw,28px)" }}>
          {STATS.map((s,i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.5, delay:i*.08 }} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(24px,5vw,40px)", fontWeight:800, background:"linear-gradient(135deg,#00f5a0,#00d9f5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"-1px" }}>{s.value}</div>
              <div style={{ color:"rgba(255,255,255,0.38)", fontSize:"clamp(11px,2vw,12px)", marginTop:4 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section style={{ padding:"clamp(60px,10vw,100px) clamp(16px,4vw,28px)", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1180, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.6 }} style={{ textAlign:"center", marginBottom:"clamp(36px,6vw,60px)" }}>
            <div style={{ color:"#00f5a0", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", marginBottom:12 }}>What you get</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(26px,6vw,56px)", fontWeight:800, letterSpacing:"-1.5px", lineHeight:1.15 }}>
              Everything you need<br />
              <span style={{ background:"linear-gradient(90deg,#00f5a0,#00d9f5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>to stay connected.</span>
            </h2>
          </motion.div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"clamp(12px,3vw,18px)" }}>
            {FEATURES.map((f,i) => <FeatureCard key={f.title} {...f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ padding:"clamp(40px,8vw,80px) clamp(16px,4vw,28px)", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1180, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.6 }} style={{ textAlign:"center", marginBottom:"clamp(28px,5vw,52px)" }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(24px,5vw,50px)", fontWeight:800, letterSpacing:"-1.5px" }}>
              Early users <span style={{ background:"linear-gradient(90deg,#00f5a0,#00d9f5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>love it.</span>
            </h2>
          </motion.div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"clamp(12px,3vw,18px)" }}>
            {TESTIMONIALS.map((t,i) => <TestimonialCard key={t.name} {...t} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding:"0 clamp(16px,4vw,28px) clamp(60px,10vw,120px)", position:"relative", zIndex:1 }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.7 }}
          style={{ maxWidth:720, margin:"0 auto", background:"rgba(0,245,160,0.04)", border:"1px solid rgba(0,245,160,0.12)", borderRadius:"clamp(18px,4vw,28px)", padding:"clamp(36px,7vw,64px) clamp(20px,5vw,44px)", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-30, left:-30, width:160, height:160, borderRadius:"50%", background:"#00f5a0", filter:"blur(60px)", opacity:.07, pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-30, right:-30, width:160, height:160, borderRadius:"50%", background:"#00d9f5", filter:"blur(60px)", opacity:.07, pointerEvents:"none" }} />
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(24px,5vw,52px)", fontWeight:800, letterSpacing:"-1.5px", marginBottom:14 }}>
            Ready to try it?<br />
            <span style={{ background:"linear-gradient(90deg,#00f5a0,#00d9f5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>It's completely free.</span>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"clamp(14px,3vw,16px)", marginBottom:32, lineHeight:1.7 }}>No credit card. No subscription. Just sign up and start chatting.</p>
          <ShimmerBtn onClick={() => navigate("/auth/signup")} style={{ padding:"clamp(12px,2.5vw,16px) clamp(28px,5vw,44px)", fontSize:"clamp(14px,3vw,16px)" }}>
            Create your account →
          </ShimmerBtn>
        </motion.div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.05)", padding:"clamp(24px,5vw,36px) clamp(16px,4vw,28px)", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1180, margin:"0 auto", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:22, height:22, borderRadius:6, background:"linear-gradient(135deg,#00f5a0,#00d9f5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:"#000" }}>S</div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#fff" }}>StoneChat</span>
          </div>
          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            {NAV_LINKS.map(link => (
              <motion.button key={link.label} onClick={() => navigate(link.href)} whileHover={{ color:"rgba(255,255,255,0.6)" }}
                style={{ background:"none", border:"none", color:"rgba(255,255,255,0.28)", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                {link.label}
              </motion.button>
            ))}
          </div>
          <div style={{ color:"rgba(255,255,255,0.18)", fontSize:11 }}>© 2025 StoneChat. Built to connect people.</div>
        </div>
      </footer>
    </div>
  );
};

export default ChatLanding;