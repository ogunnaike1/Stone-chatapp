import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2, X, User, Settings, Shield, Bell,
  Palette, Lock, Cpu, Eye, EyeOff, Check, Menu,
  Sun, Moon,
} from "lucide-react";
import api from "../api/axios";
import { useNotification } from "./NotificationContext";
import { useTheme } from "../context/ThemeContext";

interface SettingsFormProps {
  onCloseSettings: () => void;
}

const DEFAULT_PROFILE_PIC = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const TABS = [
  { key: "Profile",       label: "Profile",       icon: User },
  { key: "Account",       label: "Account",       icon: Settings },
  { key: "Security",      label: "Security",      icon: Lock },
  { key: "Appearance",    label: "Appearance",    icon: Palette },
  { key: "Privacy",       label: "Privacy",       icon: Shield },
  { key: "Notifications", label: "Notifications", icon: Bell },
  { key: "Advanced",      label: "Advanced",      icon: Cpu },
];

const RULES = [
  { label: "At least 8 characters",   test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",     test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter",     test: (p: string) => /[a-z]/.test(p) },
  { label: "One number",               test: (p: string) => /\d/.test(p) },
  { label: "One special character",    test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <motion.button
    onClick={() => onChange(!value)}
    animate={{ background: value ? "linear-gradient(135deg,#00f5a0,#00d9f5)" : "rgba(255,255,255,0.08)" }}
    transition={{ duration: 0.2 }}
    style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative", flexShrink: 0, boxShadow: value ? "0 0 12px rgba(0,245,160,0.35)" : "none" }}
  >
    <motion.div animate={{ x: value ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
      style={{ position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }} />
  </motion.button>
);

const SettingRow = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => {
  const { text, textMuted } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid rgba(125,125,125,0.1)", gap: 16 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: text, fontSize: "clamp(13px,3vw,14px)", fontWeight: 500 }}>{label}</div>
        {description && <div style={{ color: textMuted, fontSize: "clamp(11px,2.5vw,12px)", marginTop: 2, lineHeight: 1.4 }}>{description}</div>}
      </div>
      {children}
    </div>
  );
};

const DarkInput = ({ value, onChange, placeholder, type = "text", disabled = false }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string; disabled?: boolean;
}) => {
  const { isDark } = useTheme();
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <motion.div
      animate={{ boxShadow: focused ? "0 0 0 2px rgba(0,245,160,0.35)" : isDark ? "0 0 0 1px rgba(255,255,255,0.08)" : "0 0 0 1px rgba(0,0,0,0.12)" }}
      style={{ display: "flex", alignItems: "center", gap: 8, background: disabled ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)") : (focused ? "rgba(0,245,160,0.04)" : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)")), borderRadius: 12, padding: "clamp(10px,2vw,12px) 14px", transition: "background 0.2s", opacity: disabled ? 0.5 : 1 }}
    >
      <input
        type={isPassword && !show ? "password" : "text"}
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ flex: 1, background: "none", border: "none", outline: "none", color: isDark ? "#fff" : "#0d1117", fontSize: "clamp(13px,3vw,14px)", fontFamily: "'DM Sans',sans-serif", caretColor: "#00f5a0", minWidth: 0 }}
      />
      {isPassword && (
        <button onClick={() => setShow(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", display: "flex", flexShrink: 0 }}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </motion.div>
  );
};

const Card = ({ children, title, description }: { children: React.ReactNode; title: string; description?: string }) => {
  const { isDark, text, textMuted } = useTheme();
  return (
    <div style={{ background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.03)", border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.09)", borderRadius: 18, padding: "20px 18px 4px", marginBottom: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <div style={{ color: text, fontWeight: 700, fontSize: "clamp(14px,3vw,15px)", fontFamily: "'Syne',sans-serif" }}>{title}</div>
        {description && <div style={{ color: textMuted, fontSize: "clamp(11px,2.5vw,12px)", marginTop: 3 }}>{description}</div>}
      </div>
      {children}
    </div>
  );
};

const SaveBtn = ({ onClick, loading, label = "Save Changes" }: { onClick: () => void; loading: boolean; label?: string }) => (
  <motion.button onClick={onClick} disabled={loading}
    whileHover={!loading ? { scale: 1.03, boxShadow: "0 0 20px rgba(0,245,160,0.4)" } : {}}
    whileTap={!loading ? { scale: 0.97 } : {}}
    style={{ padding: "10px 22px", borderRadius: 12, border: "none", background: loading ? "rgba(0,245,160,0.4)" : "linear-gradient(135deg,#00f5a0,#00d9f5)", color: "#000", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 8 }}
  >
    {loading ? (<><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%" }} />Saving…</>) : label}
  </motion.button>
);

const RuleRow = ({ label, pass }: { label: string; pass: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: pass ? "#00f5a0" : "rgba(128,128,128,0.5)", marginBottom: 4, transition: "color 0.2s" }}>
    <div style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${pass ? "#00f5a0" : "rgba(128,128,128,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {pass && <Check size={8} color="#00f5a0" />}
    </div>
    {label}
  </div>
);

const SettingsForm = ({ onCloseSettings }: SettingsFormProps) => {
  const { success, error: notifError } = useNotification();
  const { theme, setTheme, isDark, text, textMuted } = useTheme();

  const [activeTab, setActiveTab]     = useState("Profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 640);

  const [profilePic, setProfilePic]   = useState<string | null>(null);
  const [savingPic, setSavingPic]     = useState(false);
  const [username, setUsername]       = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [email, setEmail]             = useState("");
  const [emailPassword, setEmailPassword]  = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [currentPw, setCurrentPw]     = useState("");
  const [newPw, setNewPw]             = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [savingPw, setSavingPw]       = useState(false);
  const [isPrivate, setIsPrivate]     = useState(false);
  const [hideOnline, setHideOnline]   = useState(false);
  const [emailNotif, setEmailNotif]   = useState(true);
  const [pushNotif, setPushNotif]     = useState(false);
  const [betaFeatures, setBetaFeatures] = useState(false);

  const pwRules    = RULES.map(r => ({ ...r, pass: r.test(newPw) }));
  const pwStrength = pwRules.filter(r => r.pass).length;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.profilePicture) setProfilePic(user.profilePicture);
    if (user?.username)       setUsername(user.username);
    if (user?.email)          setEmail(user.email);
  }, []);

  const syncUser = (fields: Record<string, any>) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("user", JSON.stringify({ ...user, ...fields }));
  };

  const handleSavePic = async () => {
    if (!profilePic || profilePic.startsWith("http")) { notifError("No changes", "Select a new photo first."); return; }
    setSavingPic(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const { data } = await api.post("/user/upload-profile-pic", { userId: user.id, image: profilePic });
      if (!data.status) throw new Error(data.message);
      syncUser({ profilePicture: data.user.profilePicture });
      setProfilePic(data.user.profilePicture);
      success("Saved!", "Profile picture updated.");
    } catch (e: any) { notifError("Failed", e.response?.data?.message || e.message); }
    finally { setSavingPic(false); }
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) { notifError("Empty", "Username cannot be blank."); return; }
    setSavingUsername(true);
    try {
      const { data } = await api.patch("/user/update-username", { username });
      if (!data.status) throw new Error(data.message);
      syncUser({ username: data.user.username });
      success("Saved!", "Username updated.");
    } catch (e: any) { notifError("Failed", e.response?.data?.message || e.message); }
    finally { setSavingUsername(false); }
  };

  const handleSaveEmail = async () => {
    if (!email.trim() || !emailPassword) { notifError("Missing fields", "Enter new email and confirm with your password."); return; }
    setSavingEmail(true);
    try {
      const { data } = await api.patch("/user/update-email", { email, password: emailPassword });
      if (!data.status) throw new Error(data.message);
      syncUser({ email: data.user.email });
      setEmailPassword("");
      success("Saved!", "Email updated.");
    } catch (e: any) { notifError("Failed", e.response?.data?.message || e.message); }
    finally { setSavingEmail(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) { notifError("Missing fields", "Fill in all password fields."); return; }
    if (newPw !== confirmPw) { notifError("Mismatch", "New passwords do not match."); return; }
    if (pwStrength < 5) { notifError("Weak password", "New password doesn't meet all requirements."); return; }
    setSavingPw(true);
    try {
      const { data } = await api.patch("/user/change-password", { currentPassword: currentPw, newPassword: newPw });
      if (!data.status) throw new Error(data.message);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      success("Done!", "Password changed successfully.");
    } catch (e: any) { notifError("Failed", e.response?.data?.message || e.message); }
    finally { setSavingPw(false); }
  };

  const selectTab = (key: string) => { setActiveTab(key); setSidebarOpen(false); };

  const modalBg   = isDark ? "rgba(7,10,15,0.98)"   : "rgba(248,250,252,0.99)";
  const borderCol = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.1)";

  const SidebarContent = () => (
    <>
      {TABS.map((tab, i) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;
        return (
          <motion.button key={tab.key} onClick={() => selectTab(tab.key)}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.97 }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", borderRadius: 12, border: "none", cursor: "pointer", background: active ? "rgba(0,245,160,0.1)" : "none", borderLeft: `3px solid ${active ? "#00f5a0" : "transparent"}`, color: active ? "#00f5a0" : textMuted, fontSize: 13.5, fontWeight: active ? 600 : 400, fontFamily: "'DM Sans',sans-serif", textAlign: "left", transition: "all 0.15s", marginBottom: 2 }}>
            <Icon size={15} style={{ flexShrink: 0 }} />
            {tab.label}
            {active && <motion.div layoutId="settings-dot" style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#00f5a0" }} />}
          </motion.button>
        );
      })}
    </>
  );

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCloseSettings}
        style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(8px,3vw,16px)", fontFamily: "'DM Sans',sans-serif" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
          .settings-scroll::-webkit-scrollbar{width:4px}
          .settings-scroll::-webkit-scrollbar-thumb{background:rgba(0,245,160,0.2);border-radius:4px}
          input::placeholder{color:rgba(128,128,128,0.45)}
          input:-webkit-autofill{-webkit-box-shadow:0 0 0 40px ${isDark?"#0d1018":"#f8fafc"} inset!important;-webkit-text-fill-color:${isDark?"#fff":"#0d1117"}!important}
        `}</style>

        <motion.div initial={{ scale: 0.92, y: 28 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 28 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{ width: "100%", maxWidth: "clamp(320px,95vw,900px)", height: "clamp(400px,88vh,700px)", background: modalBg, border: `1px solid ${borderCol}`, borderRadius: "clamp(14px,3vw,24px)", overflow: "hidden", boxShadow: "0 48px 120px rgba(0,0,0,0.7)", backdropFilter: "blur(28px)", display: "flex", flexDirection: "column" }}
        >
          <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#00f5a0,#00d9f5,transparent)", flexShrink: 0 }} />

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "clamp(12px,3vw,18px) clamp(14px,4vw,24px)", borderBottom: `1px solid ${borderCol}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {isMobile && (
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSidebarOpen(p => !p)}
                  style={{ width: 32, height: 32, borderRadius: 9, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${borderCol}`, color: textMuted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Menu size={15} />
                </motion.button>
              )}
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(16px,4vw,20px)", fontWeight: 800, color: text, letterSpacing: "-0.5px" }}>Settings</div>
                {!isMobile && <div style={{ color: textMuted, fontSize: 12, marginTop: 2 }}>Manage your account and preferences</div>}
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} onClick={onCloseSettings}
              style={{ width: 34, height: 34, borderRadius: 10, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${borderCol}`, color: textMuted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} />
            </motion.button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

            {!isMobile && (
              <aside style={{ width: 200, borderRight: `1px solid ${borderCol}`, padding: "14px 10px", flexShrink: 0, overflowY: "auto" }}>
                <SidebarContent />
              </aside>
            )}

            <AnimatePresence>
              {isMobile && sidebarOpen && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(0,0,0,0.5)" }} />
                  <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 340, damping: 32 }}
                    style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 220, zIndex: 11, background: modalBg, borderRight: `1px solid ${borderCol}`, padding: "16px 10px", overflowY: "auto" }}>
                    <SidebarContent />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div className="settings-scroll" style={{ flex: 1, overflowY: "auto", padding: "clamp(14px,4vw,24px)" }}>
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>

                  {/* PROFILE */}
                  {activeTab === "Profile" && (
                    <>
                      <Card title="Profile Picture" description="Shown to your friends across StoneChat">
                        <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,4vw,24px)", padding: "16px 0 18px", flexWrap: "wrap" }}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <div style={{ width: "clamp(68px,14vw,88px)", height: "clamp(68px,14vw,88px)", borderRadius: "50%", background: "linear-gradient(135deg,#00f5a0,#00d9f5)", padding: 2 }}>
                              <img src={profilePic || DEFAULT_PROFILE_PIC} alt="Profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", background: "#070a0f" }} />
                            </div>
                            <label style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#00f5a0,#00d9f5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #070a0f" }}>
                              <Edit2 size={11} color="#000" />
                              <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onloadend = () => setProfilePic(r.result as string); r.readAsDataURL(f); }} style={{ display: "none" }} />
                            </label>
                          </div>
                          <div>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(15px,4vw,18px)", fontWeight: 700, background: "linear-gradient(90deg,#00f5a0,#00d9f5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>{username || "Your Name"}</div>
                            <div style={{ color: textMuted, fontSize: "clamp(11px,2.5vw,12px)", marginBottom: 14 }}>JPG, PNG or WEBP · Max 5MB</div>
                            <SaveBtn onClick={handleSavePic} loading={savingPic} label="Update Photo" />
                          </div>
                        </div>
                      </Card>
                      <Card title="Username" description="Your unique display name on StoneChat">
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "14px 0 18px" }}>
                          <DarkInput value={username} onChange={setUsername} placeholder="Username" />
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <SaveBtn onClick={handleSaveUsername} loading={savingUsername} label="Save Username" />
                          </div>
                        </div>
                      </Card>
                    </>
                  )}

                  {/* ACCOUNT - email */}
                  {activeTab === "Account" && (
                    <Card title="Email Address" description="Enter your new email and confirm with your current password">
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 0 18px" }}>
                        <DarkInput value={email} onChange={setEmail} placeholder="New email address" />
                        <DarkInput value={emailPassword} onChange={setEmailPassword} placeholder="Current password (to confirm)" type="password" />
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <SaveBtn onClick={handleSaveEmail} loading={savingEmail} label="Update Email" />
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* SECURITY - password */}
                  {activeTab === "Security" && (
                    <Card title="Change Password" description="Use a strong password you don't use elsewhere">
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 0 10px" }}>
                        <DarkInput value={currentPw} onChange={setCurrentPw} placeholder="Current password" type="password" />
                        <DarkInput value={newPw}     onChange={setNewPw}     placeholder="New password"     type="password" />
                        <DarkInput value={confirmPw} onChange={setConfirmPw} placeholder="Confirm new password" type="password" />
                        {newPw.length > 0 && (
                          <div>
                            <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                              {[1,2,3,4,5].map(n => (
                                <div key={n} style={{ flex: 1, height: 3, borderRadius: 99, transition: "background 0.3s", background: n <= pwStrength ? (pwStrength <= 2 ? "#ef4444" : pwStrength <= 3 ? "#f5c400" : "#00f5a0") : "rgba(128,128,128,0.2)" }} />
                              ))}
                            </div>
                            {pwRules.map(r => <RuleRow key={r.label} label={r.label} pass={r.pass} />)}
                          </div>
                        )}
                        {confirmPw.length > 0 && (
                          <div style={{ fontSize: 12, color: confirmPw === newPw ? "#00f5a0" : "#ef4444", display: "flex", alignItems: "center", gap: 5 }}>
                            {confirmPw === newPw ? <><Check size={12} /> Passwords match</> : "✕ Passwords do not match"}
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4, paddingBottom: 8 }}>
                          <SaveBtn onClick={handleChangePassword} loading={savingPw} label="Change Password" />
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* APPEARANCE */}
                  {activeTab === "Appearance" && (
                    <Card title="Theme" description="Choose how StoneChat looks on this device">
                      <div style={{ padding: "16px 0 18px" }}>
                        <div style={{ display: "flex", gap: 12 }}>
                          {(["dark","light"] as const).map(t => (
                            <motion.button key={t} onClick={() => setTheme(t)}
                              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                              style={{ flex: 1, padding: "18px 12px", borderRadius: 16, cursor: "pointer", background: theme === t ? "rgba(0,245,160,0.08)" : (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"), border: `1.5px solid ${theme === t ? "#00f5a0" : borderCol}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, boxShadow: theme === t ? "0 0 20px rgba(0,245,160,0.1)" : "none", transition: "all 0.2s" }}>
                              <div style={{ width: "100%", height: 60, borderRadius: 10, background: t === "dark" ? "#070a0f" : "#f0f2f5", border: "1px solid rgba(125,125,125,0.15)", display: "flex", alignItems: "flex-end", padding: 8, gap: 4 }}>
                                <div style={{ flex: 2, height: 8, borderRadius: 99, background: t === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
                                <div style={{ flex: 1, height: 8, borderRadius: 99, background: "linear-gradient(135deg,#00f5a0,#00d9f5)" }} />
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, color: theme === t ? "#00f5a0" : textMuted, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: theme === t ? 600 : 400 }}>
                                {t === "dark" ? <Moon size={14} /> : <Sun size={14} />}
                                {t === "dark" ? "Dark" : "Light"}
                                {theme === t && <Check size={12} />}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                        <div style={{ color: textMuted, fontSize: 12, marginTop: 14, lineHeight: 1.5 }}>
                          Theme is saved automatically and persists across sessions.
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* PRIVACY */}
                  {activeTab === "Privacy" && (
                    <Card title="Privacy Controls" description="Manage who can see your information">
                      <SettingRow label="Private Profile" description="Only approved friends can see your activity">
                        <Toggle value={isPrivate} onChange={setIsPrivate} />
                      </SettingRow>
                      <SettingRow label="Hide Online Status" description="Others won't see when you're active">
                        <Toggle value={hideOnline} onChange={setHideOnline} />
                      </SettingRow>
                      <div style={{ paddingBottom: 4 }} />
                    </Card>
                  )}

                  {/* NOTIFICATIONS */}
                  {activeTab === "Notifications" && (
                    <Card title="Notifications" description="Control how StoneChat notifies you">
                      <SettingRow label="Email Notifications" description="Receive updates via email">
                        <Toggle value={emailNotif} onChange={setEmailNotif} />
                      </SettingRow>
                      <SettingRow label="Push Notifications" description="Get alerts on your device">
                        <Toggle value={pushNotif} onChange={setPushNotif} />
                      </SettingRow>
                      <div style={{ paddingBottom: 4 }} />
                    </Card>
                  )}

                  {/* ADVANCED */}
                  {activeTab === "Advanced" && (
                    <Card title="Advanced Options" description="Experimental features">
                      <SettingRow label="Beta Features" description="Try new features before they're released">
                        <Toggle value={betaFeatures} onChange={setBetaFeatures} />
                      </SettingRow>
                      <div style={{ paddingBottom: 4 }} />
                    </Card>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: `1px solid ${borderCol}`, padding: "clamp(10px,2vw,14px) clamp(14px,4vw,24px)", display: "flex", justifyContent: "flex-end", background: isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.02)", flexShrink: 0 }}>
            <motion.button whileHover={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }} whileTap={{ scale: 0.97 }} onClick={onCloseSettings}
              style={{ padding: "10px 22px", borderRadius: 12, cursor: "pointer", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${borderCol}`, color: textMuted, fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans',sans-serif" }}>
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsForm;