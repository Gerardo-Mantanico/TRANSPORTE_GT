import { useMemo, useState, type ReactNode } from 'react'
import type { Role } from '../../types'
import { AuthContext, type AuthContextValue } from './auth.context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)

  const value = useMemo<AuthContextValue>(
    () => ({
      role,
      login: (nextRole) => setRole(nextRole),
      logout: () => setRole(null),
      switchRole: (nextRole) => setRole(nextRole),
    }),
    [role],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
