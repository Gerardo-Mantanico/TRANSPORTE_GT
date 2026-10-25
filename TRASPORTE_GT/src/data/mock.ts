import type { BadgeTone } from '../types'

export { TODAY } from '../types'

export interface TodayTrip {
  route: string
  time: string
  bus: string
  driver: string
  state: string
  type: 'Regular' | 'Alquiler privado'
  tone: BadgeTone
}

export const TODAY_TRIPS: TodayTrip[] = [
  {
    route: 'Guatemala → Antigua',
    time: '07:30',
    bus: 'P-482KLM',
    driver: 'Carlos Méndez',
    state: 'En tránsito',
    type: 'Regular',
    tone: 'info',
  },
  {
    route: 'Guatemala → Quetzaltenango',
    time: '09:15',
    bus: 'P-193JHF',
    driver: 'Mario Chacón',
    state: 'Programado',
    type: 'Regular',
    tone: 'warning',
  },
  {
    route: 'Guatemala → Escuintla',
    time: '11:00',
    bus: 'P-728DBN',
    driver: 'Luis Ramírez',
    state: 'Programado',
    type: 'Regular',
    tone: 'warning',
  },
  {
    route: 'Guatemala → Panajachel',
    time: '13:45',
    bus: 'P-541QTR',
    driver: 'Andrea Reyes',
    state: 'Completado',
    type: 'Alquiler privado',
    tone: 'success',
  },
]

export interface ClientTrip {
  origin: string
  destination: string
  departTime: string
  arriveTime: string
  price: string
  seats: string
  bus: string
  capacity: number
}

export const CLIENT_TRIPS: ClientTrip[] = [
  { origin: 'Guatemala', destination: 'Antigua', departTime: '07:30', arriveTime: '08:45', price: 'Q 125', seats: '12', bus: 'P-482KLM', capacity: 45 },
  { origin: 'Guatemala', destination: 'Quetzaltenango', departTime: '09:15', arriveTime: '13:30', price: 'Q 245', seats: '7', bus: 'P-193JHF', capacity: 40 },
  { origin: 'Guatemala', destination: 'Escuintla', departTime: '11:00', arriveTime: '12:20', price: 'Q 95', seats: '24', bus: 'P-728DBN', capacity: 50 },
  { origin: 'Guatemala', destination: 'Panajachel', departTime: '13:45', arriveTime: '17:10', price: 'Q 185', seats: '4', bus: 'P-541QTR', capacity: 46 },
]

export interface RoutePoint {
  x: number
  y: number
  distance: string
  duration: string
}

export const ROUTE_POINTS: Record<string, RoutePoint> = {
  antigua: { x: 480, y: 156, distance: '42 km', duration: '1 h 05 min' },
  quetzaltenango: { x: 155, y: 72, distance: '201 km', duration: '4 h 15 min' },
  escuintla: { x: 405, y: 188, distance: '61 km', duration: '1 h 20 min' },
  panajachel: { x: 255, y: 138, distance: '145 km', duration: '3 h 25 min' },
}

export function resolveRoutePoint(destination: string): RoutePoint {
  const key = Object.keys(ROUTE_POINTS).find((k) =>
    destination.toLocaleLowerCase('es').includes(k),
  )
  return ROUTE_POINTS[key ?? 'antigua']
}

export interface GeoPoint {
  lat: number
  lng: number
}

export const GEO_POINTS: Record<string, GeoPoint> = {
  'Guatemala Centro': { lat: 14.6349, lng: -90.5069 },
  Antigua: { lat: 14.5562, lng: -90.7343 },
  Quetzaltenango: { lat: 14.8333, lng: -91.5167 },
  Escuintla: { lat: 14.6333, lng: -90.7333 },
  Panajachel: { lat: 14.7361, lng: -91.2603 },
  Monterrico: { lat: 13.9167, lng: -90.8167 },
  Atitlán: { lat: 14.7861, lng: -91.2019 },
}

export interface UserRecord {
  name: string
  email: string
  role: string
  branch: string
  lastAccess: string
  active: boolean
}

export const USERS: UserRecord[] = [
  { name: 'Sofía Herrera', email: 'sofia@cnb.gt', role: 'Administrador del sistema', branch: '—', lastAccess: 'Hoy, 08:42', active: true },
  { name: 'Ana Martínez', email: 'ana@cnb.gt', role: 'Administrador de sucursal', branch: 'Guatemala Centro', lastAccess: 'Hoy, 07:55', active: true },
  { name: 'Diego Rosales', email: 'diego@cnb.gt', role: 'Administrador de sucursal', branch: 'Antigua', lastAccess: 'Ayer, 18:10', active: true },
  { name: 'Lucía Guerra', email: 'lucia@cnb.gt', role: 'Administrador de sucursal', branch: 'Quetzaltenango', lastAccess: 'Hace 3 días', active: true },
  { name: 'Marco Ruiz', email: 'marco@cnb.gt', role: 'Administrador de sucursal', branch: 'Escuintla', lastAccess: 'Hace 12 días', active: false },
]

export const REVENUE_CHART = [
  ['Ene', 55, 28],
  ['Feb', 68, 34],
  ['Mar', 61, 31],
  ['Abr', 78, 42],
  ['May', 83, 38],
  ['Jun', 92, 35],
] as const

export const RECENT_ACTIVITY = [
  ['check', 'Viaje completado', 'Guatemala → Antigua · hace 12 min', 'success'],
  ['fuel', 'Gasto registrado', 'P-482KLM · Q 685.00 · hace 34 min', 'warning'],
  ['ticket', 'Nueva venta presencial', '3 boletos · Q 375.00 · hace 1 h', 'info'],
  ['bus', 'Bus asignado', 'Alquiler privado #1048 · hace 2 h', 'neutral'],
] as const

export const WALLET_MOVEMENTS = [
  ['14 jun 2025', 'Recarga manual', 'Recarga', '+ Q 500.00', 'Q 1,250.00', 'success'],
  ['10 jun 2025', 'Boleto Guatemala → Antigua', 'Pago', '− Q 125.00', 'Q 750.00', 'info'],
  ['02 jun 2025', 'Recarga manual', 'Recarga', '+ Q 1,000.00', 'Q 875.00', 'success'],
] as const

export const TICKET_HISTORY = [
  {
    date: '10 jun 2025',
    trip: 'Guatemala → Antigua',
    tripNote: '10 jun · 07:30',
    seats: 'A2',
    channel: 'En línea',
    amount: 'Q 125.00',
    state: 'Completado',
  },
  {
    date: '28 may 2025',
    trip: 'Guatemala → Panajachel',
    tripNote: '30 may · 13:45',
    seats: 'C1, C2',
    channel: 'Presencial',
    amount: 'Q 370.00',
    state: 'Completado',
  },
]
