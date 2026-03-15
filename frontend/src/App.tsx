import { Route, Routes, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import SignUp from './pages/auth/SignUp'
import Login from './pages/auth/Login'
import ChatHome from './pages/ChatHome'
import PublicRoute from './components/PublicRoute'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/Adminroute'
import ForgotPasswordForm from './pages/ForgotPassword'
import LandingPage from './pages/LandingPage'
import ChatLanding from './pages/ChatLanding'
import NotFound from './pages/NotFound'
import LoadingScreen from './components/LoadingScreen'
import { NotificationProvider } from './components/NotificationContext'
import AboutPage from './pages/AboutPage'
import FeaturesPage from './pages/FeaturesPage'
import AdminLogin from './pages/admin/Adminlogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import { isAuthenticated, logout } from './utils/auth'

import './App.css'

// ── Token expiry watcher ───────────────────────────────────────────────────────
const useTokenExpiryWatcher = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem("token");
      if (token && !isAuthenticated()) {
        logout();
        navigate("/auth/login", { replace: true });
      }
    };

    check();
    const interval = setInterval(check, 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);
};

// ── Inner component so useNavigate is available ───────────────────────────────
const AppRoutes = () => {
  useTokenExpiryWatcher();

  return (
    <Routes>
      {/* ── Public user routes ── */}
      <Route path='/' element={
        <PublicRoute><ChatLanding /></PublicRoute>
      } />

      <Route path="/auth/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />

      <Route path="/auth/signup" element={
        <PublicRoute><SignUp /></PublicRoute>
      } />

      <Route path="/forgot-password" element={
        <PublicRoute><ForgotPasswordForm /></PublicRoute>
      } />

      <Route path="/landingpage" element={
        <PublicRoute><LandingPage /></PublicRoute>
      } />

      <Route path="/features" element={
        <PublicRoute><FeaturesPage /></PublicRoute>
      } />

      <Route path="/about" element={
        <PublicRoute><AboutPage /></PublicRoute>
      } />

      {/* ── Protected user route ── */}
      <Route path="/chathome" element={
        <ProtectedRoute><ChatHome /></ProtectedRoute>
      } />

      {/* ── Admin routes ── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={
        <AdminRoute><AdminDashboard /></AdminRoute>
      } />

      {/* ── 404 — must always be last ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// ── Root component ─────────────────────────────────────────────────────────────
const App = () => {
  const [appReady, setAppReady] = useState(false);

  if (!appReady) {
    return <LoadingScreen variant="app" onComplete={() => setAppReady(true)} />;
  }

  return (
    <NotificationProvider>
      <div>
        <AppRoutes />
      </div>
    </NotificationProvider>
  );
};

export default App;