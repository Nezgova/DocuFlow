import { User, Shield, Building2, Phone, Briefcase, Mail, Calendar, Key, CheckCircle2, Clock, FileText, Edit3, Save, X, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [avatar, setAvatar] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const loadProfile = () => {
    setLoading(true)
    api.get('/auth/profile')
      .then(res => {
        setProfileData(res.data)
        const u = res.data.user
        setFullName(u.fullName || '')
        setPhone(u.phone || '')
        setJobTitle(u.jobTitle || '')
        setAvatar(u.avatar || '')
      })
      .catch(() => setError('Failed to load user profile'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProfile() }, [])

  const handleUpdate = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    api.put('/auth/profile', {
      fullName,
      phone,
      jobTitle,
      avatar,
      currentPassword: currentPassword || null,
      newPassword: newPassword || null
    })
      .then(res => {
        setSuccess('Profile updated successfully')
        setIsEditing(false)
        setCurrentPassword('')
        setNewPassword('')
        loadProfile()
        if (setUser) {
          api.get('/auth/me').then(r => setUser(r.data))
        }
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to update profile'))
  }

  if (loading) {
    return <div className="grid h-96 place-items-center text-sm font-bold text-ink/60">Loading profile...</div>
  }

  const u = profileData?.user || user

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">Account Settings</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">My Profile</h1>
          <p className="mt-1 text-sm text-ink/60">Manage your account information, security settings, and activity overview.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-moss px-4 py-2.5 text-sm font-bold text-white hover:bg-ink"
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        )}
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="mt-4 rounded-xl bg-mint/40 px-4 py-3 text-sm text-moss font-bold">{success}</p>}

      {isEditing ? (
        <form onSubmit={handleUpdate} className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-ink/10 pb-4">
            <h2 className="text-lg font-extrabold">Edit Profile Information</h2>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="rounded-lg p-1.5 text-ink/60 hover:bg-sand"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Full Name</label>
              <input 
                className="field mt-1.5 w-full" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Email Address (Read-only)</label>
              <input 
                className="field mt-1.5 w-full bg-sand/50 text-ink/60 cursor-not-allowed" 
                value={u?.email || ''} 
                disabled 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Phone Number</label>
              <input 
                className="field mt-1.5 w-full" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="e.g. +1 (555) 019-2834" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Job Title</label>
              <input 
                className="field mt-1.5 w-full" 
                value={jobTitle} 
                onChange={e => setJobTitle(e.target.value)} 
                placeholder="e.g. Senior Financial Analyst" 
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Avatar Image URL (Optional)</label>
              <input 
                className="field mt-1.5 w-full" 
                value={avatar} 
                onChange={e => setAvatar(e.target.value)} 
                placeholder="https://example.com/avatar.jpg" 
              />
            </div>
          </div>

          <div className="mt-8 border-t border-ink/10 pt-6">
            <h3 className="text-md font-bold text-ink">Change Password (Optional)</h3>
            <p className="text-xs text-ink/60 mt-0.5">Leave blank if you do not wish to change your password.</p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Current Password</label>
                <input 
                  type="password"
                  className="field mt-1.5 w-full" 
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)} 
                  placeholder="••••••••" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">New Password (Min 8 chars)</label>
                <input 
                  type="password"
                  className="field mt-1.5 w-full" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="••••••••" 
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-moss px-6 py-3 text-sm font-bold text-white hover:bg-ink">
              <Save size={16} /> Save Changes
            </button>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="rounded-xl border border-ink/15 bg-white px-6 py-3 text-sm font-bold hover:bg-sand"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* User Info Card */}
          <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm lg:col-span-1">
            <div className="flex flex-col items-center text-center">
              {u?.avatar ? (
                <img src={u.avatar} alt={u.fullName} className="h-24 w-24 rounded-full object-cover shadow-md" />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-full bg-moss text-3xl font-bold text-white shadow-md">
                  {u?.fullName?.[0]}
                </div>
              )}
              <h2 className="mt-4 text-xl font-extrabold">{u?.fullName}</h2>
              <p className="text-xs font-medium text-ink/60">{u?.jobTitle || 'Team Member'}</p>
              <span className="mt-3 rounded-full bg-mint px-3 py-1 text-xs font-bold text-moss uppercase tracking-wider">
                {u?.role}
              </span>
            </div>

            <div className="mt-6 space-y-4 border-t border-ink/10 pt-6 text-sm">
              <div className="flex items-center gap-3 text-ink/80">
                <Mail size={17} className="text-moss" />
                <span className="truncate">{u?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-ink/80">
                <Phone size={17} className="text-moss" />
                <span>{u?.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-ink/80">
                <Building2 size={17} className="text-moss" />
                <span>{u?.departmentName || 'No department assigned'}</span>
              </div>
              <div className="flex items-center gap-3 text-ink/80">
                <Calendar size={17} className="text-moss" />
                <span>Joined {u?.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recently'}</span>
              </div>
            </div>
          </div>

          {/* Stats & Recent Activity */}
          <div className="space-y-6 lg:col-span-2">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink/60">Uploaded</span>
                  <FileText size={18} className="text-moss" />
                </div>
                <p className="mt-3 text-3xl font-extrabold">{profileData?.uploadedDocumentsCount || 0}</p>
                <p className="mt-1 text-xs text-ink/50">Documents owned</p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink/60">Approved</span>
                  <CheckCircle2 size={18} className="text-moss" />
                </div>
                <p className="mt-3 text-3xl font-extrabold">{profileData?.approvedDocumentsCount || 0}</p>
                <p className="mt-1 text-xs text-ink/50">Signatures signed</p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink/60">Pending</span>
                  <Clock size={18} className="text-amber-600" />
                </div>
                <p className="mt-3 text-3xl font-extrabold">{profileData?.pendingApprovalsCount || 0}</p>
                <p className="mt-1 text-xs text-ink/50">Awaiting your decision</p>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-ink/10 pb-4">
                <Activity size={20} className="text-moss" />
                <h3 className="text-lg font-extrabold">Recent Activity Timeline</h3>
              </div>

              <div className="mt-4 divide-y divide-ink/10">
                {profileData?.recentActivity?.map((act, i) => (
                  <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-sand px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-ink/70">
                          {act.action}
                        </span>
                        {act.documentId ? (
                          <Link to={`/documents/${act.documentId}`} className="text-sm font-bold text-moss hover:underline">
                            {act.documentTitle}
                          </Link>
                        ) : (
                          <span className="text-sm font-bold">{act.documentTitle}</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-ink/65">{act.detail || 'No additional details.'}</p>
                    </div>
                    <span className="text-xs font-mono text-ink/50 whitespace-nowrap">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}

                {!profileData?.recentActivity?.length && (
                  <p className="py-8 text-center text-sm text-ink/55">No recent activity recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
