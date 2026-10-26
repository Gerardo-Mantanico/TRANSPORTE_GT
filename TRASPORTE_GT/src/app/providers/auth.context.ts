import { createContext } from 'react'
import type { LoginRequest, Rol, Usuario } from '../../types/identityTypes'

export type EstadoSesion = 'cargando' | 'autenticado' | 'anonimo'

export interface AuthContextValue {
  usuario: Usuario | null
  estado: EstadoSesion
  /** Guarda el token y carga el usuario con `/auth/yo`. Lanza `ApiError` si falla. */
  login: (credenciales: LoginRequest) => Promise<Usuario>
  logout: () => void
  /** Sincroniza el perfil con Identidad o con la respuesta de una edición. */
  refrescarUsuario: (actualizado?: Usuario) => Promise<void>
  tieneRol: (...roles: Rol[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
