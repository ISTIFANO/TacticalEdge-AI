import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { usePassport } from '../../context/PassportContext'

export function NotificationsBell() {
  const { notifications, unreadCount, markNotificationRead } = usePassport()
  const [open, setOpen] = useState(false)

  const iconFor = (type: string) => {
    switch (type) {
      case 'match': return '⚽'
      case 'hotel': return '🏨'
      case 'flight': return '✈️'
      case 'achievement': return '🏅'
      default: return '🎁'
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-lg border border-[var(--wc-border)] p-2 transition hover:border-[var(--wc-gold)]"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="passport-notif-pulse absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute end-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[var(--wc-border)] bg-[var(--wc-card)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--wc-border)] px-4 py-3">
              <p className="font-semibold">Notifications</p>
              <button type="button" onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-[var(--wc-muted)]">No notifications</li>
              ) : (
                notifications.slice(0, 12).map((n) => (
                  <li
                    key={n.id}
                    className={`border-b border-[var(--wc-border)] px-4 py-3 text-sm ${!n.read ? 'bg-[var(--wc-gold)]/5' : ''}`}
                    onClick={() => markNotificationRead(n.id)}
                  >
                    <div className="flex gap-3">
                      <span className="text-lg">{iconFor(n.type)}</span>
                      <div>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-xs text-[var(--wc-muted)]">{n.message}</p>
                        <p className="mt-1 text-[10px] text-[var(--wc-muted)]">{n.date}</p>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
