import { FileUp, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function UploadDocumentDialog({ onClose, onUploaded }) {
  const [title, setTitle] = useState(''), [file, setFile] = useState(null), [users, setUsers] = useState([]), [categories, setCategories] = useState([]), [categoryId, setCategoryId] = useState(''), [reviewerIds, setReviewerIds] = useState([]), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/categories')
    ]).then(([uRes, cRes]) => {
      setUsers(uRes.data)
      setCategories(cRes.data)
    }).catch(() => setError('Could not load available options.'))
  }, [])
  const toggle = (id) => setReviewerIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])
  async function submit(event) {
    event.preventDefault()
    setError('')
    if (!file) return setError('Choose a PDF file.')
    if (!reviewerIds.length) return setError('Choose at least one reviewer.')
    setBusy(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const data = { title, reviewerIds }
      if (categoryId) data.categoryId = Number(categoryId)
      body.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
      await api.post('/documents', body)
      onUploaded()
    } catch (err) {
      setError(err.response?.data?.message || 'The document could not be uploaded.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4" role="dialog" aria-modal="true" aria-labelledby="upload-title">
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">New workflow</p>
            <h2 id="upload-title" className="mt-1 text-xl font-extrabold">Upload a PDF</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close upload dialog" className="rounded-lg p-1 text-ink/50 hover:bg-sand"><X /></button>
        </div>
        <label className="mt-5 block text-sm font-bold">Document title<input required maxLength="180" value={title} onChange={(event) => setTitle(event.target.value)} className="field mt-2" placeholder="e.g. Q3 budget forecast" /></label>
        <label className="mt-4 block text-sm font-bold">Category
          <select className="field mt-2 w-full" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Select category (optional)</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="mt-4 block text-sm font-bold">PDF document<input required accept="application/pdf" type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} className="field mt-2 cursor-pointer" /></label>
        <fieldset className="mt-5"><legend className="text-sm font-bold">Assign reviewers</legend><p className="mt-1 text-xs text-ink/55">Everyone selected must approve before signing.</p><div className="mt-3 max-h-40 space-y-2 overflow-y-auto rounded-xl border border-ink/10 p-2">{users.length ? users.map((user) => <label key={user.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-sand"><input checked={reviewerIds.includes(user.id)} onChange={() => toggle(user.id)} type="checkbox" className="h-4 w-4 accent-moss"/><span className="flex-1 text-sm font-semibold">{user.fullName}<span className="ml-2 text-xs font-normal text-ink/50">{user.role.toLowerCase()}</span></span></label>) : <p className="p-2 text-sm text-ink/55">No other active users exist yet. Create a manager or employee first.</p>}</div></fieldset>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-ink/15 px-4 py-2.5 text-sm font-bold hover:bg-sand">Cancel</button><button disabled={busy} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-moss px-5 py-2.5 text-sm font-bold text-white hover:bg-ink disabled:opacity-50"><FileUp size={16}/>{busy ? 'Uploading…' : 'Upload and start'}</button></div>
      </form>
    </div>
  )
}
