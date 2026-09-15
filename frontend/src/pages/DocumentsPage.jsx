import { FileText, Hash, Search, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import UploadDocumentDialog from '../components/UploadDocumentDialog'

export default function DocumentsPage(){
  const [docs, setDocs] = useState([])
  const [departments, setDepartments] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagId, setTagId] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [upload, setUpload] = useState(false)

  const load = () => {
    const params = {}
    if (search) params.q = search
    if (departmentId) params.departmentId = departmentId
    if (categoryId) params.categoryId = categoryId
    if (tagId) params.tagId = tagId
    api.get('/documents', { params }).then(r => setDocs(r.data.content))
  }

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data)).catch(() => {})
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
    api.get('/tags').then(r => setTags(r.data)).catch(() => {})
  }, [])

  useEffect(() => { load() }, [search, departmentId, categoryId, tagId])

  const filteredDocs = docs.filter(d => {
    if (priorityFilter && d.priority !== priorityFilter) return false
    return true
  })

  const sortedDocs = [...filteredDocs].sort((a,b)=>{
    if(a.status==='PENDING'&&b.status!=='PENDING')return-1;
    if(a.status!=='PENDING'&&b.status==='PENDING')return 1;
    return 0;
  });

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">Document workspace</p>
          <h1 className="mt-2 text-3xl font-extrabold">Documents</h1>
        </div>
        <button onClick={()=>setUpload(true)} className="flex items-center gap-2 rounded-xl bg-moss px-4 py-3 text-sm font-bold text-white hover:bg-ink">
          <Upload size={17}/>Upload PDF
        </button>
      </div>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-3.5 text-ink/35" size={18}/>
          <input className="field pl-10 w-full" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents…"/>
        </div>
        <div className="w-full sm:w-44">
          <select className="field w-full" value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c=>(
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-44">
          <select className="field w-full" value={tagId} onChange={e=>setTagId(e.target.value)}>
            <option value="">All Tags</option>
            {tags.map(t=>(
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-44">
          <select className="field w-full" value={departmentId} onChange={e=>setDepartmentId(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d=>(
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-44">
          <select className="field w-full" value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
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
        }) : <p className="p-10 text-center text-sm text-ink/55">No documents yet.</p>}
      </div>

      {upload && <UploadDocumentDialog onClose={()=>setUpload(false)} onUploaded={()=>{setUpload(false);load()}}/>}
    </>
  )
}
