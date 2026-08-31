import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import LoginPage from './pages/LoginPage'
import PlaceholderPage from './pages/PlaceholderPage'
import AppErrorBoundary from './components/AppErrorBoundary'
function Protected() { const { user, loading } = useAuth(); if (loading) return <div className="grid min-h-screen place-items-center text-sm font-bold text-ink/60">Loading workspace…</div>; return user ? <AppLayout/> : <Navigate to="/login" replace/> }
function App(){return <Routes><Route path="/login" element={<LoginPage/>}/><Route element={<Protected/>}><Route index element={<DashboardPage/>}/><Route path="documents" element={<DocumentsPage/>}/><Route path="archive" element={<PlaceholderPage title="Archive" description="Completed, signed documents will appear here with their immutable workflow history."/>}/><Route path="users" element={<PlaceholderPage title="People" description="Administrator user management will be added with role assignment and account controls."/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
createRoot(document.getElementById('root')).render(<StrictMode><AppErrorBoundary><BrowserRouter><AuthProvider><App/></AuthProvider></BrowserRouter></AppErrorBoundary></StrictMode>)
