import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
  session: Session | null
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ session: null, isAdmin: false, loading: true })

async function fetchIsAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_admin')
    if (error) return false
    return data === true
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial load: resolve session and admin status before unblocking routes.
    supabase.auth.getSession().then(async ({ data }) => {
      const sess = data.session
      setSession(sess)
      if (sess) setIsAdmin(await fetchIsAdmin())
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, sess) => {
      if (event === 'SIGNED_IN') {
        // Hold the gate while we verify admin status for the new session.
        setLoading(true)
        setSession(sess)
        setIsAdmin(await fetchIsAdmin())
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
        setIsAdmin(false)
      }
      // TOKEN_REFRESHED and other events do not change admin status.
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
