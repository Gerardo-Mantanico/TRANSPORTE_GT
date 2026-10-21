import type { RolBackend } from '../../api/types'
import type { Role } from '../../types'

const ROL_TO_ROLE: Record<string, Role> = {
  ADMIN_SISTEMA: 'Administrador del sistema',
  ADMIN_SUCURSAL: 'Administrador de sucursal',
  CLIENTE: 'Cliente',
}

export function roleFromRolBackend(rol: RolBackend | string): Role | null {
  return ROL_TO_ROLE[rol] ?? null
}

export function rolBackendFromRole(role: Role): RolBackend {
  switch (role) {
    case 'Administrador del sistema':
      return 'ADMIN_SISTEMA'
    case 'Cliente':
      return 'CLIENTE'
    default:
      return 'ADMIN_SUCURSAL'
  }
}

export function initialsOf(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}
