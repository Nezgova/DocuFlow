import { Archive, Building2, FileText, Hash, Layers, LayoutDashboard, LogOut, Menu, Users, X, BarChart3 } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Logo from '../components/Logo'
import NotificationsDropdown from '../components/NotificationsDropdown'
const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/categories', label: 'Categories', icon: Layers },
  { to: '/tags', label: 'Tags', icon: Hash },
  { to: '/archive', label: 'Archive', icon: Archive },
  { to: '/users', label: 'People', icon: Users, admin: true }
]
export default function AppLayout() { const [open, setOpen] = useState(false); const { user, logout } = useAuth(); const allowed = links.filter((link) => !link.admin || user?.role === 'ADMINISTRATOR')
 const sidebar = <aside className="flex h-full w-72 flex-col border-r border-ink/10 bg-sand p-5"><Logo /><nav className="mt-10 space-y-1">{allowed.map(({ to, label, icon: Icon }) => <NavLink end={to === '/'} onClick={() => setOpen(false)} key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={18} />{label}</NavLink>)}</nav><div className="mt-auto rounded-2xl bg-ink p-4 text-white"><p className="text-sm font-bold">{user?.fullName}</p><p className="mt-1 text-xs text-white/60">{user?.role?.toLowerCase()}{user?.departmentName ? ` · ${user.departmentName}` : ''}</p><button onClick={logout} className="mt-4 flex items-center gap-2 text-xs font-bold text-white/80 hover:text-white"><LogOut size={15} />Sign out</button></div></aside>
 return <div className="min-h-screen"><div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>{open && <div className="fixed inset-0 z-50 bg-ink/30 lg:hidden" onClick={() => setOpen(false)}><div className="h-full w-72" onClick={(e) => e.stopPropagation()}>{sidebar}</div></div>}<main className="lg:pl-72"><header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-ink/10 bg-sand/85 px-5 py-4 backdrop-blur lg:px-10"><button aria-label="Open navigation" onClick={() => setOpen(!open)} className="rounded-lg p-2 lg:hidden">{open ? <X/> : <Menu/>}</button><div className="ml-auto flex items-center gap-3"><NotificationsDropdown /><span className="hidden text-sm font-semibold text-ink/55 sm:block">Workspace / 2026</span><div className="grid h-9 w-9 place-items-center rounded-full bg-moss text-sm font-bold text-white">{user?.fullName?.[0]}</div></div></header><div className="mx-auto max-w-7xl p-5 lg:p-10"><Outlet /></div></main></div> }
