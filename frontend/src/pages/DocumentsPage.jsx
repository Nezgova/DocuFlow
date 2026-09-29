import { FileText, Hash, Search, Upload, BookmarkPlus, Trash2, Bookmark, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import UploadDocumentDialog from '../components/UploadDocumentDialog'

export default function DocumentsPage(){
  const [docs, setDocs] = useState([])
  const [departments, setDepartments] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [usersList, setUsersList] = useState([])
  const [savedFilters, setSavedFilters] = useState([])

  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagId, setTagId] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [uploaderId, setUploaderId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [upload, setUpload] = useState(false)
  const [success, setSuccess] = useState('')

  const load = () => {
    const params = {}
    if (search) params.q = search
    if (departmentId) params.departmentId = departmentId
    if (categoryId) params.categoryId = categoryId
    if (tagId) params.tagId = tagId
    if (status) params.status = status
    if (priority) params.priority = priority
    if (uploaderId) params.uploaderId = uploaderId
    if (startDate) params.startDate = new Date(startDate).toISOString()
    if (endDate) params.endDate = new Date(endDate + 'T23:59:59').toISOString()

    api.get('/documents', { params }).then(r => setDocs(r.data.content))
  }

  const loadSavedFilters = () => {
    api.get('/saved-filters').then(r => setSavedFilters(r.data)).catch(() => {})
  }

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data)).catch(() => {})
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
    api.get('/tags').then(r => setTags(r.data)).catch(() => {})
    api.get('/users').then(r => setUsersList(r.data)).catch(() => {})
    loadSavedFilters()
  }, [])

  useEffect(() => { load() }, [search, departmentId, categoryId, tagId, status, priority, uploaderId, startDate, endDate])

  const handleSaveFilter = () => {
    const name = prompt('Enter a name for this saved filter:')
    if (!name || !name.trim()) return
    const filterData = JSON.stringify({ search, departmentId, categoryId, tagId, status, priority, uploaderId, startDate, endDate })
    api.post('/saved-filters', { name: name.trim(), filterJson: filterData })
      .then(() => {
        setSuccess('Filter saved successfully')
        loadSavedFilters()
        setTimeout(() => setSuccess(''), 3000)
      })
      .catch(() => alert('Failed to save filter'))
  }

  const handleApplyFilter = (f) => {
    try {
      const data = JSON.parse(f.filterJson)
      setSearch(data.search || '')
      setDepartmentId(data.departmentId || '')
      setCategoryId(data.categoryId || '')
      setTagId(data.tagId || '')
      setStatus(data.status || '')
      setPriority(data.priority || '')
      setUploaderId(data.uploaderId || '')
      setStartDate(data.startDate || '')
      setEndDate(data.endDate || '')
    } catch {
      alert('Invalid filter data')
    }
  }

  const handleDeleteFilter = (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this saved filter?')) return
    api.delete(`/saved-filters/${id}`)
      .then(() => loadSavedFilters())
      .catch(() => alert('Failed to delete filter'))
  }

  const clearFilters = () => {
    setSearch('')
    setDepartmentId('')
    setCategoryId('')
    setTagId('')
    setStatus('')
    setPriority('')
    setUploaderId('')
    setStartDate('')
    setEndDate('')
  }

  const sortedDocs = [...docs].sort((a,b)=>{
    if(a.status==='PENDING'&&b.status!=='PENDING')return-1;
    if(a.status!=='PENDING'&&b.status==='PENDING')return 1;
    return 0;
  });

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">Document workspace & advanced search</p>
          <h1 className="mt-2 text-3xl font-extrabold">Documents</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)} 
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${showAdvanced ? 'border-moss bg-mint/40 text-moss' : 'border-ink/10 bg-white text-ink hover:bg-sand'}`}
          >
            <SlidersHorizontal size={17} className="text-moss"/>Advanced Search {showAdvanced ? '▲' : '▼'}
          </button>
          <button onClick={handleSaveFilter} className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-bold text-ink hover:bg-sand">
            <BookmarkPlus size={17} className="text-moss"/>Save Filter
          </button>
          <button onClick={()=>setUpload(true)} className="flex items-center gap-2 rounded-xl bg-moss px-4 py-3 text-sm font-bold text-white hover:bg-ink">
            <Upload size={17}/>Upload PDF
          </button>
        </div>
      </div>

      {success && <p className="mt-4 rounded-xl bg-mint/40 px-4 py-3 text-sm text-moss font-bold">{success}</p>}

      {/* Advanced Search Drawer Panel */}
      {showAdvanced && (
        <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-ink/10">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink/70">Advanced Multi-Criteria Filters</h2>
            <button onClick={clearFilters} className="text-xs font-bold text-moss hover:underline">Clear all filters</button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">Status</label>
              <select className="field w-full text-xs" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">Priority</label>
              <select className="field w-full text-xs" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">Uploader</label>
              <select className="field w-full text-xs" value={uploaderId} onChange={e => setUploaderId(e.target.value)}>
                <option value="">All Uploaders</option>
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">Department</label>
              <select className="field w-full text-xs" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">Category</label>
              <select className="field w-full text-xs" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">Tag</label>
              <select className="field w-full text-xs" value={tagId} onChange={e => setTagId(e.target.value)}>
                <option value="">All Tags</option>
                {tags.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">Start Date (From)</label>
              <input type="date" className="field w-full text-xs" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">End Date (To)</label>
              <input type="date" className="field w-full text-xs" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {savedFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink/50">Saved filters:</span>
          {savedFilters.map(f => (
            <button 
              key={f.id} 
              onClick={() => handleApplyFilter(f)} 
              className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1 text-xs font-bold text-ink hover:bg-mint/50 transition"
            >
              <Bookmark size={12} className="text-moss" />
              {f.name}
              <span onClick={(e) => handleDeleteFilter(f.id, e)} className="ml-1 text-ink/40 hover:text-red-600">×</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 text-ink/35" size={18}/>
          <input className="field pl-10 w-full" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents by title…"/>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        {sortedDocs.length ? sortedDocs.map(d => {
          const isPending = d.status === 'PENDING';
          const isOverdue = d.dueDate && new Date(d.dueDate) < new Date() && !['SIGNED', 'ARCHIVED', 'REJECTED'].includes(d.status);
          const priorityBadge = (p) => {
            if (p === 'URGENT') return <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Urgent</span>
            if (p === 'HIGH') return <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">High</span>
            if (p === 'LOW') return <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">Low</span>
            return null
          };
          return (
            <Link to={`/documents/${d.id}`} key={d.id} className={`flex flex-col sm:flex-row sm:items-center gap-4 border-b border-ink/10 p-5 transition ${isPending ? 'bg-mint/35 hover:bg-mint/60' : 'hover:bg-sand'}`}>
              <FileText className="text-moss shrink-0"/>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">{d.title}</p>
                  <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 text-[11px] font-black">
                    v{d.currentVersion || 1}
                  </span>
                  {priorityBadge(d.priority)}
                  {d.categoryName && (
                    <span className="rounded-md bg-sand px-2 py-0.5 text-xs font-bold text-ink/70">
                      {d.categoryName}
                    </span>
                  )}
                  {d.tags && d.tags.map(tagName => (
                    <span key={tagName} className="inline-flex items-center gap-1 rounded-md bg-mint/50 px-2 py-0.5 text-xs font-bold text-moss">
                      <Hash size={11} />
                      {tagName}
                    </span>
                  ))}
                  {d.dueDate && (
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${isOverdue ? 'bg-red-500 text-white' : 'bg-sand text-ink/70'}`}>
                      Due: {d.dueDate} {isOverdue && '(Overdue)'}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink/55">{d.owner} {d.departmentName ? `· ${d.departmentName}` : ''} · {d.originalFileName}</p>
              </div>
              <span className={`self-start sm:self-center rounded-full px-3 py-1 text-xs font-bold ${isPending ? 'bg-mint text-moss' : 'text-moss'}`}>
                {d.status.replaceAll('_',' ')}
              </span>
            </Link>
          )
        }) : <p className="p-10 text-center text-sm text-ink/55">No documents found matching your advanced search criteria.</p>}
      </div>

      {upload && <UploadDocumentDialog onClose={()=>setUpload(false)} onUploaded={()=>{setUpload(false);load()}}/>}
    </>
  )
}
