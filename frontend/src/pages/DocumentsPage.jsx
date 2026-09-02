import { FileText, Search, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import UploadDocumentDialog from '../components/UploadDocumentDialog'

export default function DocumentsPage(){
  const [docs, setDocs] = useState([])
  const [departments, setDepartments] = useState([])
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [upload, setUpload] = useState(false)

  const load = () => {
    const params = {}
    if (search) params.q = search
    if (departmentId) params.departmentId = departmentId
    api.get('/documents', { params }).then(r => setDocs(r.data.content))
  }

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data)).catch(() => {})
  }, [])

  useEffect(() => { load() }, [search, departmentId])

  const sortedDocs = [...docs].sort((a,b)=>{
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
        <div className="w-full sm:w-64">
          <select className="field w-full" value={departmentId} onChange={e=>setDepartmentId(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d=>(
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        {sortedDocs.length ? sortedDocs.map(d => {
          const isPending = d.status === 'PENDING';
          return (
            <Link to={`/documents/${d.id}`} key={d.id} className={`flex flex-col sm:flex-row sm:items-center gap-4 border-b border-ink/10 p-5 transition ${isPending ? 'bg-mint/35 hover:bg-mint/60' : 'hover:bg-sand'}`}>
              <FileText className="text-moss shrink-0"/>
              <div className="flex-1">
                <p className="font-bold">{d.title}</p>
                <p className="text-xs text-ink/55">{d.owner} {d.departmentName ? `· ${d.departmentName}` : ''} · {d.originalFileName}</p>
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
