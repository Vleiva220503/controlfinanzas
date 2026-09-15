'use client'
// components/layout/BottomNav.tsx
// Mobile bottom navigation bar — 5 main items + central FAB slot
// No longer takes onFabClick prop — FAB is independent component

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, PieChart, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { MobileDrawer } from '@/components/layout/MobileDrawer'

const mainNav = [
  { href: '/',            icon: LayoutDashboard, label: 'Inicio' },
  { href: '/movimientos', icon: ArrowLeftRight,  label: 'Movimientos' },
  // Center slot is FAB placeholder
  { href: '/reportes',    icon: PieChart,        label: 'Reportes' },
]

export function BottomNav() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <nav className="bottom-nav mobile-only" aria-label="Navegación principal">
        <div className="flex items-stretch w-full">

          {/* Item 1: Dashboard */}
          <NavItem
            href={mainNav[0].href}
            icon={mainNav[0].icon}
            label={mainNav[0].label}
            isActive={pathname === mainNav[0].href}
          />

          {/* Item 2: Movimientos */}
          <NavItem
            href={mainNav[1].href}
            icon={mainNav[1].icon}
            label={mainNav[1].label}
            isActive={pathname.startsWith(mainNav[1].href) && pathname !== '/'}
          />

          {/* Center: FAB placeholder (empty space — FAB is positioned absolutely) */}
          <div className="flex-1" aria-hidden />

          {/* Item 3: Reportes */}
          <NavItem
            href={mainNav[2].href}
            icon={mainNav[2].icon}
            label={mainNav[2].label}
            isActive={pathname.startsWith(mainNav[2].href)}
          />

          {/* Item 4: Más (opens drawer) */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Más opciones"
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
            style={{ color: 'var(--foreground-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <MoreHorizontal size={22} />
            <span style={{ fontSize: '10px', fontWeight: 500 }}>Más</span>
          </button>
        </div>
      </nav>

      {/* Mobile drawer for secondary nav items */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}

function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string
  icon: React.ElementType
  label: string
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center justify-center gap-1 py-2 no-underline"
      style={{ color: isActive ? 'var(--accent)' : 'var(--foreground-muted)', textDecoration: 'none' }}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
      <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 500 }}>{label}</span>
    </Link>
  )
}
