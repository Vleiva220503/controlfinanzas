'use client'
// components/layout/Header.tsx
// Sticky header — title + month selector + optional actions

import { usePathname } from 'next/navigation'
import { MonthSelector } from './MonthSelector'

const pageTitles: Record<string, string> = {
  '/':               'Dashboard',
  '/movimientos':    'Movimientos',
  '/ingresos':       'Ingresos',
  '/gastos':         'Gastos',
  '/transferencias': 'Transferencias',
  '/presupuestos':   'Presupuestos',
  '/ahorros':        'Ahorros',
  '/cuentas':        'Cuentas',
  '/recurrentes':    'Recurrentes',
  '/reportes':       'Reportes',
  '/historial':      'Historial',
  '/configuracion':  'Configuración',
}

// Pages where the month selector is relevant
const monthSelectorPages = new Set(['/', '/movimientos', '/ingresos', '/gastos', '/presupuestos', '/reportes', '/historial'])

export function Header() {
  const pathname = usePathname()

  const title = Object.entries(pageTitles).find(([key]) =>
    key === '/' ? pathname === '/' : pathname.startsWith(key)
  )?.[1] ?? 'Finanzas'

  const showMonthSelector = Array.from(monthSelectorPages).some(p =>
    p === '/' ? pathname === '/' : pathname.startsWith(p)
  )

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 md:px-6"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        height: '60px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Page title */}
      <h1 className="font-semibold text-base md:text-lg truncate" style={{ color: 'var(--foreground)' }}>
        {title}
      </h1>

      {/* Month selector — shown on relevant pages */}
      {showMonthSelector && (
        <div className="flex-shrink-0">
          <MonthSelector compact />
        </div>
      )}
    </header>
  )
}
