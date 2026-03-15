import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2, X, User, Settings, Shield, Bell, Palette,
  Lock, Cpu, Eye, EyeOff, Check, Menu,
} from "lucide-react";
import api from "../api/axios";
import { useNotification } from "./NotificationContext";

interface SettingsFormProps {
  onCloseSettings: () => void;
}

const DEFAULT_PROFILE_PIC = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const TABS = [
  { key: "Profile",       label: "Profile",       icon: User },
  { key: "General",       label: "General",       icon: Settings },
  { key: "Privacy",       label: "Privacy",       icon: Shield },
  { key: "Notifications", label: "Notifications", icon: Bell },
  { key: "Appearance",    label: "Appearance",    icon: Palette },
  { key: "Security",      label: "Security",      icon: Lock },
  { key: "Advanced",      label: "Advanced",      icon: Cpu },
];

/* ── Toggle ── */
const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <motion.button
    onClick={() => onChange(!value)}
    animate={{ background: value ? "linear-gradient(135deg,#00f5a0,#00d9f5)" : "rgba(255,255,255,0.08)" }}
    transition={{ duration: 0.2 }}
    style={{
      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
      position: "relative", flexShrink: 0,
      boxShadow: value ? "0 0 12px rgba(0,245,160,0.35)" : "none",
    }}
  >
    <motion.div
      animate={{ x: value ? 22 : 2 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      style={{
        position: "absolute", top: 2, width: 20, height: 20,
        borderRadius: "50%", background: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
      }}
    />
  </motion.button>
);

/* ── Setting row ── */
const SettingRow = ({ label, description, children }: {
  label: string; description?: string; children: React.ReactNode;
}) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", gap: 16,
  }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ color: "#fff", fontSize: "clamp(13px,3vw,14px)", fontWeight: 500 }}>{label}</div>
      {description && (
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(11px,2.5vw,12px)", marginTop: 2, lineHeight: 1.4 }}>
          {description}
        </div>
      )}
    </div>
    {children}
  </div>
);

/* ── Dark input ── */
const DarkInput = ({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) => {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <motion.div
      animate={{ boxShadow: focused ? "0 0 0 2px rgba(0,245,160,0.3)" : "0 0 0 1px rgba(255,255,255,0.08)" }}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        background: focused ? "rgba(0,245,160,0.04)" : "rgba(255,255,255,0.04)",
        borderRadius: 12, padding: "clamp(10px,2vw,12px) 14px",
        transition: "background 0.2s",
      }}
    >
      <input
        type={isPassword && !show ? "password" : "text"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, background: "none", border: "none", outline: "none",
          color: "#fff", fontSize: "clamp(13px,3vw,14px)",
          fontFamily: "'DM Sans',sans-serif", caretColor: "#00f5a0",
          minWidth: 0,
        }}
      />
      {isPassword && (
        <button onClick={() => setShow(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex", flexShrink: 0 }}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </motion.div>
  );
};

/* ── Card ── */
const Card = ({ children, title, description }: { children: React.ReactNode; title: string; description?: string }) => (
  <div style={{
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18, padding: "20px 18px 4px",
    marginBottom: 14,
  }}>
    <div style={{ marginBottom: 4 }}>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: "clamp(14px,3vw,15px)", fontFamily: "'Syne',sans-serif" }}>{title}</div>
      {description && (
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(11px,2.5vw,12px)", marginTop: 3 }}>{description}</div>
      )}
    </div>
    {children}
  </div>
);

/* ── Main ── */
const SettingsForm = ({ onCloseSettings }: SettingsFormProps) => {
  const { success, error } = useNotification();
  const [activeTab, setActiveTab]       = useState("Profile");
  const [sidebarOpen, setSidebarOpen]   = useState(false); // mobile drawer
  const [profilePic, setProfilePic]     = useState<string | null>(null);
  const [username, setUsername]         = useState("");
  const [fullName, setFullName]         = useState("");
  const [email, setEmail]               = useState("");
  const [isPrivate, setIsPrivate]       = useState(false);
  const [hideOnline, setHideOnline]     = useState(false);
  const [emailNotif, setEmailNotif]     = useState(true);
  const [pushNotif, setPushNotif]       = useState(false);
  const [theme, setTheme]               = useState("Dark");
  const [password, setPassword]         = useState("");
  const [betaFeatures, setBetaFeatures] = useState(false);
  const [saving, setSaving]             = useState(false);

  // Detect if narrow (mobile)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.profilePicture) setProfilePic(user.profilePicture);
    if (user?.username)       setUsername(user.username);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfilePic(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePic = () => {
    setProfilePic(null);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user) { user.profilePicture = null; localStorage.setItem("user", JSON.stringify(user)); }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) { error("Not logged in", "Please log in again."); return; }
      if (!profilePic || profilePic.startsWith("http")) { error("No changes", "Select a new profile picture first."); return; }
      const { data } = await api.post("/user/upload-profile-pic", { userId: user.id, image: profilePic });
      if (!data.status) throw new Error(data.message);
      localStorage.setItem("user", JSON.stringify(data.user));
      success("Saved!", "Profile picture updated successfully.");
      setProfilePic(data.user.profilePicture);
    } catch (err: any) {
      error("Failed", err.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const selectTab = (key: string) => {
    setActiveTab(key);
    setSidebarOpen(false); // close drawer on mobile after picking
  };

  const THEME_OPTIONS = ["Dark", "Light", "System"];

  const SidebarContent = () => (
    <>
      {TABS.map((tab, i) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;
        return (
          <motion.button
            key={tab.key}
            onClick={() => selectTab(tab.key)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 11,
              padding: "11px 14px", borderRadius: 12, border: "none", cursor: "pointer",
              background: active ? "rgba(0,245,160,0.1)" : "none",
              borderLeft: `3px solid ${active ? "#00f5a0" : "transparent"}`,
              color: active ? "#00f5a0" : "rgba(255,255,255,0.5)",
              fontSize: 13.5, fontWeight: active ? 600 : 400,
              fontFamily: "'DM Sans',sans-serif", textAlign: "left",
              transition: "all 0.15s", marginBottom: 2,
            }}
          >
            <Icon size={15} style={{ flexShrink: 0 }} />
            {tab.label}
            {active && (
              <motion.div layoutId="tab-dot" style={{
                marginLeft: "auto", width: 6, height: 6,
                borderRadius: "50%", background: "#00f5a0",
              }} />
            )}
          </motion.button>
        );
      })}
    </>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCloseSettings}
        style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "clamp(8px,3vw,16px)",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
          .settings-scroll::-webkit-scrollbar { width: 4px; }
          .settings-scroll::-webkit-scrollbar-track { background: transparent; }
          .settings-scroll::-webkit-scrollbar-thumb { background: rgba(0,245,160,0.18); border-radius: 4px; }
          input::placeholder { color: rgba(255,255,255,0.25); }
        `}</style>

        <motion.div
          initial={{ scale: 0.92, y: 28 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 28 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: "clamp(320px, 95vw, 900px)",
            height: "clamp(400px, 88vh, 700px)",
            background: "rgba(7,10,15,0.98)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "clamp(14px,3vw,24px)",
            overflow: "hidden",
            boxShadow: "0 48px 120px rgba(0,0,0,0.88)",
            backdropFilter: "blur(28px)",
            display: "flex", flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Top accent */}
          <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#00f5a0,#00d9f5,transparent)", flexShrink: 0 }} />

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "clamp(12px,3vw,18px) clamp(14px,4vw,24px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Mobile hamburger to open tab drawer */}
              {isMobile && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(p => !p)}
                  style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)", display: "flex",
                    alignItems: "center", justifyContent: "center", cursor: "pointer",
                  }}
                >
                  <Menu size={15} />
                </motion.button>
              )}
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(16px,4vw,20px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
                  Settings
                </div>
                {!isMobile && (
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 }}>
                    Manage your account and preferences
                  </div>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.09)", color: "#fff" }}
              whileTap={{ scale: 0.92 }}
              onClick={onCloseSettings}
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer",
              }}
            >
              <X size={16} />
            </motion.button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

            {/* ── DESKTOP SIDEBAR ── */}
            {!isMobile && (
              <aside style={{
                width: 200, borderRight: "1px solid rgba(255,255,255,0.06)",
                padding: "14px 10px", display: "flex", flexDirection: "column",
                flexShrink: 0, overflowY: "auto",
              }}>
                <SidebarContent />
              </aside>
            )}

            {/* ── MOBILE SIDEBAR DRAWER ── */}
            <AnimatePresence>
              {isMobile && sidebarOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(0,0,0,0.5)" }}
                  />
                  {/* Drawer */}
                  <motion.div
                    initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 340, damping: 32 }}
                    style={{
                      position: "absolute", left: 0, top: 0, bottom: 0, width: 220,
                      zIndex: 11, background: "rgba(7,10,15,0.99)",
                      borderRight: "1px solid rgba(255,255,255,0.08)",
                      padding: "16px 10px", overflowY: "auto",
                    }}
                  >
                    <SidebarContent />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Content */}
            <div className="settings-scroll" style={{ flex: 1, overflowY: "auto", padding: "clamp(14px,4vw,24px)" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >

                  {/* ── PROFILE ── */}
                  {activeTab === "Profile" && (
                    <>
                      <Card title="Profile Picture" description="Shown across StoneChat">
                        <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,4vw,24px)", padding: "16px 0 18px", flexWrap: "wrap" }}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <div style={{
                              width: "clamp(68px,14vw,88px)", height: "clamp(68px,14vw,88px)",
                              borderRadius: "50%", background: "linear-gradient(135deg,#00f5a0,#00d9f5)", padding: 2,
                            }}>
                              <img
                                src={profilePic || DEFAULT_PROFILE_PIC}
                                alt="Profile"
                                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", background: "#070a0f" }}
                              />
                            </div>
                            <label style={{
                              position: "absolute", bottom: 0, right: 0,
                              width: 26, height: 26, borderRadius: "50%",
                              background: "linear-gradient(135deg,#00f5a0,#00d9f5)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", border: "2px solid #070a0f",
                            }}>
                              <Edit2 size={11} color="#000" />
                              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                            </label>
                          </div>
                          <div>
                            <div style={{
                              fontFamily: "'Syne',sans-serif", fontSize: "clamp(15px,4vw,18px)", fontWeight: 700,
                              background: "linear-gradient(90deg,#00f5a0,#00d9f5)",
                              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4,
                            }}>
                              {username || "Your Name"}
                            </div>
                            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(11px,2.5vw,12px)", marginBottom: 12 }}>
                              JPG, PNG or WEBP · Max 5MB
                            </div>
                            {profilePic && (
                              <motion.button
                                whileHover={{ background: "rgba(255,77,106,0.14)", color: "#ff4d6a" }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleRemoveProfilePic}
                                style={{
                                  padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                                  background: "rgba(255,77,106,0.08)", border: "1px solid rgba(255,77,106,0.2)",
                                  color: "#ff6b80", fontSize: "clamp(11px,2.5vw,12px)", fontWeight: 600,
                                  fontFamily: "'DM Sans',sans-serif",
                                }}
                              >
                                Remove photo
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </Card>

                      <Card title="Username" description="Your unique display name on StoneChat">
                        <div style={{ padding: "14px 0 18px" }}>
                          <DarkInput value={username} onChange={setUsername} placeholder="Username" />
                        </div>
                      </Card>
                    </>
                  )}

                  {/* ── GENERAL ── */}
                  {activeTab === "General" && (
                    <Card title="Account Details" description="Update your personal information">
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 0 18px" }}>
                        <DarkInput value={fullName} onChange={setFullName} placeholder="Full Name" />
                        <DarkInput value={email} onChange={setEmail} placeholder="Email Address" />
                      </div>
                    </Card>
                  )}

                  {/* ── PRIVACY ── */}
                  {activeTab === "Privacy" && (
                    <Card title="Privacy Controls" description="Manage who can see your information">
                      <SettingRow label="Private Profile" description="Only approved followers can see your activity">
                        <Toggle value={isPrivate} onChange={setIsPrivate} />
                      </SettingRow>
                      <SettingRow label="Hide Online Status" description="Others won't see when you're active">
                        <Toggle value={hideOnline} onChange={setHideOnline} />
                      </SettingRow>
                      <div style={{ paddingBottom: 4 }} />
                    </Card>
                  )}

                  {/* ── NOTIFICATIONS ── */}
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

                  {/* ── APPEARANCE ── */}
                  {activeTab === "Appearance" && (
                    <Card title="Theme" description="Choose how StoneChat looks">
                      <div style={{
                        display: "flex", gap: 10, padding: "16px 0 18px",
                        flexWrap: "wrap",
                      }}>
                        {THEME_OPTIONS.map(opt => (
                          <motion.button
                            key={opt}
                            onClick={() => setTheme(opt)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                              flex: "1 1 80px", padding: "12px 8px", borderRadius: 14, cursor: "pointer",
                              background: theme === opt ? "rgba(0,245,160,0.1)" : "rgba(255,255,255,0.04)",
                              border: `1px solid ${theme === opt ? "rgba(0,245,160,0.35)" : "rgba(255,255,255,0.08)"}`,
                              color: theme === opt ? "#00f5a0" : "rgba(255,255,255,0.45)",
                              fontSize: "clamp(12px,2.5vw,13px)", fontWeight: theme === opt ? 600 : 400,
                              fontFamily: "'DM Sans',sans-serif",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                            }}
                          >
                            {theme === opt && <Check size={12} />}
                            {opt}
                          </motion.button>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* ── SECURITY ── */}
                  {activeTab === "Security" && (
                    <Card title="Change Password" description="Keep your account secure">
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 0 18px" }}>
                        <DarkInput value={password} onChange={setPassword} placeholder="New Password" type="password" />
                        <DarkInput value="" onChange={() => {}} placeholder="Confirm New Password" type="password" />
                      </div>
                    </Card>
                  )}

                  {/* ── ADVANCED ── */}
                  {activeTab === "Advanced" && (
                    <Card title="Advanced Options" description="Experimental and developer features">
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
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "clamp(10px,2vw,14px) clamp(14px,4vw,24px)",
            display: "flex", justifyContent: "flex-end", gap: 10,
            background: "rgba(255,255,255,0.015)", flexShrink: 0, flexWrap: "wrap",
          }}>
            <motion.button
              whileHover={{ background: "rgba(255,255,255,0.07)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onCloseSettings}
              style={{
                padding: "clamp(8px,2vw,10px) clamp(16px,3vw,22px)", borderRadius: 12, cursor: "pointer",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.55)", fontSize: "clamp(13px,3vw,14px)", fontWeight: 500,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(0,245,160,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSaveChanges}
              disabled={saving}
              style={{
                padding: "clamp(8px,2vw,10px) clamp(18px,3vw,26px)", borderRadius: 12,
                cursor: saving ? "not-allowed" : "pointer", border: "none",
                background: saving ? "rgba(0,245,160,0.4)" : "linear-gradient(135deg,#00f5a0,#00d9f5)",
                color: "#000", fontSize: "clamp(13px,3vw,14px)", fontWeight: 700,
                fontFamily: "'DM Sans',sans-serif",
                boxShadow: "0 4px 16px rgba(0,245,160,0.25)",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {saving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%" }}
                  />
                  Saving…
                </>
              ) : "Save Changes"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsForm;