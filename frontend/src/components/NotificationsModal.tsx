import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification, type NotificationRecord, type NotificationType } from './NotificationContext';

// ── Type config ────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<NotificationType, {
  accent: string; bg: string; border: string; icon: React.ReactNode;
}> = {
  success: {
    accent: '#00f5a0', bg: 'rgba(0,245,160,0.06)', border: 'rgba(0,245,160,0.18)',
    icon: <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8.5" stroke="#00f5a0" strokeWidth="1.2"/><path d="M5.5 9.5L7.5 11.5L12.5 6.5" stroke="#00f5a0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  error: {
    accent: '#ff4d6a', bg: 'rgba(255,77,106,0.06)', border: 'rgba(255,77,106,0.18)',
    icon: <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8.5" stroke="#ff4d6a" strokeWidth="1.2"/><path d="M6 6L12 12M12 6L6 12" stroke="#ff4d6a" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  },
  info: {
    accent: '#00d9f5', bg: 'rgba(0,217,245,0.06)', border: 'rgba(0,217,245,0.18)',
    icon: <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8.5" stroke="#00d9f5" strokeWidth="1.2"/><path d="M9 8V13" stroke="#00d9f5" strokeWidth="1.6" strokeLinecap="round"/><circle cx="9" cy="5.5" r="1" fill="#00d9f5"/></svg>,
  },
  warning: {
    accent: '#f5c400', bg: 'rgba(245,196,0,0.06)', border: 'rgba(245,196,0,0.18)',
    icon: <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><path d="M9 2L16.5 15H1.5L9 2Z" stroke="#f5c400" strokeWidth="1.2" strokeLinejoin="round"/><path d="M9 7V11" stroke="#f5c400" strokeWidth="1.6" strokeLinecap="round"/><circle cx="9" cy="13" r="0.9" fill="#f5c400"/></svg>,
  },
};

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (s < 60) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ── Single row ─────────────────────────────────────────────────────────────────
const NotifRow = ({ notif, index }: { notif: NotificationRecord; index: number }) => {
  const cfg = TYPE_CONFIG[notif.type];
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: index * 0.025 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '13px 16px',
        background: notif.read ? 'rgba(255,255,255,0.02)' : cfg.bg,
        border: `1px solid ${notif.read ? 'rgba(255,255,255,0.05)' : cfg.border}`,
        borderRadius: 14,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Left accent bar for unread */}
      {!notif.read && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: `linear-gradient(180deg, ${cfg.accent}, transparent)`,
          borderRadius: '14px 0 0 14px',
        }} />
      )}

      {/* Icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: 'rgba(255,255,255,0.04)', border: `1px solid ${cfg.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {cfg.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{
            color: notif.read ? 'rgba(255,255,255,0.6)' : '#fff',
            fontSize: 13, fontWeight: notif.read ? 400 : 600,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1, minWidth: 0,
          }}>
            {notif.title}
          </span>
          {!notif.read && (
            <motion.div
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.accent, flexShrink: 0 }}
            />
          )}
        </div>
        {notif.message && (
          <p style={{
            color: 'rgba(255,255,255,0.35)', fontSize: 12,
            lineHeight: 1.5, margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {notif.message}
          </p>
        )}
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 4, display: 'block' }}>
          {relativeTime(notif.receivedAt)}
        </span>
      </div>
    </motion.div>
  );
};

// ── Modal ──────────────────────────────────────────────────────────────────────
type Props = { isOpen: boolean; onClose: () => void };

const NotificationsModal = ({ isOpen, onClose }: Props) => {
  const { history, clearHistory, markAllRead, unreadCount } = useNotification();

  // Already sorted newest-first from the context, but enforce it here too
  const sorted = useMemo(() =>
    [...history].sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime()),
  [history]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: { label: string; items: NotificationRecord[] }[] = [];
    const seen: Record<string, number> = {};
    sorted.forEach(n => {
      const diff = Date.now() - n.receivedAt.getTime();
      const days = Math.floor(diff / 86400000);
      const label = days === 0 ? 'Today' : days === 1 ? 'Yesterday'
        : n.receivedAt.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
      if (seen[label] === undefined) {
        seen[label] = groups.length;
        groups.push({ label, items: [] });
      }
      groups[seen[label]].items.push(n);
    });
    return groups;
  }, [sorted]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="notif-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Panel */}
          <motion.div
            key="notif-panel"
            initial={{ x: '100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 34, mass: 0.9 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 400, maxWidth: '95vw',
              zIndex: 1001,
              background: 'rgba(7,10,15,0.97)',
              backdropFilter: 'blur(28px)',
              borderLeft: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', flexDirection: 'column',
              fontFamily: "'DM Sans', sans-serif",
              overflow: 'hidden',
            }}
          >
            {/* Top accent line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, #00d9f5, #7b2fff, transparent)',
            }} />

            {/* Ambient orb */}
            <div style={{
              position: 'absolute', top: -60, right: -60, width: 220, height: 220,
              borderRadius: '50%', background: '#00d9f5',
              filter: 'blur(80px)', opacity: 0.05, pointerEvents: 'none',
            }} />

            {/* ── HEADER ── */}
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0, position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800,
                    color: '#fff', letterSpacing: '-0.4px',
                  }}>
                    Notifications
                  </div>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{
                        fontSize: 11, fontWeight: 700,
                        background: 'linear-gradient(135deg, #00d9f5, #7b2fff)',
                        color: '#fff', borderRadius: 99, padding: '2px 8px',
                      }}
                    >
                      {unreadCount} new
                    </motion.span>
                  )}
                </div>

                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.5)', fontSize: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </motion.button>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={markAllRead}
                    style={{
                      flex: 1, padding: '7px 0', borderRadius: 9, cursor: 'pointer',
                      background: 'rgba(0,217,245,0.08)',
                      border: '1px solid rgba(0,217,245,0.2)',
                      color: '#00d9f5', fontSize: 12, fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Mark all read
                  </motion.button>
                )}
                {history.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.03, color: '#ff4d6a', borderColor: 'rgba(255,77,106,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={clearHistory}
                    style={{
                      flex: 1, padding: '7px 0', borderRadius: 9, cursor: 'pointer',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'color 0.2s, border-color 0.2s',
                    }}
                  >
                    Clear all
                  </motion.button>
                )}
              </div>
            </div>

            {/* ── LIST ── */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '12px 16px 24px',
            }}
              className="notif-modal-scroll"
            >
              <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
                .notif-modal-scroll::-webkit-scrollbar { width: 3px; }
                .notif-modal-scroll::-webkit-scrollbar-track { background: transparent; }
                .notif-modal-scroll::-webkit-scrollbar-thumb { background: rgba(0,217,245,0.2); border-radius: 3px; }
              `}</style>

              {sorted.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{ textAlign: 'center', padding: '64px 24px', color: 'rgba(255,255,255,0.2)' }}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ fontSize: 44, marginBottom: 14 }}
                  >
                    🔔
                  </motion.div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.25)', marginBottom: 6 }}>
                    No notifications yet
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.15)' }}>
                    You're all caught up!
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {grouped.map((group, gi) => (
                    <motion.div
                      key={group.label}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: gi * 0.04 }}
                      style={{ marginBottom: 20 }}
                    >
                      {/* Date divider */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{
                          color: 'rgba(255,255,255,0.22)', fontSize: 10, fontWeight: 700,
                          letterSpacing: 1.3, textTransform: 'uppercase', whiteSpace: 'nowrap',
                        }}>
                          {group.label}
                        </span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {group.items.map((notif, i) => (
                          <NotifRow key={notif.id} notif={notif} index={i} />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* ── FOOTER ── */}
            {history.length > 0 && (
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                flexShrink: 0,
              }}>
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
                  {history.length} notification{history.length !== 1 ? 's' : ''} total
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsModal;