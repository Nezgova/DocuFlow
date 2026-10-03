import { FileUp, X, GitFork, Sparkles, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function UploadDocumentDialog({ onClose, onUploaded }) {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [templates, setTemplates] = useState([])
  const [templateId, setTemplateId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [priority, setPriority] = useState('NORMAL')
  const [dueDate, setDueDate] = useState('')
  const [reviewerIds, setReviewerIds] = useState([])
  const [error, setError] = useState('')
  const [aiSuccess, setAiSuccess] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/categories'),
      api.get('/workflow-templates')
    ]).then(([uRes, cRes, tRes]) => {
      setUsers(uRes.data)
      setCategories(cRes.data)
      setTemplates(tRes.data)
    }).catch(() => setError('Could not load available options.'))
  }, [])

  const handleTemplateChange = (e) => {
    const tid = e.target.value
    setTemplateId(tid)
    if (!tid) {
      setReviewerIds([])
      return
    }
    const t = templates.find(x => x.id === Number(tid))
    if (t) {
      setReviewerIds(t.steps.map(s => s.reviewerId))
    }
  }

  const toggle = (id) => setReviewerIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])

  const handleAiAnalyze = async () => {
    if (!file) {
      setError('Please select a PDF file first before running AI analysis.')
      return
    }
    setAnalyzing(true)
    setError('')
    setAiSuccess('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/ai/analyze-pdf', formData)
      const suggestion = res.data
      if (suggestion.title) setTitle(suggestion.title)
      if (suggestion.priority) setPriority(suggestion.priority)
      if (suggestion.tags && suggestion.tags.length) {
        setTagsInput(suggestion.tags.join(', '))
      }
      if (suggestion.category && categories.length) {
        const match = categories.find(c => c.name.toLowerCase() === suggestion.category.toLowerCase())
        if (match) setCategoryId(match.id)
      }
      setAiSuccess(`Gemini AI successfully extracted metadata! (Department: ${suggestion.department || 'General'})`)
    } catch (err) {
      setError('AI analysis failed or timed out. You can still fill in metadata manually.')
    } finally {
      setAnalyzing(false)
    }
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (!file) return setError('Choose a PDF file.')
    if (!reviewerIds.length) return setError('Choose at least one reviewer.')
    setBusy(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : []
      const data = { title, priority, dueDate: dueDate || null, reviewerIds, tags }
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

        <label className="mt-4 block text-sm font-bold">PDF document
          <div className="mt-2 flex gap-2">
            <input required accept="application/pdf" type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} className="field cursor-pointer flex-1" />
            <button
              type="button"
              disabled={analyzing || !file}
              onClick={handleAiAnalyze}
              className="inline-flex items-center gap-1.5 rounded-xl bg-mint px-4 py-3 text-xs font-bold text-moss hover:bg-moss hover:text-white transition disabled:opacity-50 shrink-0"
              title="Extract metadata automatically using Gemini AI"
            >
              <Sparkles size={15} />
              {analyzing ? 'Analyzing…' : 'AI Extract'}
            </button>
          </div>
        </label>

        {aiSuccess && <p className="mt-2 rounded-xl bg-mint/50 px-3 py-2 text-xs font-bold text-moss flex items-center gap-1.5"><CheckCircle2 size={15} />{aiSuccess}</p>}

        <label className="mt-4 block text-sm font-bold">Document title<input required maxLength="180" value={title} onChange={(event) => setTitle(event.target.value)} className="field mt-2" placeholder="e.g. Q3 budget forecast" /></label>
        
        {templates.length > 0 && (
          <label className="mt-4 block text-sm font-bold flex items-center gap-1.5">
            <GitFork size={15} className="text-moss" /> Workflow Template (optional)
            <select className="field mt-2 w-full font-normal" value={templateId} onChange={handleTemplateChange}>
              <option value="">Select a template to auto-assign approval chain</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.steps.length} steps)</option>)}
            </select>
          </label>
        )}

        <label className="mt-4 block text-sm font-bold">Category
          <select className="field mt-2 w-full" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Select category (optional)</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="mt-4 block text-sm font-bold">Priority
          <select className="field mt-2 w-full" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </label>
        <label className="mt-4 block text-sm font-bold">Due Date (optional)<input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="field mt-2 w-full" /></label>
        <label className="mt-4 block text-sm font-bold">Tags (comma-separated)<input value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} className="field mt-2" placeholder="e.g. urgent, confidential, finance" /></label>
        
        <fieldset className="mt-5"><legend className="text-sm font-bold">Assign reviewers</legend><p className="mt-1 text-xs text-ink/55">Everyone selected must approve before signing.</p><div className="mt-3 max-h-40 space-y-2 overflow-y-auto rounded-xl border border-ink/10 p-2">{users.length ? users.map((user) => <label key={user.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-sand"><input checked={reviewerIds.includes(user.id)} onChange={() => toggle(user.id)} type="checkbox" className="h-4 w-4 accent-moss"/><span className="flex-1 text-sm font-semibold">{user.fullName}<span className="ml-2 text-xs font-normal text-ink/50">{user.role.toLowerCase()}</span></span></label>) : <p className="p-2 text-sm text-ink/55">No other active users exist yet. Create a manager or employee first.</p>}</div></fieldset>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-ink/15 px-4 py-2.5 text-sm font-bold hover:bg-sand">Cancel</button><button disabled={busy} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-moss px-5 py-2.5 text-sm font-bold text-white hover:bg-ink disabled:opacity-50"><FileUp size={16}/>{busy ? 'Uploading…' : 'Upload and start'}</button></div>
      </form>
    </div>
  )
}
