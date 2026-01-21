import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import SignUp from './pages/auth/SignUp'
import Login from './pages/auth/Login'
import ChatHome from './pages/ChatHome'
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import PublicRoute from './components/PublicRoute'
import ProtectedRoute from './components/ProtectedRoute'

import './App.css'

function App() {
  
  return (
    
      <div>
         <Routes>
          <Route path='/' element={
            <PublicRoute>
               <SignUp/>
            </PublicRoute>
           
            }>
          </Route>
          <Route path="/auth/login" element={
            <PublicRoute>
             <Login/>
            </PublicRoute>
            
            }>

            </Route>
          <Route path="/chathome" element={
            <ProtectedRoute>
               <ChatHome/>
            </ProtectedRoute>
           
            }>
            </Route>
         </Routes>
         <ToastContainer position="top-right" autoClose={3000} />
      </div>
  
  )
}

export default App
