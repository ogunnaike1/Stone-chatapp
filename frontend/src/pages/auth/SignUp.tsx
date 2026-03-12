import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../components/NotificationContext';
import { NotificationContainer } from '../../components/NotificationToast';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

/* ─────────────────────────────────────────────
   PASSWORD VALIDATION (mirrored from backend)
───────────────────────────────────────────── */
interface PasswordRule {
  id: string;
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { id: 'minLength', label: 'At least 8 characters',         test: (pw) => pw.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter (A–Z)',    test: (pw) => /[A-Z]/.test(pw) },
  { id: 'lowercase', label: 'One lowercase letter (a–z)',    test: (pw) => /[a-z]/.test(pw) },
  { id: 'digit',     label: 'One number (0–9)',              test: (pw) => /[0-9]/.test(pw) },
  { id: 'special',   label: 'One special character (!@#$…)', test: (pw) => /[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]/.test(pw) },
  { id: 'noSpaces',  label: 'No spaces',                     test: (pw) => pw.length > 0 && !/\s/.test(pw) },
];

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['#ff4d6a', '#ff4d6a', '#f5c400', '#00d9f5', '#00f5a0'];

function getStrength(pw: string): number {
  if (!pw) return 0;
  const passed = PASSWORD_RULES.filter((r) => r.test(pw)).length;
  if (passed <= 1) return 1;
  if (passed <= 3) return 2;
  if (passed <= 4) return 3;
  return 4;
}

/* ─────────────────────────────────────────────
   STRENGTH METER
───────────────────────────────────────────── */
const StrengthMeter = ({ password }: { password: string }) => {
  const strength = getStrength(password);
  const color = STRENGTH_COLORS[strength];
  const label = STRENGTH_LABELS[strength];

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ marginTop: 10 }}
    >
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{ flex: 1, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}
          >
            <motion.div
              animate={{ scaleX: strength >= i ? 1 : 0, backgroundColor: color }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ height: '100%', transformOrigin: 'left', borderRadius: 99 }}
            />
          </div>
        ))}
      </div>
      {password.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <motion.span
            key={label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: 0.5 }}
          >
            {label}
          </motion.span>
        </div>
      )}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   RULE CHECKLIST
───────────────────────────────────────────── */
const RuleChecklist = ({ password }: { password: string }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.28 }}
    style={{
      marginTop: 10,
      padding: '12px 14px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12,
      overflow: 'hidden',
    }}
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px 12px' }}>
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <motion.div
            key={rule.id}
            animate={{ opacity: ok ? 1 : 0.5 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}
          >
            {/* Dot / checkmark */}
            <motion.div
              animate={{
                backgroundColor: ok ? '#00f5a0' : 'rgba(255,255,255,0.12)',
                scale: ok ? [1, 1.3, 1] : 1,
              }}
              transition={{ duration: 0.25 }}
              style={{
                width: 15,
                height: 15,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AnimatePresence>
                {ok && (
                  <motion.svg
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    width="8" height="8" viewBox="0 0 8 8" fill="none"
                  >
                    <path d="M1.5 4L3 5.5L6.5 2" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>
            <span style={{ fontSize: 11, color: ok ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.28)', lineHeight: 1.4 }}>
              {rule.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────
   FLOATING ORB
───────────────────────────────────────────── */
const FloatingOrb = ({ style }: { style: React.CSSProperties }) => (
  <motion.div
    style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.18, pointerEvents: 'none', ...style }}
    animate={{ y: [0, -24, 0], scale: [1, 1.08, 1] }}
    transition={{ duration: (style as any).animDuration || 7, repeat: Infinity, ease: 'easeInOut', delay: (style as any).animDelay || 0 }}
  />
);

/* ─────────────────────────────────────────────
   SIGN UP PAGE
───────────────────────────────────────────── */
const SignUp = () => {
  const navigate = useNavigate();
  const { success, error } = useNotification();

  const [formData, setFormData]         = useState({ username: '', email: '', password: '' });
  const [loading, setLoading]           = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRules, setShowRules]       = useState(false);
  const [touched, setTouched]           = useState(false);
  const [mounted, setMounted]           = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') setTouched(true);
  };

  const handleSubmit = async () => {
    const failedRules = PASSWORD_RULES.filter((r) => !r.test(formData.password));
    if (failedRules.length > 0) {
      setShowRules(true);
      error('Weak password', failedRules[0].label);
      return;
    }

    setLoading(true);
    try {
      await api.post('/user/signup', formData);
      success('Account created!', 'Welcome to StoneChat. Redirecting to login…');
      setTimeout(() => navigate('/auth/login'), 1500);
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
      const pwErrors: string[] = err.response?.data?.passwordErrors || [];
      error('Signup failed', pwErrors.length > 0 ? pwErrors[0] : serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const allRulesPass = PASSWORD_RULES.every((r) => r.test(formData.password));

  const inputStyle = (field: string): React.CSSProperties => ({
    position: 'relative', zIndex: 1, width: '100%',
    background: focusedField === field ? 'rgba(0,245,160,0.05)' : 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderColor: focusedField === field ? 'transparent' : 'rgba(255,255,255,0.08)',
    borderRadius: 13,
    padding: field === 'password' ? '13px 44px 13px 16px' : '13px 16px',
    color: '#fff', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'background 0.2s, border-color 0.2s', caretColor: '#00f5a0',
  });

  return (
    <>
      <NotificationContainer />
      <div style={{ minHeight: '100vh', background: '#070a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
          * { box-sizing: border-box; }
          input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
            -webkit-text-fill-color: #fff;
            -webkit-box-shadow: 0 0 0px 1000px rgba(255,255,255,0.04) inset;
            transition: background-color 5000s ease-in-out 0s;
          }
          ::placeholder { color: rgba(255,255,255,0.25) !important; }
        `}</style>

        <FloatingOrb style={{ width: 400, height: 400, background: '#00d9f5', right: '-6%', top: '-8%', animDuration: 9 } as any} />
        <FloatingOrb style={{ width: 380, height: 380, background: '#00f5a0', left: '-8%', top: '20%', animDuration: 8, animDelay: 1.5 } as any} />
        <FloatingOrb style={{ width: 260, height: 260, background: '#7b2fff', right: '15%', bottom: '-6%', animDuration: 7, animDelay: 2.5 } as any} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        <AnimatePresence>
          {mounted && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440, margin: '0 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 28, padding: '48px 40px 44px', backdropFilter: 'blur(24px)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}
            >
              {/* Top accent */}
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,217,245,0.5),transparent)' }} />

              {/* Logo */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg,#00f5a0,#00d9f5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px', marginBottom: 6 }}>StoneChat</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Create your account. It's free.</div>
              </motion.div>

              {/* Username */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.18 }} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <motion.div animate={{ opacity: focusedField === 'username' ? 1 : 0 }} transition={{ duration: 0.2 }} style={{ position: 'absolute', inset: -1, borderRadius: 14, background: 'linear-gradient(135deg,rgba(0,245,160,0.3),rgba(0,217,245,0.3))', zIndex: 0 }} />
                  <input type="text" name="username" placeholder="yourname" onChange={handleChange} onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)} onKeyDown={handleKeyDown} style={inputStyle('username')} />
                </div>
              </motion.div>

              {/* Email */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.24 }} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <motion.div animate={{ opacity: focusedField === 'email' ? 1 : 0 }} transition={{ duration: 0.2 }} style={{ position: 'absolute', inset: -1, borderRadius: 14, background: 'linear-gradient(135deg,rgba(0,245,160,0.3),rgba(0,217,245,0.3))', zIndex: 0 }} />
                  <input type="email" name="email" placeholder="you@example.com" onChange={handleChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} onKeyDown={handleKeyDown} style={inputStyle('email')} />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.30 }} style={{ marginBottom: 24 }}>
                {/* Label row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Password</label>
                  <button type="button" onClick={() => setShowRules((p) => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: showRules ? '#00f5a0' : 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: "'DM Sans',sans-serif", padding: 0, transition: 'color 0.2s' }}>
                    {showRules ? 'hide rules' : 'show rules'}
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  {/* Focus glow */}
                  <motion.div animate={{ opacity: focusedField === 'password' ? 1 : 0 }} transition={{ duration: 0.2 }} style={{ position: 'absolute', inset: -1, borderRadius: 14, background: 'linear-gradient(135deg,rgba(0,245,160,0.3),rgba(0,217,245,0.3))', zIndex: 0 }} />
                  {/* Valid glow — green when all pass */}
                  <motion.div animate={{ opacity: allRulesPass && touched ? 1 : 0 }} transition={{ duration: 0.35 }} style={{ position: 'absolute', inset: -1, borderRadius: 14, background: 'rgba(0,245,160,0.25)', boxShadow: '0 0 16px rgba(0,245,160,0.2)', zIndex: 0 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    onFocus={() => { setFocusedField('password'); setShowRules(true); }}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={handleKeyDown}
                    style={inputStyle('password')}
                  />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 16, lineHeight: 1, transition: 'color 0.2s', padding: 0 }} onMouseEnter={(e) => (e.currentTarget.style.color = '#00f5a0')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>

                {/* Strength bar */}
                <AnimatePresence>
                  {touched && <StrengthMeter password={formData.password} />}
                </AnimatePresence>

                {/* Rule checklist */}
                <AnimatePresence>
                  {showRules && touched && <RuleChecklist password={formData.password} />}
                </AnimatePresence>
              </motion.div>

              {/* Submit */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.38 }}>
                <motion.button
                  onClick={handleSubmit}
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02, boxShadow: '0 0 40px rgba(0,217,245,0.35)' } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  style={{ width: '100%', padding: '15px', borderRadius: 13, border: 'none', background: loading ? 'rgba(0,217,245,0.3)' : 'linear-gradient(135deg,#00d9f5,#00f5a0)', color: '#000', fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: loading ? 'not-allowed' : 'pointer', position: 'relative', overflow: 'hidden', letterSpacing: 0.2 }}
                >
                  {!loading && (
                    <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }} style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)', pointerEvents: 'none' }} />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%' }} />
                        Creating account…
                      </span>
                    ) : 'Create Account →'}
                  </span>
                </motion.button>
              </motion.div>

              {/* Divider */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.48 }} style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </motion.div>

              {/* Login link */}
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.52 }} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 14, margin: 0 }}>
                Already have an account?{' '}
                <Link to="/auth/login" style={{ color: '#00f5a0', textDecoration: 'none', fontWeight: 600, transition: 'opacity 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                  Sign In
                </Link>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SignUp;