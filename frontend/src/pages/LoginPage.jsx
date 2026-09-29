import { ArrowRight, FileCheck2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Logo from '../components/Logo'

export default function LoginPage() { 
  const { login, user } = useAuth() 
  const [values, setValues] = useState({ email: '', password: '' }) 
  const [error, setError] = useState('') 
  const [busy, setBusy] = useState(false) 
  
  if(user) return <Navigate to="/" replace />

  async function submit(e) { 
    e.preventDefault() 
    setBusy(true) 
    setError('') 
    try { 
      await login(values) 
    } catch (e) { 
      setError(e.response?.data?.message || 'Unable to sign in. Please try again.') 
    } finally { 
      setBusy(false) 
    } 
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_.9fr]">
      <section className="relative hidden overflow-hidden bg-ink p-14 text-white lg:block">
        <div className="absolute -right-24 top-12 h-80 w-80 rounded-full border-[40px] border-mint/10"/>
        <div className="relative flex h-full max-w-lg flex-col">
          <Logo />
          <div className="my-auto">
            <p className="font-mono text-xs uppercase tracking-[.18em] text-mint">Document operations, clarified</p>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight">Every decision<br/>leaves a trail.</h1>
            <p className="mt-6 max-w-md leading-7 text-white/65">Move important documents from upload to approval with a clear, accountable workflow.</p>
          </div>
          <div className="flex gap-6 text-sm text-white/65">
            <span className="flex items-center gap-2"><ShieldCheck size={17}/>Role-aware</span>
            <span className="flex items-center gap-2"><FileCheck2 size={17}/>Auditable</span>
          </div>
        </div>
      </section>
      <section className="grid place-items-center bg-sand p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">Welcome back</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Sign in to your workspace</h2>
          <p className="mt-3 text-sm leading-6 text-ink/60">Use the credentials provided by your administrator.</p>
          
          {error && <p className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

          <label className="mt-8 block text-sm font-bold">Email
            <input required type="email" value={values.email} onChange={e=>setValues({...values,email:e.target.value})} className="field mt-2" placeholder="name@company.com"/>
          </label>
          <label className="mt-5 block text-sm font-bold">Password
            <input required type="password" value={values.password} onChange={e=>setValues({...values,password:e.target.value})} className="field mt-2" placeholder="••••••••"/>
          </label>
          
          <button disabled={busy} type="submit" className="btn-primary mt-8 w-full flex items-center justify-center gap-2">
            {busy ? 'Signing in…' : 'Sign in to workspace'} <ArrowRight size={17}/>
          </button>
        </form>
      </section>
    </main>
  )
}
