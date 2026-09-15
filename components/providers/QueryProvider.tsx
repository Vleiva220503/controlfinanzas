'use client'
// components/providers/QueryProvider.tsx
// TanStack React Query provider
// The QueryClient is exposed via a module-level singleton so
// Sidebar / Login can call queryClient.clear() on session change,
// preventing cross-user cache contamination.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

// Module-level singleton — allows clearQueryCache() to be called from
// anywhere (Sidebar logout, Login success) without prop-drilling.
let _queryClient: QueryClient | null = null

export function getQueryClient(): QueryClient {
  if (!_queryClient) {
    _queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 2, // 2 minutes
          gcTime: 1000 * 60 * 10,   // 10 minutes
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    })
  }
  return _queryClient
}

/** Call this on logout or before login to nuke every cached query. */
export function clearQueryCache() {
  _queryClient?.clear()
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState so the same instance is reused across re-renders
  const [queryClient] = useState(() => getQueryClient())

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
