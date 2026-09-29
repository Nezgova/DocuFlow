import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import RestartDocumentDialog from '../components/RestartDocumentDialog'
import UploadNewVersionDialog from '../components/UploadNewVersionDialog'
import SignDocumentDialog from '../components/SignDocumentDialog'
import { FileText, CheckCircle2, PenLine, ShieldCheck, Clock, Hash, History } from 'lucide-react'

export default function DocumentDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [doc, setDoc] = useState()
  const [comments, setComments] = useState([])
  const [versions, setVersions] = useState([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [restarting, setRestarting] = useState(false)
  const [uploadingVersion, setUploadingVersion] = useState(false)
  const [signing, setSigning] = useState(false)

  const load = () => Promise.all([
    api.get(`/documents/${id}`),
    api.get(`/documents/${id}/comments`),
    api.get(`/documents/${id}/versions`)
  ]).then(([d, c, v]) => {
    setDoc(d.data)
    setComments(c.data)
    setVersions(v.data)
  }).catch(e => setError(e.response?.data?.message || 'Unable to load document'))

  useEffect(() => { load() }, [id])

  const action = (path, body, method = 'post') => api[method](path, body).then(load).catch(e => setError(e.response?.data?.message || 'Action failed'))

  const view = () => {
    const tab = window.open('', '_blank')
    if (!tab) {
      setError('Allow pop-ups to view PDFs.')
      return
    }
    tab.document.write('Loading PDF…')
    api.get(`/documents/${id}/file`, { responseType: 'blob' })
      .then(r => tab.location.replace(URL.createObjectURL(r.data)))
      .catch(() => {
        tab.close()
        setError('Unable to open PDF')
      })
  }

  const viewVersion = (ver) => {
    const tab = window.open('', '_blank')
    if (!tab) {
      setError('Allow pop-ups to view PDFs.')
      return
    }
    tab.document.write('Loading PDF version…')
    const url = ver.id ? `/documents/${id}/versions/${ver.id}/file` : `/documents/${id}/file`
    api.get(url, { responseType: 'blob' })
      .then(r => tab.location.replace(URL.createObjectURL(r.data)))
      .catch(() => {
        tab.close()
        setError('Unable to open version PDF')
      })
  }

  if (!doc) return <p className="p-10 text-center text-ink/60">{error || 'Loading document...'}</p>

  const review = doc.reviewers.find(r => r.id === user.id)
  const ready = doc.status === 'READY_FOR_SIGNATURE'
  const signed = doc.status === 'SIGNED' || doc.status === 'ARCHIVED'
  const hasDecisions = doc.reviewers.some(r => r.decision !== 'PENDING')
  const canChange = (doc.ownerId === user.id || user.role === 'ADMINISTRATOR') && !hasDecisions && doc.status === 'PENDING'
  const canUploadNewVersion = (doc.ownerId === user.id || user.role === 'ADMINISTRATOR') && !signed
  const isManagerOrAdmin = user.role === 'MANAGER' || user.role === 'ADMINISTRATOR'

  return (
    <>
      <Link to="/documents" className="text-sm font-bold text-moss hover:underline">← Back to documents</Link>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${signed ? 'bg-moss text-white' : ready ? 'bg-mint text-moss' : 'bg-sand text-ink/70'}`}>
              {signed ? <CheckCircle2 size={13} /> : ready ? <PenLine size={13} /> : <Clock size={13} />}
              {doc.status.replaceAll('_', ' ')}
            </span>
            <span className="rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-black tracking-wide">
              v{doc.currentVersion || 1}
            </span>
            {doc.priority && doc.priority !== 'NORMAL' && (
              <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                doc.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                doc.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {doc.priority}
              </span>
            )}
            {doc.categoryName && (
              <span className="rounded-md bg-sand px-2 py-0.5 text-xs font-bold text-ink/70">
                {doc.categoryName}
              </span>
            )}
            {doc.tags && doc.tags.map(tagName => (
              <span key={tagName} className="inline-flex items-center gap-1 rounded-md bg-mint/50 px-2 py-0.5 text-xs font-bold text-moss">
                <Hash size={11} />
                {tagName}
              </span>
            ))}
            {doc.dueDate && (
              <span className="rounded-md bg-sand px-2 py-0.5 text-xs font-bold text-ink/70">
                Due: {doc.dueDate}
              </span>
            )}
            <span className="text-xs text-ink/50">· {doc.originalFileName} {doc.departmentName ? `· ${doc.departmentName}` : ''}</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{doc.title}</h1>
          {doc.description && <p className="mt-1 text-sm text-ink/65">{doc.description}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={view}
            className="inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm font-bold hover:bg-sand"
          >
            <FileText size={17} />
            View PDF {signed && '(Signed & Certified)'}
          </button>

          {canUploadNewVersion && (
            <button
              onClick={() => setUploadingVersion(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm font-bold hover:bg-sand"
            >
              <History size={17} />
              Upload New Version
            </button>
          )}

          {canChange && (
            <button
              onClick={() => setRestarting(true)}
              className="rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm font-bold hover:bg-sand"
            >
              Modify document
            </button>
          )}

          {review?.decision === 'PENDING' && (
            <>
              <button
                onClick={() => action(`/documents/${id}/decision`, { decision: 'APPROVED' }, 'patch')}
                className="rounded-xl bg-moss px-4 py-3 text-sm font-bold text-white hover:bg-ink"
              >
                Approve
              </button>
              <button
                onClick={() => action(`/documents/${id}/decision`, { decision: 'REJECTED' }, 'patch')}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
              >
                Reject
              </button>
            </>
          )}

          {isManagerOrAdmin && ready && (
            <button
              onClick={() => setSigning(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-moss px-5 py-3 text-sm font-bold text-white hover:bg-ink animate-pulse"
            >
              <PenLine size={17} />
              Sign & Generate PDF
            </button>
          )}

          {isManagerOrAdmin && doc.status === 'SIGNED' && (
            <button
              onClick={() => {
                const reason = prompt('Enter archive reason / notes:')
                if (reason !== null) {
                  api.post(`/documents/${id}/archive`, { reason })
                    .then(r => setDoc(r.data))
                    .catch(err => alert(err.response?.data?.message || 'Failed to archive document'))
                }
              }}
              className="rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm font-bold hover:bg-sand"
            >
              Archive
            </button>
          )}

          {isManagerOrAdmin && doc.status === 'ARCHIVED' && (
            <button
              onClick={() => {
                if (confirm('Restore this document from the archive?')) {
                  api.post(`/documents/${id}/restore`)
                    .then(r => setDoc(r.data))
                    .catch(err => alert(err.response?.data?.message || 'Failed to restore document'))
                }
              }}
              className="rounded-xl bg-moss px-4 py-3 text-sm font-bold text-white hover:bg-ink"
            >
              Restore from Archive
            </button>
          )}
        </div>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {doc.status === 'ARCHIVED' && (
        <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-600 text-white font-bold">
            AR
          </div>
          <div>
            <h2 className="font-extrabold text-amber-900">Document Archived in Compliance Vault</h2>
            <p className="mt-1 text-sm text-amber-800">
              Archived on {doc.archivedAt ? new Date(doc.archivedAt).toLocaleString() : 'N/A'} {doc.archivedBy ? `by ${doc.archivedBy}` : ''}.
              {doc.archiveReason && ` Reason: ${doc.archiveReason}`}
            </p>
          </div>
        </div>
      )}

      {signed && (
        <div className="mt-6 rounded-2xl bg-mint/30 border border-moss/20 p-5 flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-moss text-white">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="font-extrabold text-moss">Document Successfully Signed & Certified</h2>
            <p className="mt-1 text-sm text-ink/75">
              An official signature certificate page has been generated and appended to the final PDF. It contains all reviewer approvals, timestamps, and cryptographic signing verification. Click <button onClick={view} className="font-bold underline hover:text-moss">View PDF</button> to inspect the certified document.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Card 1: Approval Timeline & Reviewers */}
        <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <Clock size={18} className="text-moss" />
              Approval Timeline
            </h2>
            <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-bold text-ink/70">
              {doc.reviewers.filter(r => r.decision === 'APPROVED').length} / {doc.reviewers.length} Approved
            </span>
          </div>
          <p className="mt-1 text-xs text-ink/55">Step-by-step workflow progression</p>

          <div className="mt-5 relative pl-6 space-y-6 before:absolute before:bottom-2 before:top-2 before:left-2 before:w-0.5 before:bg-ink/10">
            {/* Step 1: Submission */}
            <div className="relative">
              <span className="absolute -left-6 top-1 grid h-4 w-4 place-items-center rounded-full bg-moss text-[10px] text-white ring-4 ring-white">✓</span>
              <p className="text-xs font-black uppercase tracking-wider text-moss">Step 1: Submitted</p>
              <p className="text-sm font-bold mt-0.5">{doc.owner} uploaded v{doc.currentVersion || 1}</p>
              <p className="text-[11px] text-ink/50">{new Date(doc.createdAt).toLocaleString()}</p>
            </div>

            {/* Step 2: Reviewers Phase */}
            <div className="relative">
              <span className="absolute -left-6 top-1 grid h-4 w-4 place-items-center rounded-full bg-mint text-[10px] text-moss font-bold ring-4 ring-white">2</span>
              <p className="text-xs font-black uppercase tracking-wider text-moss">Step 2: Review & Approvals</p>
              <div className="mt-2 space-y-2">
                {doc.reviewers.map((r) => {
                  const approved = r.decision === 'APPROVED'
                  const rejected = r.decision === 'REJECTED'
                  return (
                    <div key={r.id} className="rounded-xl bg-sand/60 p-3 text-sm flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs">{r.name}</p>
                        {r.decidedAt && (
                          <p className="text-[10px] text-ink/50 mt-0.5">{new Date(r.decidedAt).toLocaleString()}</p>
                        )}
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        approved ? 'bg-mint text-moss' :
                        rejected ? 'bg-red-100 text-red-700' :
                        'bg-sand text-ink/60'
                      }`}>
                        {r.decision}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step 3: Final Signature / Certification */}
            <div className="relative">
              <span className={`absolute -left-6 top-1 grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold ring-4 ring-white ${
                doc.status === 'SIGNED' || doc.status === 'ARCHIVED' ? 'bg-moss text-white' : 'bg-sand text-ink/50'
              }`}>
                {doc.status === 'SIGNED' || doc.status === 'ARCHIVED' ? '✓' : '3'}
              </span>
              <p className="text-xs font-black uppercase tracking-wider text-moss">Step 3: Signature & Certification</p>
              <p className="text-sm font-bold mt-0.5">
                {doc.status === 'SIGNED' || doc.status === 'ARCHIVED' ? 'Signed & Certified' : ready ? 'Ready for Manager Signature' : 'Pending Reviewer Consensus'}
              </p>
              <p className="text-[11px] text-ink/50">
                {doc.status === 'SIGNED' ? 'Final cryptographic certificate generated' : 'Awaiting all approvals'}
              </p>
            </div>
          </div>
        </section>

        {/* Card 2: Version History */}
        <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <History size={18} className="text-moss" />
                Version History
              </h2>
              <p className="mt-1 text-xs text-ink/55">Revisions & historical drafts</p>
            </div>
            {canUploadNewVersion && (
              <button
                onClick={() => setUploadingVersion(true)}
                className="rounded-lg bg-sand px-2.5 py-1 text-xs font-bold text-ink/75 hover:bg-mint hover:text-moss"
              >
                + New v{(doc.currentVersion || 1) + 1}
              </button>
            )}
          </div>

          <div className="mt-4 flex-1 space-y-3 max-h-72 overflow-y-auto pr-1">
            {versions.length === 0 ? (
              <p className="text-sm text-ink/50">No previous versions recorded.</p>
            ) : (
              versions.map((ver) => {
                const isCurrent = ver.versionNumber === (doc.currentVersion || 1)
                return (
                  <div
                    key={ver.id || ver.versionNumber}
                    className={`rounded-xl p-3 text-sm transition-all border ${
                      isCurrent
                        ? 'bg-mint/20 border-moss/20'
                        : 'bg-sand/60 border-transparent hover:bg-sand'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`rounded px-1.5 py-0.5 text-xs font-black ${
                          isCurrent ? 'bg-moss text-white' : 'bg-ink/10 text-ink/80'
                        }`}>
                          v{ver.versionNumber}
                        </span>
                        {isCurrent && (
                          <span className="text-[11px] font-bold text-moss">Current</span>
                        )}
                      </div>
                      <button
                        onClick={() => viewVersion(ver)}
                        title="View PDF of this version"
                        className="inline-flex items-center gap-1 text-xs font-bold text-moss hover:underline"
                      >
                        <FileText size={13} />
                        View PDF
                      </button>
                    </div>

                    <p className="mt-1.5 text-xs text-ink/85 font-medium">
                      {ver.changeNotes || 'No change description'}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-ink/50">
                      <span>{ver.uploadedByName}</span>
                      <span>{(ver.fileSize / 1024).toFixed(0)} KB · {new Date(ver.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Card 3: Activity & Comments */}
        <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-extrabold">Activity & Comments</h2>
          <p className="mt-1 text-xs text-ink/55">Communication and audit notes</p>
          <div className="mt-4 flex-1 space-y-3 max-h-56 overflow-y-auto pr-2">
            {comments.length === 0 ? (
              <p className="text-sm text-ink/50">No comments yet.</p>
            ) : (
              comments.map((c, i) => (
                <div key={i} className="rounded-xl bg-sand p-3 text-sm">
                  <p className="font-bold text-xs text-moss">{c.author}</p>
                  <p className="mt-1 text-ink/80">{c.content}</p>
                </div>
              ))
            )}
          </div>
          <form className="mt-4 flex gap-2" onSubmit={e => {
            e.preventDefault()
            if (text.trim()) {
              action(`/documents/${id}/comments`, { content: text })
              setText('')
            }
          }}>
            <input
              className="field flex-1"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add review comment..."
            />
            <button className="rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white hover:bg-moss">
              Post
            </button>
          </form>
        </section>
      </div>

      {uploadingVersion && (
        <UploadNewVersionDialog
          document={doc}
          onClose={() => setUploadingVersion(false)}
          onUploaded={() => { setUploadingVersion(false); load() }}
        />
      )}

      {restarting && (
        <RestartDocumentDialog
          document={doc}
          onClose={() => setRestarting(false)}
          onRestarted={() => { setRestarting(false); load() }}
        />
      )}

      {signing && (
        <SignDocumentDialog
          document={doc}
          onClose={() => setSigning(false)}
          onSigned={() => { setSigning(false); load() }}
        />
      )}
    </>
  )
}
