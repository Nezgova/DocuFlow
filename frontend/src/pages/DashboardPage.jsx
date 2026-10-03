import { CheckCircle2, Clock3, FileText, PenLine, Upload, TrendingUp, Building2, Layers, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import UploadDocumentDialog from '../components/UploadDocumentDialog'
import api from '../services/api'

export default function DashboardPage() {
  const [docs, setDocs] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [upload, setUpload] = useState(false)

  const load = () => {
    Promise.all([
      api.get('/documents', { params: { size: 100 } }),
      api.get('/analytics/dashboard').catch(() => ({ data: null }))
    ]).then(([docRes, anaRes]) => {
      setDocs(docRes.data.content || [])
      setAnalytics(anaRes.data)
    }).catch(() => {
      setDocs([])
    })
  }

  useEffect(() => {
    load()
  }, [])

  const count = (status) => docs.filter(d => d.status === status).length

  const sortedDocs = [...docs].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1
    return 0
  })

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[.18em] text-moss font-bold bg-mint/50 px-2.5 py-1 rounded-md">Operations Overview</span>
            <span className="text-xs text-ink/40">· Enterprise Workspace</span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">Dashboard & Analytics</h1>
          <p className="mt-1.5 text-sm text-ink/65">Real-time document review metrics, approval velocity, and departmental workflows.</p>
        </div>
        <button 
          onClick={() => setUpload(true)} 
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-moss px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-ink transition"
        >
          <Upload size={17} />Upload Document
        </button>
      </div>

      {/* Primary KPI Status Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending review" value={count('PENDING').toString().padStart(2, '0')} detail="Awaiting reviewer decisions" icon={Clock3} />
        <StatCard label="In workflow" value={docs.length.toString().padStart(2, '0')} detail="Accessible documents" icon={FileText} />
        <StatCard label="Ready to sign" value={count('READY_FOR_SIGNATURE').toString().padStart(2, '0')} detail="All reviews complete" icon={PenLine} />
        <StatCard label="Signed & Certified" value={count('SIGNED').toString().padStart(2, '0')} detail="Finalized documents" icon={CheckCircle2} />
      </section>

      {/* Advanced Analytics Performance Cards */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-ink/60 font-semibold">Approval Rate</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-mint/60 text-moss"><TrendingUp size={18} /></div>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-ink">{analytics ? `${analytics.approvalRate}%` : '—'}</p>
              <span className="text-xs font-bold text-moss">Target &gt; 85%</span>
            </div>
            <p className="mt-1 text-xs text-ink/60">Successful review & completion ratio</p>
          </div>
          <div className="h-2 w-full rounded-full bg-sand overflow-hidden">
            <div className="h-full bg-moss rounded-full transition-all duration-700" style={{ width: `${analytics?.approvalRate || 0}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-ink/60 font-semibold">Avg Turnaround</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-800"><Clock3 size={18} /></div>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-ink">{analytics ? `${analytics.averageApprovalHours}h` : '—'}</p>
              <span className="text-xs font-bold text-amber-800">Mean duration</span>
            </div>
            <p className="mt-1 text-xs text-ink/60">Upload to signature timestamp</p>
          </div>
          <p className="text-xs font-bold text-moss">Optimized pipeline velocity</p>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-ink/60 font-semibold">Departments</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-100 text-blue-800"><Building2 size={18} /></div>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-ink">{analytics?.departmentBreakdown ? Object.keys(analytics.departmentBreakdown).length : 0}</p>
              <span className="text-xs font-bold text-blue-800">Active units</span>
            </div>
            <p className="mt-1 text-xs text-ink/60">Contributing organizational divisions</p>
          </div>
          <p className="text-xs font-bold text-blue-800">Cross-departmental scoping</p>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-ink/60 font-semibold">Categories</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-100 text-purple-800"><Layers size={18} /></div>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-ink">{analytics?.categoryBreakdown ? Object.keys(analytics.categoryBreakdown).length : 0}</p>
              <span className="text-xs font-bold text-purple-800">Taxonomies</span>
            </div>
            <p className="mt-1 text-xs text-ink/60">Classified document structures</p>
          </div>
          <p className="text-xs font-bold text-purple-800">Structured organization</p>
        </div>
      </section>

      {/* Main Content Grid: Recent Documents & Department Breakdown */}
      <section className="grid gap-6 xl:grid-cols-[1.45fr_.85fr]">
        {/* Recent Documents Table / List */}
        <article className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-ink">Recent workspace documents</h2>
                <p className="text-xs text-ink/60 mt-0.5">Latest document submissions across your assigned workflows</p>
              </div>
              <Link to="/documents" className="inline-flex items-center gap-1 text-xs font-bold text-moss hover:underline">
                View all documents <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="mt-4 divide-y divide-ink/10">
              {sortedDocs.slice(0, 6).map(doc => (
                <div key={doc.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 hover:bg-sand/40 px-2 rounded-xl transition">
                  <div className="min-w-0 pr-4 flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-mint/50 text-moss shrink-0">
                      <FileText size={17} />
                    </div>
                    <div className="min-w-0">
                      <Link to={`/documents/${doc.id}`} className="font-bold text-ink hover:text-moss truncate block text-sm">{doc.title}</Link>
                      <p className="text-xs text-ink/55 mt-0.5">{doc.departmentName || 'General'} · {doc.categoryName || 'Uncategorized'} · <span className="font-mono text-[11px]">v{doc.currentVersion || 1}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                      doc.status === 'SIGNED' ? 'bg-mint/70 text-moss border border-moss/20' :
                      doc.status === 'READY_FOR_SIGNATURE' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      doc.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {doc.status.replaceAll('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
              {sortedDocs.length === 0 && (
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-10 w-10 text-ink/30" />
                  <p className="mt-3 text-sm font-bold text-ink/70">No documents in workspace.</p>
                  <p className="mt-1 text-xs text-ink/50">Upload your first PDF document to initiate a review workflow.</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-ink/10 flex items-center justify-between text-xs text-ink/50 font-medium">
            <span>Showing recent activity</span>
            <span className="font-mono text-moss">Secure TLS Active</span>
          </div>
        </article>

        {/* Department Volume Distribution */}
        <article className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-ink/10 pb-4">
              <h2 className="text-lg font-extrabold text-ink">Department distribution</h2>
              <p className="text-xs text-ink/60 mt-0.5">Document volume across organizational divisions</p>
            </div>
            <div className="mt-6 space-y-5">
              {analytics?.departmentBreakdown && Object.entries(analytics.departmentBreakdown).map(([dept, count]) => {
                const total = analytics.totalDocuments || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={dept} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-ink">{dept}</span>
                      <span className="text-ink/60 font-mono">{count} docs ({pct}%)</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-sand overflow-hidden">
                      <div className="h-full bg-moss rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              {!analytics?.departmentBreakdown || Object.keys(analytics.departmentBreakdown).length === 0 ? (
                <p className="text-sm text-ink/50 py-8 text-center">No department analytics available.</p>
              ) : null}
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-ink/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink/60">
              <ShieldCheck size={16} className="text-moss" />
              <span>Auditable Governance</span>
            </div>
            <span className="font-mono text-xs text-moss font-bold">DocuFlow v3.5</span>
          </div>
        </article>
      </section>

      {upload && <UploadDocumentDialog onClose={() => setUpload(false)} onUploaded={load} />}
    </div>
  )
}
