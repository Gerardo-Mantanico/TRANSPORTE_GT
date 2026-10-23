import { useMemo, useState, type ReactNode } from 'react'
import { clearSession, getSession, saveSession } from '../../api/client'
import type { AuthContextValue, AuthUser } from './auth.context'
import { AuthContext } from './auth.context'
import { roleFromRolBackend } from './roles'

function initialSession() {
  const session = getSession()
  if (!session) return { role: null, user: null, token: null }
  return {
    role: roleFromRolBackend(session.usuario.rol),
    user: session.usuario,
    token: session.token,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = initialSession()
  const [role, setRole] = useState(initial.role)
  const [user, setUser] = useState<AuthUser | null>(initial.user)
  const [token, setToken] = useState<string | null>(initial.token)

  const value = useMemo<AuthContextValue>(
    () => ({
      role,
      user,
      token,
      // Compatibilidad con el contrato antiguo
      usuario: null,
      estado: role ? 'autenticado' : 'anonimo',
      refrescarUsuario: async () => undefined,
      tieneRol: () => false,
      login: (session) => {
        saveSession(session)
        setRole(roleFromRolBackend(session.usuario.rol))
        setUser(session.usuario)
        setToken(session.token)
        return Promise.resolve(null as never)
      },
      logout: () => {
        clearSession()
        setRole(null)
        setUser(null)
        setToken(null)
      },
    }),
    [role, user, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
