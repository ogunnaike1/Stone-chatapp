import { Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import SignUp from './pages/auth/SignUp'
import Login from './pages/auth/Login'
import ChatHome from './pages/ChatHome'
import PublicRoute from './components/PublicRoute'
import ProtectedRoute from './components/ProtectedRoute'
import ForgotPasswordForm from './pages/ForgotPassword'
import LandingPage from './pages/LandingPage'
import ChatLanding from './pages/ChatLanding'
import NotFound from './pages/NotFound'
import LoadingScreen from './components/LoadingScreen'
import { NotificationProvider } from './components/NotificationContext'
import AboutPage from './pages/AboutPage'
import FeaturesPage from './pages/FeaturesPage'


import './App.css'

const App = () => {
  const [appReady, setAppReady] = useState(false)

  if (!appReady) {
    return <LoadingScreen variant="app" onComplete={() => setAppReady(true)} />
  }

  return (
    <NotificationProvider>
      <div>
        <Routes>

          <Route path='/' element={
            <PublicRoute>
              <ChatLanding />
            </PublicRoute>
          } />

          <Route path="/auth/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/landingpage" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
            <Route path="/features" element={
            <PublicRoute>
              <FeaturesPage />
            </PublicRoute>
          } />
            <Route path="/about" element={
            <PublicRoute>
              <AboutPage />
            </PublicRoute>
          } />

          <Route path="/auth/signup" element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          } />

          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPasswordForm />
            </PublicRoute>
          } />


          <Route path="/chathome" element={
            <ProtectedRoute>
              <ChatHome />
            </ProtectedRoute>
          } />

          {/* ── 404 catch-all — must always be last ── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </div>
    </NotificationProvider>
  )
}

export default App