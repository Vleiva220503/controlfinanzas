// app/(dashboard)/layout.tsx
// Server Component layout for all authenticated dashboard pages
// Client components (BottomNav, FAB) are isolated in DashboardClient

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MonthProvider } from '@/components/providers/MonthProvider'
import { DashboardClient } from '@/components/layout/DashboardClient'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MonthProvider>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content area — offset from sidebar on desktop */}
        <div className="content-area">
          {/* Sticky header */}
          <Header />

          {/* Page content */}
          <main className="px-4 md:px-6 py-5">
            {children}
          </main>
        </div>

        {/* Mobile: FAB + BottomNav (client components with state) */}
        <DashboardClient />
      </div>
    </MonthProvider>
  )
}
