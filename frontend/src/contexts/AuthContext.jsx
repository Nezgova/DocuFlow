import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'
const AuthContext = createContext(null)
export function AuthProvider({ children }) { const [user, setUser] = useState(null); const [loading, setLoading] = useState(true)
  useEffect(() => { if (!localStorage.getItem('docuflow_token')) return setLoading(false); api.get('/auth/me').then(({ data }) => setUser(data)).catch(() => localStorage.removeItem('docuflow_token')).finally(() => setLoading(false)) }, [])
  const login = async (values) => { const { data } = await api.post('/auth/login', values); localStorage.setItem('docuflow_token', data.token); setUser(data.user) }
  const logout = () => { localStorage.removeItem('docuflow_token'); setUser(null) }
  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider> }
export const useAuth = () => useContext(AuthContext)
