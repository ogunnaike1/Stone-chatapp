import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = persistent
}

// History entry — same as Notification plus a timestamp
export interface NotificationRecord extends Notification {
  receivedAt: Date;
  read: boolean;
}

interface NotificationContextValue {
  // Active toast notifications (live, auto-dismiss)
  notifications: Notification[];
  notify: (options: Omit<Notification, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;

  // Full persistent history (for the Notifications page)
  history: NotificationRecord[];
  clearHistory: () => void;
  markAllRead: () => void;
  unreadCount: number;

  // Convenience helpers
  success: (title: string, message?: string, duration?: number) => string;
  error:   (title: string, message?: string, duration?: number) => string;
  info:    (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotification = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within <NotificationProvider>');
  return ctx;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [history, setHistory]             = useState<NotificationRecord[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
    setNotifications([]);
  }, []);

  const notify = useCallback((options: Omit<Notification, 'id'>): string => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = options.duration ?? 4500;
    const newNotif: Notification = { ...options, id, duration };

    // Add to live toasts (cap at 5)
    setNotifications(prev => {
      const capped = prev.length >= 5 ? prev.slice(1) : prev;
      return [...capped, newNotif];
    });

    // Add to persistent history (newest first, cap at 100)
    setHistory(prev => {
      const record: NotificationRecord = { ...newNotif, receivedAt: new Date(), read: false };
      const updated = [record, ...prev];
      return updated.length > 100 ? updated.slice(0, 100) : updated;
    });

    if (duration > 0) {
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    }

    return id;
  }, [dismiss]);

  const clearHistory = useCallback(() => setHistory([]), []);

  const markAllRead = useCallback(() => {
    setHistory(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = history.filter(n => !n.read).length;

  const success = useCallback((title: string, message?: string, duration?: number) =>
    notify({ type: 'success', title, message, duration }), [notify]);

  const error = useCallback((title: string, message?: string, duration?: number) =>
    notify({ type: 'error', title, message, duration }), [notify]);

  const info = useCallback((title: string, message?: string, duration?: number) =>
    notify({ type: 'info', title, message, duration }), [notify]);

  const warning = useCallback((title: string, message?: string, duration?: number) =>
    notify({ type: 'warning', title, message, duration }), [notify]);

  return (
    <NotificationContext.Provider value={{
      notifications, notify, dismiss, dismissAll,
      history, clearHistory, markAllRead, unreadCount,
      success, error, info, warning,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};