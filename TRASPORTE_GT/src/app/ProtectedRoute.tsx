import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Cargando } from '../components/ui/Estado'
import type { Rol } from '../types/identityTypes'
import { defaultPageFor } from './navigationPaths'
import { useAuth } from './providers/useAuth'

interface ProtectedRouteProps {
  /** Roles permitidos; si se omite basta con tener sesión. */
  roles?: Rol[]
  children?: ReactNode
}

export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { estado, usuario } = useAuth()
  const location = useLocation()

  if (estado === 'cargando') return <Cargando texto="Verificando su sesión..." pantalla />
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to={defaultPageFor(usuario.rol)} replace />

  return children ?? <Outlet />
}
