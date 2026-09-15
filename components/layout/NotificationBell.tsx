'use client'
import { useState, useRef, useEffect } from 'react'
import { Bell, Check, Trash2 } from 'lucide-react'
import { useNotifications, useMarkNotificationRead, useDeleteNotification } from '@/hooks/useNotifications'
import { format } from 'date-fns'

export function NotificationBell() {
  const { data: notifications = [] } = useNotifications()
  const markRead = useMarkNotificationRead()
  const deleteNotif = useDeleteNotification()

  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-surface-subtle transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={20} style={{ color: 'var(--foreground-muted)' }} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-negative rounded-full" />
        )}
      </button>

      {open && (
        <div 
          className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-surface shadow-modal overflow-hidden slide-up z-50"
        >
          <div className="p-3 border-b border-border flex justify-between items-center bg-surface-subtle">
            <h3 className="font-semibold text-sm">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-foreground-muted">{unreadCount} nuevas</span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-foreground-muted">
                No tienes notificaciones
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {notifications.map(n => (
                  <div key={n.id} className={`p-3 hover:bg-surface-subtle transition-colors flex gap-3 ${!n.is_read ? 'bg-accent/5' : ''}`}>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{n.title}</h4>
                      <p className="text-xs text-foreground-muted">{n.message}</p>
                      <span className="text-[10px] text-foreground-subtle mt-2 block">
                        {format(new Date(n.created_at), 'dd/MM/yy HH:mm')}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!n.is_read && (
                        <button 
                          onClick={() => markRead.mutate(n.id)}
                          className="p-1 rounded hover:bg-accent-light text-accent transition-colors"
                          title="Marcar como leída"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotif.mutate(n.id)}
                        className="p-1 rounded hover:bg-negative-light text-negative transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
