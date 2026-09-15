import { FileUp, X, History } from 'lucide-react'
import { useState } from 'react'
import api from '../services/api'

export default function UploadNewVersionDialog({ document, onClose, onUploaded }) {
  const [file, setFile] = useState(null)
  const [changeNotes, setChangeNotes] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const currentVersion = document.currentVersion || 1
  const nextVersion = currentVersion + 1

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (!file) return setError('Please choose a replacement PDF file.')

    setBusy(true)
    try {
      const body = new FormData()
      body.append('file', file)
      if (changeNotes.trim()) {
        body.append('changeNotes', changeNotes.trim())
      }
      await api.post(`/documents/${document.id}/versions`, body)
      onUploaded()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload new version.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4" role="dialog" aria-modal="true" aria-labelledby="version-upload-title">
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.14em] text-moss flex items-center gap-1.5">
              <History size={13} />
              Version Control
            </p>
            <h2 id="version-upload-title" className="mt-1 text-xl font-extrabold">Upload New Version</h2>
            <p className="mt-0.5 text-xs text-ink/60">
              Upgrading from <span className="font-bold text-moss">v{currentVersion}</span> to <span className="font-bold text-moss">v{nextVersion}</span> for "{document.title}"
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1 text-ink/50 hover:bg-sand">
            <X />
          </button>
        </div>

        <label className="mt-5 block text-sm font-bold">
          New PDF document
          <input
            required
            accept="application/pdf"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="field mt-2 cursor-pointer"
          />
        </label>

        <label className="mt-4 block text-sm font-bold">
          Change notes / Summary of revisions
          <textarea
            rows="3"
            maxLength="1000"
            value={changeNotes}
            onChange={(event) => setChangeNotes(event.target.value)}
            className="field mt-2 w-full resize-none"
            placeholder="e.g. Revised legal clauses in section 3, updated pricing figures..."
          />
        </label>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink/75 hover:bg-sand"
          >
            Cancel
          </button>
          <button
            disabled={busy}
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-moss px-5 py-2.5 text-sm font-bold text-white hover:bg-ink disabled:opacity-60"
          >
            <FileUp size={16} />
            {busy ? 'Uploading…' : `Upload Version v${nextVersion}`}
          </button>
        </div>
      </form>
    </div>
  )
}

