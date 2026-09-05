import { Bell, CheckCheck } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import api from '../services/api'

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef()

  const load = () => {
    Promise.all([
      api.get('/notifications'),
      api.get('/notifications/unread-count')
    ]).then(([nRes, cRes]) => {
      setNotifications(nRes.data)
      setUnreadCount(cRes.data.count)
    }).catch(() => {})
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000) // poll every 15s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAsRead = (id) => {
    api.patch(`/notifications/${id}/read`).then(load).catch(() => {})
  }

  const markAllAsRead = () => {
    api.patch('/notifications/read-all').then(load).catch(() => {})
  }

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => { setOpen(!open); if (!open) load(); }}
        className="relative grid h-10 w-10 place-items-center rounded-full bg-sand text-ink/70 hover:bg-ink/10 transition"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] font-extrabold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-ink/10 bg-white shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink/10 bg-sand/50 px-4 py-3">
            <h3 className="text-sm font-extrabold">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="flex items-center gap-1 text-xs font-bold text-moss hover:underline">
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-ink/10">
            {notifications.length ? notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => { if (!n.isRead) markAsRead(n.id); }}
                className={`p-4 transition cursor-pointer ${n.isRead ? 'bg-white hover:bg-sand/30' : 'bg-mint/20 hover:bg-mint/40'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-extrabold text-ink">{n.title}</p>
                  <span className="text-[10px] text-ink/40 whitespace-nowrap">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="mt-1 text-xs text-ink/75">{n.message}</p>
              </div>
            )) : (
              <p className="p-8 text-center text-xs text-ink/50">No notifications yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
