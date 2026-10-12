import { createContext } from 'react'
import type { Role } from '../../types'

export interface AuthContextValue {
  role: Role | null
  login: (role: Role) => void
  logout: () => void
  switchRole: (role: Role) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
