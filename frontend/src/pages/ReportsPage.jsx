import { BarChart3, Download, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function ReportsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleDownload = (endpoint, filename) => {
    setLoading(filename)
    setError('')
    setSuccess('')
    api.get(endpoint, { responseType: 'blob' })
      .then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        setSuccess(`Successfully downloaded ${filename}`)
        setLoading(null)
      })
      .catch(() => {
        setError(`Failed to generate or download ${filename}`)
        setLoading(null)
      })
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">Analytics & Data Export</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">System Reports</h1>
          <p className="mt-1 text-sm text-ink/60">Export official document summaries and audit trail reports in CSV or PDF format.</p>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="mt-4 rounded-xl bg-mint/40 px-4 py-3 text-sm text-moss font-bold flex items-center gap-2"><CheckCircle2 size={16} />{success}</p>}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Document Summary Report */}
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-mint/50 text-moss">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold">Document Summary Report</h2>
                <p className="text-xs text-ink/60">All documents, statuses, categories, departments, and uploaders</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-ink/80 leading-relaxed">
              Comprehensive inventory of all documents stored in DocuFlow. Includes document titles, security classifications, categories, departments, current approval statuses, priorities, and creation timestamps.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-ink/10">
            <button
              onClick={() => handleDownload('/reports/documents/csv', 'documents-report.csv')}
              disabled={loading !== null}
              className="btn-secondary text-xs flex items-center gap-2"
            >
              <Download size={14} />
              {loading === 'documents-report.csv' ? 'Generating...' : 'Export CSV'}
            </button>
            <button
              onClick={() => handleDownload('/reports/documents/pdf', 'documents-report.pdf')}
              disabled={loading !== null}
              className="btn-primary text-xs flex items-center gap-2"
            >
              <Download size={14} />
              {loading === 'documents-report.pdf' ? 'Generating...' : 'Export PDF Report'}
            </button>
          </div>
        </div>

        {/* Activity & Audit Trail Report */}
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-800">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold">Activity & Audit Trail Report</h2>
                <p className="text-xs text-ink/60">System-wide audit logs, user actions, and timestamps</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-ink/80 leading-relaxed">
              Complete chronological audit record of all user interactions across the workspace. Tracks actions, target documents, actor emails, client IP addresses, and exact timestamps for compliance and security reviews.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-ink/10">
            <button
              onClick={() => handleDownload('/reports/activity/csv', 'activity-report.csv')}
              disabled={loading !== null}
              className="btn-secondary text-xs flex items-center gap-2"
            >
              <Download size={14} />
              {loading === 'activity-report.csv' ? 'Generating...' : 'Export CSV'}
            </button>
            <button
              onClick={() => handleDownload('/reports/activity/pdf', 'activity-report.pdf')}
              disabled={loading !== null}
              className="btn-primary text-xs flex items-center gap-2"
            >
              <Download size={14} />
              {loading === 'activity-report.pdf' ? 'Generating...' : 'Export PDF Report'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
