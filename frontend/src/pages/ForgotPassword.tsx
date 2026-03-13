import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { FaChevronLeft, FaEye, FaEyeSlash } from "react-icons/fa6";
import api from "../api/axios";
import { useNotification } from "../components/NotificationContext";
import { NotificationContainer } from "../components/NotificationToast";

const RULES = [
  { id: "len",     label: "At least 8 characters",  test: (p: string) => p.length >= 8 },
  { id: "upper",   label: "One uppercase letter",    test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",   label: "One lowercase letter",    test: (p: string) => /[a-z]/.test(p) },
  { id: "digit",   label: "One number",              test: (p: string) => /\d/.test(p) },
  { id: "special", label: "One special character",   test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  { id: "space",   label: "No spaces",               test: (p: string) => !/\s/.test(p) },
];

type Step = 1 | 2 | 3 | 4;

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const { success, error: notifyError, info } = useNotification();

  const [step, setStep]               = useState<Step>(1);
  const [email, setEmail]             = useState("");
  const [otp, setOtp]                 = useState(["", "", "", ""]);
  const [resetToken, setResetToken]   = useState("");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [fieldError, setFieldError]   = useState(""); // inline field errors only
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 3) otpRefs[i + 1].current?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs[i - 1].current?.focus();
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const id = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(id); return 0; } return t - 1; });
    }, 1000);
  };

  // ── STEP 1: send OTP ───────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    setFieldError("");
    if (!email.trim()) { setFieldError("Please enter your email."); return; }
    setLoading(true);
    try {
      await api.post("/user/forgot-password", { email });
      setStep(2);
      startResendTimer();
      info(
        "Code sent!",
        `A 4-digit reset code has been sent to ${email}`
      );
    } catch (err: any) {
      const msg = err.response?.data?.message || "Something went wrong.";
      setFieldError(msg);
      notifyError("Failed to send code", msg);
    } finally { setLoading(false); }
  };

  // ── STEP 2: verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    setFieldError("");
    const code = otp.join("");
    if (code.length < 4) { setFieldError("Enter the full 4-digit code."); return; }
    setLoading(true);
    try {
      const res = await api.post("/user/verify-otp", { email, otp: code });
      setResetToken(res.data.resetToken);
      setStep(3);
      // No toast here — moving to step 3 is confirmation enough
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid or expired code.";
      setFieldError(msg);
      notifyError("Wrong code", "That code is incorrect or has expired. Please try again.");
      setOtp(["", "", "", ""]);
      otpRefs[0].current?.focus();
    } finally { setLoading(false); }
  };

  // ── STEP 3: set new password ───────────────────────────────────────────────
  const allPass = RULES.every(r => r.test(password));

  const handleResetPassword = async () => {
    setFieldError("");
    if (!allPass) { setFieldError("Password doesn't meet all requirements."); return; }
    if (password !== confirm) {
      setFieldError("Passwords do not match.");
      notifyError("Passwords don't match", "Make sure both password fields are identical.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/user/reset-password", { resetToken, password });
      success(
        "Password reset!",
        "Your password has been updated. You can now log in."
      );
      setStep(4);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Reset failed. Please try again.";
      setFieldError(msg);
      notifyError("Reset failed", msg);
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12, color: "#fff", fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none", boxSizing: "border-box",
  };

  const btnStyle: React.CSSProperties = {
    width: "100%", padding: "13px",
    background: loading ? "rgba(0,245,160,0.5)" : "linear-gradient(135deg,#00f5a0,#00d9f5)",
    border: "none", borderRadius: 12,
    color: "#000", fontSize: 14, fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: 0.3,
  };

  return (
    <>
      <NotificationContainer />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070a0f; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px #0d1117 inset !important; -webkit-text-fill-color: #fff !important; }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#070a0f",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif", padding: 24,
        position: "relative", overflow: "hidden",
      }}>
        {/* Orbs */}
        <motion.div animate={{ y: [0,-30,0] }} transition={{ duration: 9, repeat: Infinity }}
          style={{ position:"absolute", top:-80, right:-80, width:320, height:320, borderRadius:"50%", background:"#00d9f5", filter:"blur(110px)", opacity:0.06, pointerEvents:"none" }} />
        <motion.div animate={{ y: [0,20,0] }} transition={{ duration: 11, repeat: Infinity, delay: 2 }}
          style={{ position:"absolute", bottom:-60, left:-60, width:280, height:280, borderRadius:"50%", background:"#7b2fff", filter:"blur(110px)", opacity:0.07, pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize:"48px 48px", pointerEvents:"none" }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: "100%", maxWidth: 440,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24, overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            position: "relative",
          }}
        >
          <div style={{ height: 3, background: "linear-gradient(90deg,#00f5a0,#00d9f5,#7b2fff)" }} />

          <div style={{ padding: "36px 36px 40px" }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(90deg,#00f5a0,#00d9f5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"-0.5px", marginBottom:28 }}>
              StoneChat
            </div>

            <AnimatePresence mode="wait">

              {/* ── STEP 1: Email ── */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration: 0.25 }}>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#fff", marginBottom:6 }}>Forgot Password?</div>
                    <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>Enter your email and we'll send you a 4-digit reset code.</div>
                  </div>

                  <div style={{ position:"relative", marginBottom:16 }}>
                    <MdEmail style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)", fontSize:18 }} />
                    <input
                      style={{ ...inputStyle, paddingLeft: 44 }}
                      type="email" placeholder="your@email.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSendOTP()}
                    />
                  </div>

                  {fieldError && <p style={{ color:"#ff4d6a", fontSize:12, marginBottom:12 }}>{fieldError}</p>}

                  <motion.button whileTap={{ scale:0.97 }} onClick={handleSendOTP} disabled={loading} style={btnStyle}>
                    {loading ? "Sending…" : "Send Reset Code →"}
                  </motion.button>

                  <div style={{ textAlign:"center", marginTop:20 }}>
                    <button onClick={() => navigate("/auth/login")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.35)", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6, margin:"0 auto" }}>
                      <FaChevronLeft style={{ fontSize:11 }} /> Back to login
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: OTP ── */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration: 0.25 }}>
                  <div style={{ marginBottom:24 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#fff", marginBottom:6 }}>Check your email</div>
                    <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>
                      We sent a 4-digit code to <span style={{ color:"#00d9f5" }}>{email}</span>. It expires in 10 minutes.
                    </div>
                  </div>

                  <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:20 }}>
                    {otp.map((digit, i) => (
                      <input
                        key={i} ref={otpRefs[i]}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        maxLength={1} inputMode="numeric"
                        style={{
                          width:60, height:68, textAlign:"center",
                          fontSize:26, fontWeight:800, color:"#00f5a0",
                          background: digit ? "rgba(0,245,160,0.07)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${digit ? "rgba(0,245,160,0.35)" : "rgba(255,255,255,0.1)"}`,
                          borderRadius:14, outline:"none",
                          fontFamily:"'Syne',sans-serif",
                          transition:"border-color 0.2s, background 0.2s",
                        }}
                      />
                    ))}
                  </div>

                  {fieldError && <p style={{ color:"#ff4d6a", fontSize:12, marginBottom:12, textAlign:"center" }}>{fieldError}</p>}

                  <motion.button whileTap={{ scale:0.97 }} onClick={handleVerifyOTP} disabled={loading} style={btnStyle}>
                    {loading ? "Verifying…" : "Verify Code →"}
                  </motion.button>

                  <div style={{ textAlign:"center", marginTop:16, fontSize:13 }}>
                    {resendTimer > 0 ? (
                      <span style={{ color:"rgba(255,255,255,0.25)" }}>Resend in {resendTimer}s</span>
                    ) : (
                      <button
                        onClick={() => { setFieldError(""); handleSendOTP(); }}
                        style={{ background:"none", border:"none", color:"#00d9f5", fontSize:13, cursor:"pointer" }}
                      >
                        Resend code
                      </button>
                    )}
                  </div>

                  <div style={{ textAlign:"center", marginTop:10 }}>
                    <button onClick={() => { setStep(1); setOtp(["","","",""]); setFieldError(""); }} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:5, margin:"0 auto" }}>
                      <FaChevronLeft style={{ fontSize:10 }} /> Change email
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: New password ── */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration: 0.25 }}>
                  <div style={{ marginBottom:24 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#fff", marginBottom:6 }}>New Password</div>
                    <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>Choose a strong password for your account.</div>
                  </div>

                  <div style={{ position:"relative", marginBottom:12 }}>
                    <input
                      style={{ ...inputStyle, paddingRight:48 }}
                      type={showPw ? "text" : "password"}
                      placeholder="New password"
                      value={password} onChange={e => setPassword(e.target.value)}
                    />
                    <button onClick={() => setShowPw(p => !p)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:16, display:"flex" }}>
                      {showPw ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div style={{ position:"relative", marginBottom:16 }}>
                    <input
                      style={{ ...inputStyle, paddingRight:48, borderColor: confirm && password !== confirm ? "rgba(255,77,106,0.5)" : "rgba(255,255,255,0.1)" }}
                      type={showPw ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirm} onChange={e => setConfirm(e.target.value)}
                    />
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 12px", marginBottom:20 }}>
                    {RULES.map(r => {
                      const ok = r.test(password);
                      return (
                        <div key={r.id} style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <motion.div animate={{ scale: ok ? [1,1.3,1] : 1 }} transition={{ duration:0.3 }}
                            style={{ width:7, height:7, borderRadius:"50%", background: ok ? "#00f5a0" : "rgba(255,255,255,0.12)", flexShrink:0, transition:"background 0.2s" }} />
                          <span style={{ fontSize:11, color: ok ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)" }}>{r.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {fieldError && <p style={{ color:"#ff4d6a", fontSize:12, marginBottom:12 }}>{fieldError}</p>}

                  <motion.button whileTap={{ scale:0.97 }} onClick={handleResetPassword} disabled={loading || !allPass} style={{ ...btnStyle, opacity: !allPass ? 0.5 : 1 }}>
                    {loading ? "Resetting…" : "Reset Password →"}
                  </motion.button>
                </motion.div>
              )}

              {/* ── STEP 4: Success ── */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.3 }} style={{ textAlign:"center", padding:"20px 0" }}>
                  <motion.div
                    initial={{ scale:0 }} animate={{ scale:1 }}
                    transition={{ type:"spring", stiffness:300, damping:18, delay:0.1 }}
                    style={{ width:72, height:72, borderRadius:"50%", background:"rgba(0,245,160,0.1)", border:"2px solid rgba(0,245,160,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:32 }}
                  >
                    ✓
                  </motion.div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#fff", marginBottom:8 }}>Password Reset!</div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:28, lineHeight:1.6 }}>
                    Your password has been updated. You can now log in with your new password.
                  </div>
                  <motion.button whileTap={{ scale:0.97 }} onClick={() => navigate("/auth/login")} style={btnStyle}>
                    Back to Login →
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {step < 4 && (
            <div style={{ display:"flex", gap:6, justifyContent:"center", paddingBottom:24 }}>
              {([1,2,3] as Step[]).map(s => (
                <div key={s} style={{ width: s === step ? 20 : 7, height:7, borderRadius:99, background: s === step ? "#00f5a0" : s < step ? "rgba(0,245,160,0.4)" : "rgba(255,255,255,0.1)", transition:"all 0.3s" }} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPasswordForm;