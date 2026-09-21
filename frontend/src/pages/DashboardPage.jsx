import { CheckCircle2, Clock3, FileText, PenLine, Upload, BarChart3, TrendingUp, Award, Clock } from 'lucide-react'
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
    api.get('/documents', { params: { size: 100 } })
      .then(({ data }) => setDocs(data.content))
      .catch(() => setDocs([]))

    api.get('/analytics/dashboard')
      .then(({ data }) => setAnalytics(data))
      .catch(() => setAnalytics(null))
  }

  useEffect(() => { load() }, [])

  const count = (status) => docs.filter(d => d.status === status).length

  const sortedDocs = [...docs].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1
    return 0
  })

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">Operations overview</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Your workspace.</h1>
          <p className="mt-2 text-sm text-ink/60">Live document activity and workflow analytics from your assigned workflows.</p>
        </div>
        <button 
          onClick={() => setUpload(true)} 
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-moss px-4 py-3 text-sm font-bold text-white hover:bg-ink transition"
        >
          <Upload size={17} />
          Upload document
        </button>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending review" value={count('PENDING').toString().padStart(2, '0')} detail="Awaiting reviewer decisions" icon={Clock3} />
        <StatCard label="In workflow" value={docs.length.toString().padStart(2, '0')} detail="Documents you can access" icon={FileText} />
        <StatCard label="Ready to sign" value={count('READY_FOR_SIGNATURE').toString().padStart(2, '0')} detail="All reviews complete" icon={PenLine} />
        <StatCard label="Signed" value={count('SIGNED').toString().padStart(2, '0')} detail="Completed documents" icon={CheckCircle2} />
      </section>

      {analytics && (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard 
            label="Approval Rate" 
            value={`${analytics.approvalRate}%`} 
            detail="Percentage of approved decisions" 
            icon={Award} 
            tone="amber" 
          />
          <StatCard 
            label="Avg Approval Time" 
            value={`${analytics.averageApprovalHours} hrs`} 
            detail="Mean time from creation to decision" 
            icon={Clock} 
            tone="moss" 
          />
          <StatCard 
            label="Signed Today" 
            value={analytics.signedToday.toString().padStart(2, '0')} 
            detail="Completed documents finalized today" 
            icon={TrendingUp} 
            tone="mint" 
          />
        </section>
      )}

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_.85fr]">
        <article className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-extrabold">Recent documents</h2>
              <p className="mt-1 text-sm text-ink/55">Actual documents in your workspace requiring review or tracking.</p>
            </div>
            <Link to="/documents" className="text-sm font-bold text-moss hover:underline">View all</Link>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs font-bold uppercase tracking-wider text-ink/45">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {sortedDocs.slice(0, 5).map(d => (
                  <tr key={d.id} className="group hover:bg-sand/40">
                    <td className="py-3.5 font-semibold">
                      <Link to={`/documents/${d.id}`} className="hover:text-moss">{d.title}</Link>
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex rounded-full bg-sand px-2.5 py-1 text-xs font-bold text-ink/80">{d.status}</span>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${d.priority === 'URGENT' ? 'bg-red-100 text-red-700' : d.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-sand text-ink/70'}`}>
                        {d.priority || 'NORMAL'}
                      </span>
                    </td>
                    <td className="py-3.5 text-ink/60">{d.ownerName}</td>
                  </tr>
                ))}
                {sortedDocs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-ink/40">No documents found in your workspace.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <div className="space-y-6">
          {analytics && analytics.categoryCounts && Object.keys(analytics.categoryCounts).length > 0 && (
            <article className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold">Categories Breakdown</h2>
              <p className="mt-1 text-sm text-ink/55">Document distribution by category</p>
              <div className="mt-4 space-y-3">
                {Object.entries(analytics.categoryCounts).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink/80">{cat}</span>
                    <span className="rounded-full bg-sand px-2.5 py-0.5 font-mono text-xs font-bold text-moss">{count}</span>
                  </div>
                ))}
              </div>
            </article>
          )}

          {analytics && analytics.departmentCounts && Object.keys(analytics.departmentCounts).length > 0 && (
            <article className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold">Departments Breakdown</h2>
              <p className="mt-1 text-sm text-ink/55">Document distribution by department</p>
              <div className="mt-4 space-y-3">
                {Object.entries(analytics.departmentCounts).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink/80">{dept}</span>
                    <span className="rounded-full bg-sand px-2.5 py-0.5 font-mono text-xs font-bold text-moss">{count}</span>
                  </div>
                ))}
              </div>
            </article>
          )}

          <article className="rounded-2xl border border-ink/10 bg-gradient-to-br from-moss to-ink p-6 text-white shadow-sm">
            <h2 className="text-lg font-extrabold">Need assistance?</h2>
            <p className="mt-2 text-sm text-white/80">Check compliance guidelines or reach out to your system administrator for workflow reassignments.</p>
            <div className="mt-4">
              <Link to="/documents" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-ink hover:bg-mint transition">
                Browse all documents
              </Link>
            </div>
          </article>
        </div>
      </section>

      {upload && <UploadDocumentDialog onClose={() => setUpload(false)} onUploaded={load} />}
    </>
  )
}
