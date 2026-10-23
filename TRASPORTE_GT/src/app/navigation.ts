import type { NavGroup } from '../types'
import type { Rol } from '../types/identityTypes'

/** Todo usuario es cliente: cualquier rol puede comprar, alquilar y usar su cartera. */
const MI_CUENTA: NavGroup = {
  label: 'Mi cuenta',
  items: [
    { id: 'explorar', label: 'Explorar viajes', icon: 'search' },
    { id: 'solicitar', label: 'Solicitar alquiler', icon: 'route' },
    { id: 'historial', label: 'Mi historial', icon: 'ticket' },
    { id: 'cartera', label: 'Cartera digital', icon: 'wallet' },
  ],
}

export const NAV_BY_ROLE: Record<Rol, NavGroup[]> = {
  CLIENTE: [
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
  ADMIN_SUCURSAL: [
    {
      label: 'Operación',
      items: [
        { id: 'resumen', label: 'Resumen', icon: 'home' },
        { id: 'viajes', label: 'Viajes', icon: 'route' },
        { id: 'venta', label: 'Venta de boletos', icon: 'ticket' },
        { id: 'boletos-vendidos', label: 'Boletos vendidos', icon: 'ticket' },
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
    {
      label: 'Personal',
      items: [{ id: 'usuarios', label: 'Usuarios', icon: 'users' }],
    },
    MI_CUENTA,
  ],
  ADMIN_SISTEMA: [
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
      label: 'Flota',
      items: [
        { id: 'buses', label: 'Buses', icon: 'bus' },
        { id: 'choferes', label: 'Choferes', icon: 'users' },
        { id: 'viajes', label: 'Viajes', icon: 'route' },
      ],
    },
    {
      label: 'Inteligencia',
      items: [{ id: 'reportes-sistema', label: 'Reportes globales', icon: 'chart' }],
    },
    MI_CUENTA,
  ],
  CAJERO: [
    {
      label: 'Operación',
      items: [
        { id: 'venta', label: 'Venta de boletos', icon: 'ticket' },
        { id: 'boletos-vendidos', label: 'Boletos vendidos', icon: 'ticket' },
        { id: 'viajes', label: 'Viajes', icon: 'route' },
      ],
    },
    MI_CUENTA,
  ],
  CHOFER: [
    {
      label: 'Operación',
      items: [{ id: 'viajes', label: 'Viajes', icon: 'route' }],
    },
    MI_CUENTA,
  ],
}
