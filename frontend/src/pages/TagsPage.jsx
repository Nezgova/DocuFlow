import { Hash, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function TagsPage() {
  const { user } = useAuth()
  const [tags, setTags] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    api.get('/tags')
      .then(r => setTags(r.data))
      .catch(() => setError('Failed to load tags'))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    api.post('/tags', { name })
      .then(() => {
        setName('')
        setSuccess('Tag created successfully')
        load()
      })
      .catch(e => setError(e.response?.data?.message || 'Operation failed'))
  }

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to delete this tag?')) return
    api.delete(`/tags/${id}`)
      .then(() => {
        setSuccess('Tag deleted')
        load()
      })
      .catch(e => setError(e.response?.data?.message || 'Failed to delete tag'))
  }

  const isAdmin = user?.role === 'ADMINISTRATOR'

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">Document metadata</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Tags</h1>
          <p className="mt-1 text-sm text-ink/60">Manage search tags and document labels.</p>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="mt-4 rounded-xl bg-mint/40 px-4 py-3 text-sm text-moss font-bold">{success}</p>}

      {isAdmin && (
        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold">Create New Tag</h2>
          <div className="mt-4 flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Tag Name</label>
              <input 
                className="field mt-1 w-full" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. urgent, confidential, finance" 
                required 
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-moss px-5 py-3 text-sm font-bold text-white hover:bg-ink">
                <Plus size={17} />
                Add Tag
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tags.map(t => (
          <div key={t.id} className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1 text-xs font-bold text-ink">
                  <Hash size={13} className="text-moss" />
                  {t.name}
                </span>
                {isAdmin && (
                  <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="mt-4 text-xs font-semibold text-ink/50">Used in {t.documentCount} {t.documentCount === 1 ? 'document' : 'documents'}</p>
            </div>
            <p className="mt-6 text-[11px] text-ink/40">Created {new Date(t.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
        {tags.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-ink/20 p-12 text-center text-sm text-ink/50">
            No tags created yet.
          </div>
        )}
      </div>
    </>
  )
}
