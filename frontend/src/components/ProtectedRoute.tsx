import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import api from "../api/axios";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;       // 15 minutes idle
const SEVEN_DAYS_MS   = 7 * 24 * 60 * 60 * 1000; // 7 days absolute session

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

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("loginTime");
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const [valid, setValid] = useState(() => isTokenValid());

  const lastActivityRef = useRef<number>(Date.now());
  const lastRefreshRef  = useRef<number>(0);

  useEffect(() => {
    if (!valid) return;

    // ── Seed loginTime if missing (handles users already logged in) ───────────
    if (!localStorage.getItem("loginTime")) {
      localStorage.setItem("loginTime", new Date().toISOString());
    }

    // ── Check 7-day absolute expiry immediately on mount ──────────────────────
    const loginTime = localStorage.getItem("loginTime");
    if (loginTime && Date.now() - new Date(loginTime).getTime() >= SEVEN_DAYS_MS) {
      clearSession();
      setValid(false);
      navigate("/auth/login", { replace: true });
      return;
    }

    // ── Track user activity ───────────────────────────────────────────────────
    const onActivity = () => { lastActivityRef.current = Date.now(); };
    ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, onActivity, { passive: true }));

    // ── Token refresh while active (every 4s, debounced to once per 5s) ───────
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

    // ── Idle + 7-day watchdog (checks every 10 seconds) ───────────────────────
    const idleInterval = setInterval(() => {
      const now = Date.now();

      // 7-day absolute session check
      const stored = localStorage.getItem("loginTime");
      if (stored && now - new Date(stored).getTime() >= SEVEN_DAYS_MS) {
        clearSession();
        setValid(false);
        navigate("/auth/login", { replace: true });
        return;
      }

      // 15-minute idle check
      const idleMs = now - lastActivityRef.current;
      if (idleMs >= IDLE_TIMEOUT_MS) {
        clearSession();
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