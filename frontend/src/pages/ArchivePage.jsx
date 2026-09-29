import { Archive, RotateCcw, Trash2, Search, FileText, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function ArchivePage(){
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [search, setSearch] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'ADMINISTRATOR'

  const loadArchive = () => {
    api.get('/documents', { params: { size: 200, status: 'ARCHIVED' } })
      .then(r => {
        const list = r.data.content || r.data
        setDocs(Array.isArray(list) ? list.filter(d => d.status === 'ARCHIVED') : [])
      })
      .catch(() => setError('Failed to load archive records'))
  }

  useEffect(() => { loadArchive() }, [])

  const handleRestore = (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Restore this document from the archive?')) return
    api.post(`/documents/${id}/restore`)
      .then(() => {
        setSuccess('Document restored successfully')
        loadArchive()
        setTimeout(() => setSuccess(''), 3000)
      })
      .catch(err => alert(err.response?.data?.message || 'Failed to restore document'))
  }

  const handlePermanentDelete = (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('WARNING: Permanently delete this document and all associated file records? This action cannot be undone!')) return
    api.delete(`/documents/${id}/permanent`)
      .then(() => {
        setSuccess('Document permanently deleted')
        loadArchive()
        setTimeout(() => setSuccess(''), 3000)
      })
      .catch(err => alert(err.response?.data?.message || 'Failed to permanently delete document'))
  }

  const filteredDocs = docs.filter(d => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      d.title?.toLowerCase().includes(q) ||
      d.originalFileName?.toLowerCase().includes(q) ||
      d.archiveReason?.toLowerCase().includes(q) ||
      d.archivedBy?.toLowerCase().includes(q)
    )
  })

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">Records & compliance vault</p>
          <h1 className="mt-2 text-3xl font-extrabold">Archive Management</h1>
        </div>
      </div>

      {success && <p className="mt-4 rounded-xl bg-mint/40 px-4 py-3 text-sm text-moss font-bold flex items-center gap-2"><CheckCircle2 size={16}/>{success}</p>}
      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">{error}</p>}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 text-ink/35" size={18}/>
          <input className="field pl-10 w-full" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search archive by title, file name, archive reason, or archiver…"/>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        {filteredDocs.length ? filteredDocs.map(d => (
          <Link to={`/documents/${d.id}`} key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 p-5 hover:bg-sand transition">
            <div className="flex items-start gap-4">
              <Archive className="text-moss shrink-0 mt-1" size={20}/>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">{d.title}</p>
                  <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 text-[11px] font-black">v{d.currentVersion || 1}</span>
                  <span className="rounded-md bg-sand px-2 py-0.5 text-xs font-bold text-ink/70">{d.originalFileName}</span>
                </div>
                <p className="mt-1 text-xs text-ink/55">
                  Archived on {d.archivedAt ? new Date(d.archivedAt).toLocaleString() : 'N/A'} {d.archivedBy ? `by ${d.archivedBy}` : ''}
                </p>
                {d.archiveReason && (
                  <p className="mt-1 text-xs font-semibold text-moss">
                    Reason: {d.archiveReason}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button 
                onClick={(e) => handleRestore(d.id, e)} 
                className="flex items-center gap-1.5 rounded-xl border border-moss/30 bg-mint/30 px-3 py-2 text-xs font-bold text-moss hover:bg-mint transition"
                title="Restore Document"
              >
                <RotateCcw size={14}/> Restore
              </button>
              {isAdmin && (
                <button 
                  onClick={(e) => handlePermanentDelete(d.id, e)} 
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                  title="Permanently Delete"
                >
                  <Trash2 size={14}/> Permanent Delete
                </button>
              )}
            </div>
          </Link>
        )) : <p className="p-10 text-center text-sm text-ink/55">No archived records found.</p>}
      </div>
    </>
  )
}
