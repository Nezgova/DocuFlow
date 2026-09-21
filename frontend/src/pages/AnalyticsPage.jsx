import { Award, BarChart3, CheckCircle2, Clock, FileText, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import api from '../services/api'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(({ data }) => setAnalytics(data))
      .catch(() => setError('Failed to load analytics data'))
  }, [])

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">System insights</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Analytics & Reports</h1>
          <p className="mt-1 text-sm text-ink/60">Comprehensive performance metrics, approval rates, and workflow distributions.</p>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {analytics ? (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total Documents" value={analytics.totalDocuments.toString().padStart(2, '0')} detail="All accessible documents" icon={FileText} tone="moss" />
            <StatCard label="Pending Review" value={analytics.pendingDocuments.toString().padStart(2, '0')} detail="Awaiting reviewer action" icon={Clock} tone="amber" />
            <StatCard label="Ready to Sign" value={analytics.readyForSignature.toString().padStart(2, '0')} detail="Completed reviews pending signature" icon={CheckCircle2} tone="mint" />
            <StatCard label="Signed Today" value={analytics.signedToday.toString().padStart(2, '0')} detail="Finalized today" icon={TrendingUp} tone="moss" />
            <StatCard label="Approval Rate" value={`${analytics.approvalRate}%`} detail="Percentage of approved decisions" icon={Award} tone="amber" />
            <StatCard label="Avg Approval Time" value={`${analytics.averageApprovalHours} hrs`} detail="Mean time from creation to decision" icon={BarChart3} tone="mint" />
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold">Categories Breakdown</h2>
              <p className="mt-1 text-sm text-ink/55">Document distribution across categories</p>
              <div className="mt-4 space-y-3">
                {analytics.categoryCounts && Object.entries(analytics.categoryCounts).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink/80">{cat}</span>
                    <span className="rounded-full bg-sand px-3 py-1 font-mono text-xs font-bold text-moss">{count}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold">Departments Breakdown</h2>
              <p className="mt-1 text-sm text-ink/55">Document distribution across departments</p>
              <div className="mt-4 space-y-3">
                {analytics.departmentCounts && Object.entries(analytics.departmentCounts).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink/80">{dept}</span>
                    <span className="rounded-full bg-sand px-3 py-1 font-mono text-xs font-bold text-moss">{count}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      ) : (
        <div className="mt-12 text-center text-sm text-ink/50">Loading analytics...</div>
      )}
    </>
  )
}
