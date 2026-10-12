import type { NavGroup, Role } from '../types'

export const NAV_BY_ROLE: Record<Role, NavGroup[]> = {
  Cliente: [
    {
      label: 'Mi viaje',
      items: [
        { id: 'explorar', label: 'Explorar viajes', icon: 'search' },
        { id: 'solicitar', label: 'Solicitar alquiler', icon: 'route' },
        { id: 'historial', label: 'Mi historial', icon: 'ticket' },
      ],
    },
    {
      label: 'Finanzas',
      items: [{ id: 'cartera', label: 'Cartera digital', icon: 'wallet' }],
    },
  ],
  'Administrador de sucursal': [
    {
      label: 'Operación',
      items: [
        { id: 'resumen', label: 'Resumen', icon: 'home' },
        { id: 'viajes', label: 'Viajes', icon: 'route' },
        { id: 'venta', label: 'Venta de boletos', icon: 'ticket' },
        { id: 'alquileres', label: 'Alquileres', icon: 'calendar' },
      ],
    },
    {
      label: 'Flota',
      items: [
        { id: 'buses', label: 'Buses', icon: 'bus' },
        { id: 'choferes', label: 'Choferes', icon: 'users' },
        { id: 'rutas', label: 'Rutas', icon: 'route' },
      ],
    },
    {
      label: 'Control',
      items: [
        { id: 'taller', label: 'Taller y repuestos', icon: 'wrench' },
        { id: 'categorias', label: 'Categorías', icon: 'grid' },
        { id: 'reportes', label: 'Reportes', icon: 'chart' },
      ],
    },
  ],
  'Administrador del sistema': [
    {
      label: 'Administración',
      items: [
        { id: 'resumen', label: 'Resumen', icon: 'home' },
        { id: 'sucursales', label: 'Sucursales', icon: 'grid' },
        { id: 'usuarios', label: 'Usuarios', icon: 'users' },
        { id: 'configuracion', label: 'Configuración', icon: 'settings' },
      ],
    },
    {
      label: 'Inteligencia',
      items: [        { id: 'reportes-sistema', label: 'Reportes globales', icon: 'chart' }],
    },
  ],
}

export const ROLE_OPTIONS: Role[] = [
  'Administrador de sucursal',
  'Administrador del sistema',
  'Cliente',
]
