import { createContext } from 'react'
import type { Role } from '../../types'

export interface AuthUser {
  id: string
  correo: string
  nombreCompleto: string
  rol: string
  idSucursal: string | null
}

export interface AuthContextValue {
  role: Role | null
  user: AuthUser | null
  token: string | null
  login: (session: { token: string; expiraEn: string; usuario: AuthUser }) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
