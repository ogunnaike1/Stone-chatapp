import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification, type Notification, type NotificationType } from './NotificationContext';

// ─── Theme config per type ───────────────────────────────────────────────────
const THEMES: Record<NotificationType, {
  accent: string;
  glow: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  progressColor: string;
}> = {
  success: {
    accent: '#00f5a0',
    glow: 'rgba(0,245,160,0.18)',
    bg: 'rgba(0,245,160,0.05)',
    border: 'rgba(0,245,160,0.2)',
    progressColor: 'linear-gradient(90deg, #00f5a0, #00d9f5)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="8.5" stroke="#00f5a0" strokeWidth="1.2"/>
        <path d="M5.5 9.5L7.5 11.5L12.5 6.5" stroke="#00f5a0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  error: {
    accent: '#ff4d6a',
    glow: 'rgba(255,77,106,0.18)',
    bg: 'rgba(255,77,106,0.05)',
    border: 'rgba(255,77,106,0.2)',
    progressColor: 'linear-gradient(90deg, #ff4d6a, #ff8fa3)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="8.5" stroke="#ff4d6a" strokeWidth="1.2"/>
        <path d="M6 6L12 12M12 6L6 12" stroke="#ff4d6a" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  info: {
    accent: '#00d9f5',
    glow: 'rgba(0,217,245,0.18)',
    bg: 'rgba(0,217,245,0.05)',
    border: 'rgba(0,217,245,0.2)',
    progressColor: 'linear-gradient(90deg, #00d9f5, #7b2fff)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="8.5" stroke="#00d9f5" strokeWidth="1.2"/>
        <path d="M9 8V13" stroke="#00d9f5" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="9" cy="5.5" r="1" fill="#00d9f5"/>
      </svg>
    ),
  },
  warning: {
    accent: '#f5c400',
    glow: 'rgba(245,196,0,0.18)',
    bg: 'rgba(245,196,0,0.05)',
    border: 'rgba(245,196,0,0.2)',
    progressColor: 'linear-gradient(90deg, #f5c400, #ff9500)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L16.5 15H1.5L9 2Z" stroke="#f5c400" strokeWidth="1.2" strokeLinejoin="round"/>
        <path d="M9 7V11" stroke="#f5c400" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="9" cy="13" r="0.9" fill="#f5c400"/>
      </svg>
    ),
  },
};

// ─── Progress bar (drains over duration) ─────────────────────────────────────
const ProgressBar: React.FC<{ duration: number; color: string; paused: boolean }> = ({ duration, color, paused }) => {
  const [width, setWidth] = useState(100);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(paused);
  const elapsed = useRef(0);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    if (duration <= 0) return;

    const tick = (timestamp: number) => {
      if (!pausedRef.current) {
        if (startRef.current === null) startRef.current = timestamp - elapsed.current;
        elapsed.current = timestamp - startRef.current;
        const pct = Math.max(0, 100 - (elapsed.current / duration) * 100);
        setWidth(pct);
        if (pct > 0) {
          rafRef.current = requestAnimationFrame(tick);
        }
      } else {
        startRef.current = null;
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: '0 0 14px 14px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${width}%`, background: color, transition: 'none', borderRadius: 2 }} />
    </div>
  );
};

// ─── Single notification card ─────────────────────────────────────────────────
const NotifCard: React.FC<{ notif: Notification; onDismiss: () => void }> = ({ notif, onDismiss }) => {
  const theme = THEMES[notif.type];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.22, ease: 'easeIn' } }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: 360,
        background: `rgba(7,10,15,0.92)`,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: '14px 16px 18px',
        backdropFilter: 'blur(24px)',
        boxShadow: `0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03), inset 0 0 30px ${theme.glow}`,
        cursor: 'default',
        overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, ${theme.accent}, transparent)`,
        borderRadius: '14px 0 0 14px',
      }} />

      {/* Subtle top glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '50%', height: 1,
        background: `linear-gradient(90deg, transparent, ${theme.accent}60, transparent)`,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingLeft: 8 }}>
        {/* Icon with pulse */}
        <div style={{ position: 'relative', flexShrink: 0, marginTop: 1 }}>
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: -6,
              borderRadius: '50%',
              background: theme.glow,
            }}
          />
          {theme.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.3,
            marginBottom: notif.message ? 4 : 0,
            letterSpacing: '-0.1px',
          }}>
            {notif.title}
          </div>
          {notif.message && (
            <div style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: 12.5,
              lineHeight: 1.55,
            }}>
              {notif.message}
            </div>
          )}
        </div>

        {/* Close button */}
        <motion.button
          onClick={onDismiss}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            color: 'rgba(255,255,255,0.35)',
            fontSize: 14,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </motion.button>
      </div>

      {/* Progress bar */}
      {(notif.duration ?? 4500) > 0 && (
        <ProgressBar
          duration={notif.duration ?? 4500}
          color={theme.progressColor}
          paused={hovered}
        />
      )}
    </motion.div>
  );
};

// ─── Container: renders all active notifications ──────────────────────────────
export const NotificationContainer: React.FC = () => {
  const { notifications, dismiss, dismissAll } = useNotification();

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        {/* Dismiss all — shows when 2+ notifications */}
        <AnimatePresence>
          {notifications.length >= 2 && (
            <motion.button
              key="dismiss-all"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onClick={dismissAll}
              style={{
                pointerEvents: 'all',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 50,
                padding: '5px 14px',
                color: 'rgba(255,255,255,0.45)',
                fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
              }}
              whileHover={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Clear all ({notifications.length})
            </motion.button>
          )}
        </AnimatePresence>

        {/* Notification cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'all' }}>
          <AnimatePresence mode="popLayout">
            {notifications.map(n => (
              <NotifCard key={n.id} notif={n} onDismiss={() => dismiss(n.id)} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};
