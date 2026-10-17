import type { Rol } from '../types/identityTypes'

const PAGINA_INICIAL: Record<Rol, string> = {
  ADMIN_SISTEMA: '/resumen',
  ADMIN_SUCURSAL: '/resumen',
  CAJERO: '/venta',
  CHOFER: '/viajes',
  CLIENTE: '/explorar',
}

export function defaultPageFor(rol: Rol): string {
  return PAGINA_INICIAL[rol]
}
