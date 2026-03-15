import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import api from "../api/axios";

// ── Idle timeout: log out after 15 minutes of no activity ─────────────────────
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

// ── Events that count as "user is active" ─────────────────────────────────────
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove", "mousedown", "keydown", "touchstart", "scroll", "click",
];

const getTokenExpiry = (token: string): number | null => {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
};

const isTokenValid = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  const exp = getTokenExpiry(token);
  if (!exp) return false;
  if (Date.now() >= exp * 1000) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }
  return true;
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const [valid, setValid] = useState(() => isTokenValid());

  const lastActivityRef = useRef<number>(Date.now());
  const lastRefreshRef  = useRef<number>(0);

  useEffect(() => {
    if (!valid) return;

    // 1. Track activity
    const onActivity = () => { lastActivityRef.current = Date.now(); };
    ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, onActivity, { passive: true }));

    // 2. Refresh token while user is active (every 4s, debounced to max once per 5s)
    const refreshInterval = setInterval(async () => {
      const idleMs    = Date.now() - lastActivityRef.current;
      const sinceLast = Date.now() - lastRefreshRef.current;

      if (idleMs < IDLE_TIMEOUT_MS && sinceLast > 5000) {
        try {
          const res = await api.post("/user/refresh-token");
          if (res.data?.token) {
            localStorage.setItem("token", res.data.token);
            lastRefreshRef.current = Date.now();
          }
        } catch {
          // 401 handled globally by axios interceptor
        }
      }
    }, 4000);

    // 3. Idle watchdog — checks every 10 seconds (no need to check every second for a 15-min timeout)
    const idleInterval = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= IDLE_TIMEOUT_MS) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setValid(false);
        navigate("/auth/login", { replace: true });
      }
    }, 10_000);

    return () => {
      ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, onActivity));
      clearInterval(refreshInterval);
      clearInterval(idleInterval);
    };
  }, [valid, navigate]);

  if (!valid) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoute;