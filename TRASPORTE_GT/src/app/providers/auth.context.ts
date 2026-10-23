import { createContext } from 'react'
import type { LoginRequest, Rol, Usuario } from '../../types/identityTypes'

export type EstadoSesion = 'cargando' | 'autenticado' | 'anonimo'

export interface AuthUser {
  id: string
  correo: string
  nombreCompleto: string
  rol: string
  idSucursal: string | null
}

export interface AuthContextValue {
  usuario: Usuario | null
  estado: EstadoSesion
  /** Guarda el token y carga el usuario con `/auth/yo`. Lanza `ApiError` si falla. */
  login: (credenciales: LoginRequest) => Promise<Usuario>
  logout: () => void
  refrescarUsuario: () => Promise<void>
  tieneRol: (...roles: Rol[]) => boolean
  role: Role | null
  user: AuthUser | null
  token: string | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
