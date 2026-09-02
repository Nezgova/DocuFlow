import { Layers, Plus, Trash2, Edit2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function CategoriesPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    api.get('/categories')
      .then(r => setCategories(r.data))
      .catch(() => setError('Failed to load categories'))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const payload = { name, description }
    const req = editingId 
      ? api.put(`/categories/${editingId}`, payload)
      : api.post('/categories', payload)

    req.then(() => {
      setName('')
      setDescription('')
      setEditingId(null)
      setSuccess(editingId ? 'Category updated successfully' : 'Category created successfully')
      load()
    }).catch(e => setError(e.response?.data?.message || 'Operation failed'))
  }

  const startEdit = (c) => {
    setEditingId(c.id)
    setName(c.name)
    setDescription(c.description || '')
  }

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    api.delete(`/categories/${id}`)
      .then(() => {
        setSuccess('Category deleted')
        load()
      })
      .catch(e => setError(e.response?.data?.message || 'Failed to delete category'))
  }

  const isAdmin = user?.role === 'ADMINISTRATOR'

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">Document classification</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-ink/60">Manage document categories and type classifications.</p>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="mt-4 rounded-xl bg-mint/40 px-4 py-3 text-sm text-moss font-bold">{success}</p>}

      {isAdmin && (
        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold">{editingId ? 'Edit Category' : 'Create New Category'}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Category Name</label>
              <input 
                className="field mt-1 w-full" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Technical Documentation" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Description</label>
              <input 
                className="field mt-1 w-full" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Brief description of category scope" 
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-moss px-5 py-3 text-sm font-bold text-white hover:bg-ink">
              <Plus size={17} />
              {editingId ? 'Update Category' : 'Add Category'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setName(''); setDescription(''); }}
                className="rounded-xl border border-ink/15 bg-white px-5 py-3 text-sm font-bold hover:bg-sand"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(c => (
          <div key={c.id} className="flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-moss font-bold">
                  <Layers size={20} />
                </div>
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-ink/70">
                  {c.documentCount} {c.documentCount === 1 ? 'document' : 'documents'}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-extrabold">{c.name}</h3>
              <p className="mt-1 text-sm text-ink/65">{c.description || 'No description provided.'}</p>
            </div>
            {isAdmin && (
              <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4">
                <button onClick={() => startEdit(c)} className="inline-flex items-center gap-1.5 text-xs font-bold text-moss hover:underline">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(c.id)} className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {!categories.length && (
        <p className="mt-8 text-center text-sm text-ink/55">No categories found.</p>
      )}
    </>
  )
}
