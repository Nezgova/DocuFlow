import { Settings as SettingsIcon, Save, CheckCircle2, Image as ImageIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMINISTRATOR'

  const [settings, setSettings] = useState({
    companyName: 'DocuFlow Enterprise',
    maxUploadSizeMb: '25',
    allowedFileTypes: 'pdf,docx,png,jpg',
    systemTheme: 'moss',
    emailNotificationsEnabled: 'true',
    logoUrl: ''
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/settings')
      .then(r => {
        if (r.data) {
          setSettings(prev => ({ ...prev, ...r.data }))
        }
      })
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isAdmin) {
      setError('Only administrators can update system settings.')
      return
    }
    setError('')
    api.put('/settings', settings)
      .then(r => {
        setSettings(r.data)
        if (r.data.logoUrl !== undefined) {
          localStorage.setItem('docuflow_logo_url', r.data.logoUrl)
        }
        if (r.data.companyName) {
          localStorage.setItem('docuflow_company_name', r.data.companyName)
        }
        setSuccess('System settings and website logo updated successfully.')
        setTimeout(() => window.location.reload(), 1500)
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to update system settings.')
      })
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">Administration & branding</p>
          <h1 className="mt-2 text-3xl font-extrabold">System Settings & Logo</h1>
        </div>
      </div>

      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-mint/40 px-4 py-3 text-sm font-bold text-moss">
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl bg-red-100 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-ink/10">
            <SettingsIcon className="text-moss" size={22} />
            <div>
              <h2 className="text-base font-extrabold">General & Branding Configuration</h2>
              <p className="text-xs text-ink/55">Configure global parameters and upload the custom website logo picture.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-2">Company / Organization Name</label>
              <input 
                type="text" 
                name="companyName" 
                className="field w-full" 
                value={settings.companyName} 
                onChange={handleChange} 
                disabled={!isAdmin}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-2">Website Logo Image URL</label>
              <div className="flex items-center gap-3">
                <input 
                  type="url" 
                  name="logoUrl" 
                  className="field w-full" 
                  placeholder="https://example.com/logo.png" 
                  value={settings.logoUrl} 
                  onChange={handleChange} 
                  disabled={!isAdmin}
                />
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sand border border-ink/15 overflow-hidden">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo Preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon size={18} className="text-ink/40" />
                  )}
                </div>
              </div>
              <p className="mt-1 text-[11px] text-ink/45">Provide an image URL (PNG, JPG, SVG) for your custom website logo.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-2">Max Upload Size (MB)</label>
              <input 
                type="number" 
                name="maxUploadSizeMb" 
                className="field w-full" 
                value={settings.maxUploadSizeMb} 
                onChange={handleChange} 
                disabled={!isAdmin}
                min="1"
                max="500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-2">Allowed File Extensions</label>
              <input 
                type="text" 
                name="allowedFileTypes" 
                className="field w-full" 
                value={settings.allowedFileTypes} 
                onChange={handleChange} 
                disabled={!isAdmin}
                required
              />
              <p className="mt-1 text-[11px] text-ink/45">Comma-separated (e.g. pdf,docx,png,jpg)</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-2">System Theme Accent</label>
              <select 
                name="systemTheme" 
                className="field w-full" 
                value={settings.systemTheme} 
                onChange={handleChange}
                disabled={!isAdmin}
              >
                <option value="moss">Moss Green (Default)</option>
                <option value="emerald">Emerald Professional</option>
                <option value="slate">Slate Minimal</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-ink/10 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-ink">Automated Email Notifications</p>
              <p className="text-xs text-ink/55">Send automated alerts upon document submission, review, or signature requests.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="emailNotificationsEnabled" 
                checked={settings.emailNotificationsEnabled === 'true'} 
                onChange={handleChange}
                disabled={!isAdmin}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-ink/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-moss"></div>
            </label>
          </div>
        </div>

        {isAdmin && (
          <div className="flex justify-end">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save size={16} /> Save Settings & Logo
            </button>
          </div>
        )}
      </form>
    </>
  )
}
