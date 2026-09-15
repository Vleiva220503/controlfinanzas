'use client'
// components/layout/MobileDrawer.tsx
// Drawer lateral para opciones secundarias en móvil

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import {
  X,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  RefreshCw,
  History,
  Settings,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'

const drawerNav = [
  { href: '/ingresos',       icon: TrendingUp,  label: 'Ingresos' },
  { href: '/gastos',         icon: TrendingDown, label: 'Gastos' },
  { href: '/transferencias', icon: Wallet,       label: 'Transferencias' },
  { href: '/presupuestos',   icon: Wallet,       label: 'Presupuestos' },
  { href: '/ahorros',        icon: Target,       label: 'Ahorros' },
  { href: '/cuentas',        icon: Wallet,       label: 'Cuentas' },
  { href: '/recurrentes',    icon: RefreshCw,    label: 'Recurrentes' },
  { href: '/historial',      icon: History,      label: 'Historial' },
  { href: '/configuracion',  icon: Settings,     label: 'Configuración' },
]

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  // Close drawer on route change
  useEffect(() => {
    onClose()
  }, [pathname]) // eslint-disable-line

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    onClose()
    router.push('/login')
    router.refresh()
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="mobile-only"
        aria-hidden
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="mobile-only"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          animation: 'slideInLeft 0.22s ease',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <TrendingUp size={14} color="white" />
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
              Finanzas
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="btn btn-ghost"
            style={{ minHeight: '36px', width: '36px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3">
          <ul className="flex flex-col gap-0.5" role="list">
            {drawerNav.map(({ href, icon: Icon, label }) => {
              const isActive = pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium"
                    style={{
                      color: isActive ? 'var(--accent)' : 'var(--foreground-muted)',
                      background: isActive ? 'var(--accent-light)' : 'transparent',
                      textDecoration: 'none',
                      minHeight: '44px',
                    }}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span>{label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-2 pb-6" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-ghost w-full justify-start gap-3 text-sm"
            style={{ minHeight: '44px', color: 'var(--foreground-muted)' }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-ghost w-full justify-start gap-3 text-sm mt-0.5"
            style={{ minHeight: '44px', color: 'var(--foreground-muted)' }}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  )
}
