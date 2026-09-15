'use client'
// components/layout/DashboardClient.tsx
// Client-side shell for the dashboard: wraps BottomNav + FAB with shared state

import { BottomNav } from './BottomNav'
import { FABWrapper } from '@/components/shared/FABWrapper'

export function DashboardClient() {
  return (
    <>
      <FABWrapper />
      <BottomNav />
    </>
  )
}
