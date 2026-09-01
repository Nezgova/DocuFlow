import { PenLine, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function SignDocumentDialog({ document, onClose, onSigned }) {
  const { user } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [signatureName, setSignatureName] = useState(user?.fullName || '')

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.post(`/documents/${document.id}/sign`, { signatureName })
      onSigned()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign document.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4" role="dialog" aria-modal="true" aria-labelledby="sign-title">
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">Digital Signature</p>
            <h2 id="sign-title" className="mt-1 text-xl font-extrabold">Sign Document & Generate Certificate</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1 text-ink/50 hover:bg-sand">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-sand p-4 text-sm leading-relaxed text-ink/80">
          <p className="font-bold text-moss flex items-center gap-2"><ShieldCheck size={18}/> Official Tamper-Evident PDF Generation</p>
          <p className="mt-2">
            Signing this document will automatically generate a new signed PDF version. It appends an official certificate page to the end of <span className="font-semibold">{document.originalFileName}</span> containing:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-ink/70">
            <li>Document metadata and upload audit trail</li>
            <li>All reviewer approval decisions with timestamps</li>
            <li>Your cryptographic digital signature and execution date</li>
          </ul>
        </div>

        <label className="mt-5 block text-sm font-bold">
          Signer Full Name
          <input
            required
            value={signatureName}
            onChange={(e) => setSignatureName(e.target.value)}
            className="field mt-2"
            placeholder="e.g. Jane Doe"
          />
        </label>

        <div className="mt-4 text-xs text-ink/55">
          Signing as <span className="font-semibold">{user?.role}</span> ({user?.email}). This action is final and legally binding within DocuFlow.
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-ink/15 px-4 py-3 text-sm font-bold hover:bg-sand"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-moss px-5 py-3 text-sm font-bold text-white hover:bg-ink disabled:opacity-50"
          >
            <PenLine size={16} />
            {busy ? 'Signing & Generating PDF...' : 'Sign & Generate PDF'}
          </button>
        </div>
      </form>
    </div>
  )
}
