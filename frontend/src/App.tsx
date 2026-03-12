import { Route, Routes } from 'react-router-dom'
import SignUp from './pages/auth/SignUp'
import Login from './pages/auth/Login'
import ChatHome from './pages/ChatHome'
import PublicRoute from './components/PublicRoute'
import ProtectedRoute from './components/ProtectedRoute'
import ForgotPasswordForm from './pages/ForgotPassword'
import ResetPasswordForm from './pages/ResetPassword'
import LandingPage from './pages/LandingPage'
import ChatLanding from './pages/ChatLanding'
import NotFound from './pages/NotFound'
import { NotificationProvider } from './components/NotificationContext';

import './App.css'

function App() {
  return (
    <NotificationProvider>
      <div>
        <Routes>

          <Route path='/' element={
            <PublicRoute>
              <SignUp/>
            </PublicRoute>
          }/>

          <Route path="/auth/login" element={
            <PublicRoute>
              <Login/>
            </PublicRoute>
          }/>

          <Route path="/landingpage" element={
            <PublicRoute>
              <LandingPage/>
            </PublicRoute>
          }/>

          <Route path="/chatlanding" element={
            <PublicRoute>
              <ChatLanding/>
            </PublicRoute>
          }/>

          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPasswordForm />
            </PublicRoute>
          }/>

          <Route path="/reset-password/:token" element={
            <PublicRoute>
              <ResetPasswordForm />
            </PublicRoute>
          }/>

          <Route path="/chathome" element={
            <ProtectedRoute>
              <ChatHome/>
            </ProtectedRoute>
          }/>

          {/* ── 404 catch-all — must always be last ── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </div>
    </NotificationProvider>
  )
}

export default App
