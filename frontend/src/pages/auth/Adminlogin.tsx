import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdAdminPanelSettings, MdEmail, MdLock } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Both fields are required."); return; }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5002/admin/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminUser",  JSON.stringify(res.data.admin));
      navigate("/admin/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#060810",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px #0d1018 inset !important; -webkit-text-fill-color: #fff !important; }
      `}</style>

      {/* Grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,179,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

      {/* Orbs */}
      <motion.div animate={{ opacity: [0.06, 0.1, 0.06] }} transition={{ duration: 6, repeat: Infinity }}
        style={{ position: "absolute", top: -120, left: -80, width: 400, height: 400, borderRadius: "50%", background: "#3b82f6", filter: "blur(120px)", pointerEvents: "none" }} />
      <motion.div animate={{ opacity: [0.05, 0.09, 0.05] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        style={{ position: "absolute", bottom: -80, right: -60, width: 350, height: 350, borderRadius: "50%", background: "#6366f1", filter: "blur(120px)", pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%", maxWidth: 420, position: "relative", zIndex: 1,
          background: "rgba(255,255,255,0.03)", backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24,
          overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Top accent */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)" }} />

        <div style={{ padding: "40px 36px 44px" }}>
          {/* Icon + title */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <motion.div
              animate={{ boxShadow: ["0 0 0 0 rgba(59,130,246,0)", "0 0 0 12px rgba(59,130,246,0.08)", "0 0 0 0 rgba(59,130,246,0)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 28, color: "#3b82f6" }}
            >
              <MdAdminPanelSettings />
            </motion.div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
              Admin Portal
            </div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 5 }}>
              StoneChat Control Centre
            </div>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ position: "relative", marginBottom: 14 }}>
              <MdEmail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", fontSize: 17 }} />
              <input
                type="email" placeholder="Admin email" value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: "100%", padding: "12px 16px 12px 42px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
              />
            </div>

            {/* Password */}
            <div style={{ position: "relative", marginBottom: 22 }}>
              <MdLock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", fontSize: 17 }} />
              <input
                type={showPw ? "text" : "password"} placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: "100%", padding: "12px 44px 12px 42px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16, display: "flex" }}>
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 18 }}>
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.03, boxShadow: "0 0 32px rgba(59,130,246,0.4)" } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
              style={{
                width: "100%", padding: "13px", borderRadius: 12, border: "none",
                background: loading ? "rgba(59,130,246,0.4)" : "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden",
              }}
            >
              {loading ? "Authenticating…" : "Sign in to Admin"}
            </motion.button>
          </form>

          <div style={{ textAlign: "center", marginTop: 24, color: "rgba(255,255,255,0.15)", fontSize: 11, letterSpacing: 0.5 }}>
            RESTRICTED ACCESS · AUTHORISED PERSONNEL ONLY
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;