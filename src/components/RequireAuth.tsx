import { Redirect } from 'wouter'
import { useAuth } from '@/context/AuthContext'
import type { ReactNode } from 'react'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading } = useAuth()

  if (loading) return null
  if (!session || !isAdmin) return <Redirect to="/admin/login" />

  return <>{children}</>
}
