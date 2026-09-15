'use client'
// components/layout/Sidebar.tsx
// Desktop sidebar — fixed, collapsible to icon-only mode

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Target,
  Wallet,
  PieChart,
  History,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/',               icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/movimientos',    icon: ArrowLeftRight,  label: 'Movimientos' },
  { href: '/ingresos',       icon: TrendingUp,      label: 'Ingresos' },
  { href: '/gastos',         icon: TrendingDown,    label: 'Gastos' },
  { href: '/transferencias', icon: Wallet,          label: 'Transferencias' },
  { href: '/presupuestos',   icon: PieChart,        label: 'Presupuestos' },
  { href: '/ahorros',        icon: Target,          label: 'Ahorros' },
  { href: '/cuentas',        icon: Wallet,          label: 'Cuentas' },
  { href: '/recurrentes',    icon: RefreshCw,       label: 'Recurrentes' },
  { href: '/reportes',       icon: PieChart,        label: 'Reportes' },
  { href: '/historial',      icon: History,         label: 'Historial' },
  { href: '/configuracion',  icon: Settings,        label: 'Configuración' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const { theme, setTheme } = useTheme()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={cn('sidebar desktop-only transition-all duration-200', collapsed && 'collapsed')}
      aria-label="Navegación principal"
    >
      {/* Header */}
      <div
        className="flex items-center px-4 py-4 mb-2"
        style={{ borderBottom: '1px solid var(--border)', minHeight: '64px' }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <TrendingUp size={16} color="white" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm truncate" style={{ color: 'var(--foreground)' }}>
              Finanzas
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="btn btn-ghost ml-auto flex-shrink-0"
          style={{ minHeight: '32px', width: '32px', padding: 0 }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="flex flex-col gap-0.5" role="list">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  title={collapsed ? label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'text-accent bg-accent-light font-semibold'
                      : 'hover:bg-surface-subtle'
                  )}
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--foreground-muted)',
                    background: isActive ? 'var(--accent-light)' : undefined,
                    minHeight: '44px',
                  }}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer: theme toggle + logout */}
      <div className="px-2 pb-4" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Cambiar tema"
          className="btn btn-ghost w-full justify-start gap-3 text-sm"
          style={{ minHeight: '44px', color: 'var(--foreground-muted)' }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && (theme === 'dark' ? 'Modo claro' : 'Modo oscuro')}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-ghost w-full justify-start gap-3 text-sm mt-0.5"
          style={{ minHeight: '44px', color: 'var(--foreground-muted)' }}
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} />
          {!collapsed && 'Cerrar sesión'}
        </button>
      </div>
    </aside>
  )
}
