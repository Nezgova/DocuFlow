import { GitFork, Plus, Trash2, Edit2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function WorkflowTemplatesPage() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [usersList, setUsersList] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [reviewerIds, setReviewerIds] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    Promise.all([
      api.get('/workflow-templates'),
      api.get('/users')
    ]).then(([tRes, uRes]) => {
      setTemplates(tRes.data)
      setUsersList(uRes.data)
    }).catch(() => setError('Failed to load workflow templates'))
  }

  useEffect(() => { load() }, [])

  const toggleReviewer = (id) => {
    setReviewerIds(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!reviewerIds.length) {
      setError('Select at least one reviewer step for the template.')
      return
    }
    const payload = { name, description, reviewerIds }
    const req = editingId 
      ? api.put(`/workflow-templates/${editingId}`, payload)
      : api.post('/workflow-templates', payload)

    req.then(() => {
      setName('')
      setDescription('')
      setReviewerIds([])
      setEditingId(null)
      setSuccess(editingId ? 'Workflow template updated successfully' : 'Workflow template created successfully')
      load()
    }).catch(e => setError(e.response?.data?.message || 'Operation failed'))
  }

  const startEdit = (t) => {
    setEditingId(t.id)
    setName(t.name)
    setDescription(t.description || '')
    setReviewerIds(t.steps.map(s => s.reviewerId))
  }

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to delete this workflow template?')) return
    api.delete(`/workflow-templates/${id}`)
      .then(() => {
        setSuccess('Workflow template deleted')
        load()
      })
      .catch(e => setError(e.response?.data?.message || 'Failed to delete template'))
  }

  const canManage = user?.role === 'ADMINISTRATOR' || user?.role === 'MANAGER'

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">Approval chains & automation</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Workflow Templates</h1>
          <p className="mt-1 text-sm text-ink/60">Predefined approval chains for standard document review processes.</p>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="mt-4 rounded-xl bg-mint/40 px-4 py-3 text-sm text-moss font-bold">{success}</p>}

      {canManage && (
        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold">{editingId ? 'Edit Workflow Template' : 'Create New Workflow Template'}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Template Name</label>
              <input 
                className="field mt-1 w-full" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Contract Review Chain" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Description</label>
              <input 
                className="field mt-1 w-full" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="e.g. Legal followed by Finance review" 
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-2">Predefined Reviewer Steps (in order)</label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-ink/10 p-3">
              {usersList.length ? usersList.map(u => (
                <label key={u.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-sand">
                  <input 
                    checked={reviewerIds.includes(u.id)} 
                    onChange={() => toggleReviewer(u.id)} 
                    type="checkbox" 
                    className="h-4 w-4 accent-moss"
                  />
                  <span className="flex-1 text-sm font-semibold">
                    {u.fullName} <span className="ml-2 text-xs font-normal text-ink/50">{u.role.toLowerCase()}</span>
                  </span>
                </label>
              )) : <p className="text-sm text-ink/55">No active users found.</p>}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-moss px-5 py-3 text-sm font-bold text-white hover:bg-ink">
              <Plus size={17} />
              {editingId ? 'Update Template' : 'Create Template'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setName(''); setDescription(''); setReviewerIds([]); }}
                className="rounded-xl border border-ink/15 bg-white px-5 py-3 text-sm font-bold hover:bg-sand"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map(t => (
          <div key={t.id} className="flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-moss font-bold">
                  <GitFork size={20} />
                </div>
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-ink/70">
                  {t.steps.length} {t.steps.length === 1 ? 'step' : 'steps'}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-extrabold">{t.name}</h3>
              <p className="mt-1 text-sm text-ink/65">{t.description || 'No description provided.'}</p>

              <div className="mt-4 space-y-1.5 border-t border-ink/10 pt-3">
                <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Approval Chain:</p>
                {t.steps.map(s => (
                  <div key={s.reviewerId} className="flex items-center gap-2 text-xs font-medium text-ink/80">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-sand font-bold text-moss">{s.stepOrder}</span>
                    <span>{s.reviewerName}</span>
                  </div>
                ))}
              </div>
            </div>

            {canManage && (
              <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4">
                <button onClick={() => startEdit(t)} className="inline-flex items-center gap-1.5 text-xs font-bold text-moss hover:underline">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(t.id)} className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {!templates.length && (
        <p className="mt-8 text-center text-sm text-ink/55">No workflow templates found.</p>
      )}
    </>
  )
}
