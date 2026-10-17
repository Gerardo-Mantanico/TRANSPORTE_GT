export const ROLES = ['ADMIN_SISTEMA', 'ADMIN_SUCURSAL', 'CAJERO', 'CHOFER', 'CLIENTE'] as const

export type Rol = (typeof ROLES)[number]

export const ETIQUETAS_ROL: Record<Rol, string> = {
  ADMIN_SISTEMA: 'Administrador del sistema',
  ADMIN_SUCURSAL: 'Administrador de sucursal',
  CAJERO: 'Cajero',
  CHOFER: 'Chofer',
  CLIENTE: 'Cliente',
}
