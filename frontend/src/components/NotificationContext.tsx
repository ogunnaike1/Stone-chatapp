import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = persistent
}

interface NotificationContextValue {
  notifications: Notification[];
  notify: (options: Omit<Notification, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  // Convenience helpers
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
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

    setNotifications(prev => {
      // Cap at 5 visible notifications
      const capped = prev.length >= 5 ? prev.slice(1) : prev;
      return [...capped, { ...options, id, duration }];
    });

    if (duration > 0) {
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    }

    return id;
  }, [dismiss]);

  const success = useCallback((title: string, message?: string, duration?: number) =>
    notify({ type: 'success', title, message, duration }), [notify]);

  const error = useCallback((title: string, message?: string, duration?: number) =>
    notify({ type: 'error', title, message, duration }), [notify]);

  const info = useCallback((title: string, message?: string, duration?: number) =>
    notify({ type: 'info', title, message, duration }), [notify]);

  const warning = useCallback((title: string, message?: string, duration?: number) =>
    notify({ type: 'warning', title, message, duration }), [notify]);

  return (
    <NotificationContext.Provider value={{ notifications, notify, dismiss, dismissAll, success, error, info, warning }}>
      {children}
    </NotificationContext.Provider>
  );
};
