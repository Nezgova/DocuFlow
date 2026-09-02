import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Plus, UserPlus, Edit2 } from 'lucide-react'

export default function PeoplePage(){
  const { user } = useAuth()
  const [people, setPeople] = useState([])
  const [departments, setDepartments] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('EMPLOYEE')
  const [departmentId, setDepartmentId] = useState('')
  const [active, setActive] = useState(true)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    Promise.all([
      api.get('/users'),
      api.get('/departments')
    ]).then(([uRes, dRes]) => {
      setPeople(uRes.data)
      setDepartments(dRes.data)
      if (dRes.data.length && !departmentId) {
        setDepartmentId(dRes.data[0].id)
      }
    }).catch(() => setError('Failed to load user directory'))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditingUser(null)
    setFullName('')
    setEmail('')
    setPassword('')
    setRole('EMPLOYEE')
    setDepartmentId(departments[0]?.id || '')
    setActive(true)
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditingUser(p)
    setFullName(p.fullName)
    setEmail(p.email)
    setRole(p.role)
    setDepartmentId(p.departmentId || departments[0]?.id || '')
    setActive(true)
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const payload = editingUser ? {
      fullName,
      role,
      departmentId: departmentId ? Number(departmentId) : null,
      active
    } : {
      fullName,
      email,
      password,
      role,
      departmentId: departmentId ? Number(departmentId) : null
    }

    const req = editingUser 
      ? api.put(`/users/${editingUser.id}`, payload)
      : api.post('/users', payload)

    req.then(() => {
      setShowModal(false)
      setSuccess(editingUser ? 'User updated successfully' : 'User created successfully')
      load()
    }).catch(e => setError(e.response?.data?.message || 'Operation failed'))
  }

  const isAdmin = user?.role === 'ADMINISTRATOR'

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">Workspace directory</p>
          <h1 className="mt-2 text-3xl font-extrabold">People</h1>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-moss px-4 py-3 text-sm font-bold text-white hover:bg-ink">
            <UserPlus size={17} /> Add user
          </button>
        )}
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="mt-4 rounded-xl bg-mint/40 px-4 py-3 text-sm text-moss font-bold">{success}</p>}

      <div className="mt-7 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
        {people.map(p => (
          <div key={p.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-ink/10 p-5">
            <div>
              <p className="font-bold text-base">{p.fullName}</p>
              <p className="text-sm text-ink/55">{p.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {p.departmentName && (
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-ink/75">
                  {p.departmentName}
                </span>
              )}
              <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-moss">
                {p.role}
              </span>
              {isAdmin && (
                <button onClick={() => openEdit(p)} className="inline-flex items-center gap-1 rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-xs font-bold hover:bg-sand">
                  <Edit2 size={13} /> Edit
                </button>
              )}
            </div>
          </div>
        ))}
        {!people.length && <p className="p-8 text-center text-sm text-ink/55">No other active users.</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-extrabold">{editingUser ? 'Edit User Details' : 'Provision New User'}</h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Full Name</label>
                <input className="field mt-1 w-full" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Email Address</label>
                <input className="field mt-1 w-full" type="email" value={email} disabled={!!editingUser} onChange={e => setEmail(e.target.value)} required placeholder="jane@docuflow.local" />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Temporary Password</label>
                  <input className="field mt-1 w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="At least 8 characters" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Role</label>
                <select className="field mt-1 w-full" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Department</label>
                <select className="field mt-1 w-full" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-ink/15 px-4 py-3 text-sm font-bold hover:bg-sand">Cancel</button>
                <button type="submit" className="rounded-xl bg-moss px-5 py-3 text-sm font-bold text-white hover:bg-ink">{editingUser ? 'Save Changes' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
