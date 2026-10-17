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

export interface BusRecord {
  plate: string
  brand: string
  model: string
  year: number
  capacity: number
  mileage: string
  driver: string
  branch: string
  state: string
  trips: number
  activeTrips: number
}

export const BUSES: BusRecord[] = [
  { plate: 'P-482KLM', brand: 'Mercedes-Benz', model: 'Marcopolo', year: 2022, capacity: 45, mileage: '128,450 km', driver: 'Carlos Méndez', branch: 'Guatemala Centro', state: 'Operativo', trips: 284, activeTrips: 2 },
  { plate: 'P-193JHF', brand: 'Hino', model: 'AK8', year: 2020, capacity: 40, mileage: '94,210 km', driver: 'Mario Chacón', branch: 'Guatemala Centro', state: 'Operativo', trips: 231, activeTrips: 1 },
  { plate: 'P-728DBN', brand: 'Scania', model: 'K360', year: 2019, capacity: 50, mileage: '156,830 km', driver: 'Luis Ramírez', branch: 'Quetzaltenango', state: 'En taller', trips: 312, activeTrips: 0 },
  { plate: 'P-541QTR', brand: 'Volvo', model: 'B430R', year: 2023, capacity: 46, mileage: '72,105 km', driver: 'Andrea Reyes', branch: 'Antigua', state: 'Operativo', trips: 158, activeTrips: 1 },
]

export interface DriverRecord {
  name: string
  license: string
  licenseType: string
  expiry: string
  phone: string
  salary: string
  branch: string
  trips: number
  expiryState: 'Vigente' | 'Vence en 15 días' | 'Vence en 3 días'
  tone: 'success' | 'warning' | 'danger'
}

export const DRIVERS: DriverRecord[] = [
  { name: 'Carlos Méndez', license: 'A-028491', licenseType: 'A1', expiry: '2026-08-20', phone: '5555-1201', salary: 'Q 520.00', branch: 'Guatemala Centro', trips: 184, expiryState: 'Vigente', tone: 'success' },
  { name: 'Mario Chacón', license: 'A-019384', licenseType: 'A1', expiry: '2025-07-01', phone: '5555-3342', salary: 'Q 500.00', branch: 'Guatemala Centro', trips: 142, expiryState: 'Vence en 15 días', tone: 'warning' },
  { name: 'Luis Ramírez', license: 'B-057210', licenseType: 'A2', expiry: '2027-01-18', phone: '5555-8890', salary: 'Q 540.00', branch: 'Quetzaltenango', trips: 203, expiryState: 'Vigente', tone: 'success' },
  { name: 'Andrea Reyes', license: 'A-061422', licenseType: 'A1', expiry: '2025-06-19', phone: '5555-4417', salary: 'Q 515.00', branch: 'Antigua', trips: 97, expiryState: 'Vence en 3 días', tone: 'danger' },
]

export interface RouteRecord {
  origin: string
  destination: string
  distance: string
  price: string
  trips: number
}

export const ROUTES: RouteRecord[] = [
  { origin: 'Guatemala Centro', destination: 'Antigua', distance: '42 km', price: 'Q 125.00', trips: 284 },
  { origin: 'Guatemala Centro', destination: 'Quetzaltenango', distance: '201 km', price: 'Q 245.00', trips: 165 },
  { origin: 'Guatemala Centro', destination: 'Escuintla', distance: '61 km', price: 'Q 95.00', trips: 119 },
  { origin: 'Guatemala Centro', destination: 'Panajachel', distance: '145 km', price: 'Q 185.00', trips: 208 },
  { origin: 'Antigua', destination: 'Escuintla', distance: '50 km', price: 'Q 110.00', trips: 74 },
  { origin: 'Quetzaltenango', destination: 'Escuintla', distance: '178 km', price: 'Q 220.00', trips: 41 },
]

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

export interface RentalRecord {
  client: string
  route: string
  date: string
  passengers: number
  price: string
  assignment: string
  state: string
  tone: 'warning' | 'success' | 'info'
}

export const RENTALS: RentalRecord[] = [
  { client: 'Inversiones Maya', route: 'Guatemala → Monterrico', date: '20 jun · 06:00', passengers: 32, price: 'Q 4,850', assignment: 'Sin asignar', state: 'Pendiente', tone: 'warning' },
  { client: 'Colegio El Roble', route: 'Guatemala → Panajachel', date: '22 jun · 05:30', passengers: 44, price: 'Q 6,200', assignment: 'P-541QTR', state: 'Pagado', tone: 'success' },
  { client: 'Eventos Aurora', route: 'Antigua → Atitlán', date: '27 jun · 08:00', passengers: 25, price: 'Q 3,900', assignment: 'P-482KLM', state: 'Confirmado', tone: 'info' },
]

export interface WorkshopRecord {
  bus: string
  service: string
  date: string
  categories: string
  lines: string
  type: string
  total: string
}

export const WORKSHOP_EXPENSES: WorkshopRecord[] = [
  { bus: 'P-482KLM', service: 'Servicio preventivo', date: '14 jun 2025', categories: 'Motor · Aceite', lines: '3', type: 'Mixto', total: 'Q 2,480' },
  { bus: 'P-728DBN', service: 'Cambio de frenos', date: '12 jun 2025', categories: 'Frenos', lines: '4', type: 'Repuesto', total: 'Q 4,120' },
  { bus: 'P-193JHF', service: 'Alineación general', date: '08 jun 2025', categories: 'Suspensión', lines: '2', type: 'Mano de obra', total: 'Q 1,250' },
]

export interface CategoryRecord {
  name: string
  expenses: number
  lastMove: string
}

export const EXPENSE_CATEGORIES: CategoryRecord[] = [
  { name: 'Motor', expenses: 42, lastMove: '14 jun 2025' },
  { name: 'Llantas', expenses: 28, lastMove: '05 jun 2025' },
  { name: 'Frenos', expenses: 36, lastMove: '12 jun 2025' },
  { name: 'Suspensión', expenses: 19, lastMove: '08 jun 2025' },
  { name: 'Cambio de aceite', expenses: 51, lastMove: '14 jun 2025' },
  { name: 'Eléctrico', expenses: 14, lastMove: '02 jun 2025' },
  { name: 'Carrocería', expenses: 9, lastMove: '28 may 2025' },
  { name: 'Otros', expenses: 6, lastMove: '21 may 2025' },
]

export interface BranchRecord {
  name: string
  location: string
  admin: string
  buses: number
  drivers: number
}

export const BRANCHES: BranchRecord[] = [
  { name: 'Guatemala Centro', location: 'Ciudad de Guatemala', admin: 'Ana Martínez', buses: 21, drivers: 18 },
  { name: 'Antigua', location: 'Sacatepéquez', admin: 'Diego Rosales', buses: 12, drivers: 10 },
  { name: 'Quetzaltenango', location: 'Quetzaltenango', admin: 'Lucía Guerra', buses: 16, drivers: 14 },
  { name: 'Escuintla', location: 'Escuintla', admin: 'Marco Ruiz', buses: 9, drivers: 8 },
]

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

export const BRANCH_NAMES = BRANCHES.map((branch) => branch.name)

export const BRANCH_REPORTS = [
  ['Listado de buses', 'Estado, chofer y viajes realizados', '21 buses', '18 operativos', 'bus'],
  ['Listado de choferes', 'Licencias y viajes realizados', '18 choferes', '2 por vencer', 'users'],
  ['Ingresos por boletos', 'Ventas regulares por ruta', 'Q 128,450', '+12.4%', 'ticket'],
  ['Ingresos por alquileres', 'Servicios privados confirmados', 'Q 46,200', '12 alquileres', 'calendar'],
  ['Depreciación por bus', 'Costo acumulado por kilometraje', 'Q 35,980', 'Q 0.75/km', 'chart'],
  ['Gastos de taller', 'Detalle por bus y categoría', 'Q 28,650', 'Motor 38%', 'wrench'],
] as const

export const SYSTEM_REPORTS = [
  ['Ingresos monetarios', 'Ingresos agrupados por sucursal y concepto', 'Q 584,920', '+14.2%', 'chart'],
  ['Gastos monetarios', 'Combustible, taller y depreciación', 'Q 218,460', '-2.8%', 'wallet'],
  ['Ganancias monetarias', 'Resultado neto por sucursal', 'Q 366,460', '+18.7%', 'chart'],
  ['Rutas más demandadas', 'Ranking por boletos vendidos', '4,829 boletos', '+9.4%', 'route'],
  ['Taller por categoría', 'Gastos globales por categoría', 'Q 89,340', '8 categorías', 'wrench'],
  ['Mapa de rutas', 'Cobertura desde cada sucursal', '32 rutas', '4 sucursales', 'grid'],
] as const

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

export const PRIVATE_HISTORY = [
  {
    request: '02 jun 2025',
    route: 'Guatemala → Monterrico',
    dates: '20–22 jun',
    passengers: '12',
    amount: 'Q 3,850.00',
    state: 'Pendiente',
  },
]

export const EXPENSE_LINES = [
  ['Motor', 'Afinación general', 'Mano de obra', 'Q 850.00'],
  ['Cambio de aceite', 'Aceite y filtros', 'Repuesto', 'Q 1,130.00'],
  ['Motor', 'Diagnóstico', 'Mano de obra', 'Q 500.00'],
]

export interface LedgerEntry {
  date: string
  branch: string
  concept: string
  source: string
  amount: number
}

export const INCOME_ENTRIES: LedgerEntry[] = [
  { date: '2025-06-02', branch: 'Antigua', concept: 'Boletos Guatemala → Antigua', source: 'Boletos', amount: 8450 },
  { date: '2025-06-05', branch: 'Antigua', concept: 'Alquiler #1031 Antigua → Atitlán', source: 'Alquileres', amount: 3900 },
  { date: '2025-06-09', branch: 'Antigua', concept: 'Boletos Antigua → Escuintla', source: 'Boletos', amount: 4180 },
  { date: '2025-06-12', branch: 'Escuintla', concept: 'Boletos Guatemala → Escuintla', source: 'Boletos', amount: 6240 },
  { date: '2025-06-14', branch: 'Escuintla', concept: 'Boletos Escuintla → Quetzaltenango', source: 'Boletos', amount: 5120 },
  { date: '2025-06-03', branch: 'Guatemala Centro', concept: 'Boletos Guatemala → Quetzaltenango', source: 'Boletos', amount: 21460 },
  { date: '2025-06-07', branch: 'Guatemala Centro', concept: 'Alquiler #1048 Guatemala → Monterrico', source: 'Alquileres', amount: 4850 },
  { date: '2025-06-10', branch: 'Guatemala Centro', concept: 'Boletos Guatemala → Antigua', source: 'Boletos', amount: 16050 },
  { date: '2025-06-13', branch: 'Guatemala Centro', concept: 'Boletos Guatemala → Panajachel', source: 'Boletos', amount: 11470 },
  { date: '2025-06-04', branch: 'Quetzaltenango', concept: 'Boletos Quetzaltenango → Escuintla', source: 'Boletos', amount: 7260 },
  { date: '2025-06-11', branch: 'Quetzaltenango', concept: 'Alquiler #1039 Quetzaltenango → Antigua', source: 'Alquileres', amount: 6200 },
  { date: '2025-06-15', branch: 'Quetzaltenango', concept: 'Boletos Quetzaltenango → Guatemala', source: 'Boletos', amount: 9180 },
]

export const EXPENSE_ENTRIES: LedgerEntry[] = [
  { date: '2025-06-02', branch: 'Antigua', concept: 'Combustible P-541QTR', source: 'Combustible', amount: 1240 },
  { date: '2025-06-08', branch: 'Antigua', concept: 'Taller · suspensión P-541QTR', source: 'Taller', amount: 1850 },
  { date: '2025-06-14', branch: 'Antigua', concept: 'Depreciación flota Antigua', source: 'Depreciación', amount: 980 },
  { date: '2025-06-04', branch: 'Escuintla', concept: 'Combustible ruta Escuintla', source: 'Combustible', amount: 860 },
  { date: '2025-06-11', branch: 'Escuintla', concept: 'Repuestos frenos', source: 'Repuestos', amount: 1420 },
  { date: '2025-06-01', branch: 'Guatemala Centro', concept: 'Combustible flota Guatemala', source: 'Combustible', amount: 5480 },
  { date: '2025-06-06', branch: 'Guatemala Centro', concept: 'Taller preventivo P-482KLM', source: 'Taller', amount: 2480 },
  { date: '2025-06-12', branch: 'Guatemala Centro', concept: 'Repuestos frenos P-193JHF', source: 'Repuestos', amount: 4120 },
  { date: '2025-06-15', branch: 'Guatemala Centro', concept: 'Depreciación flota Guatemala', source: 'Depreciación', amount: 3260 },
  { date: '2025-06-05', branch: 'Quetzaltenango', concept: 'Combustible P-728DBN', source: 'Combustible', amount: 1620 },
  { date: '2025-06-09', branch: 'Quetzaltenango', concept: 'Taller general P-728DBN', source: 'Taller', amount: 4120 },
  { date: '2025-06-13', branch: 'Quetzaltenango', concept: 'Depreciación flota Quetzaltenango', source: 'Depreciación', amount: 1480 },
]

export interface DemandRoute {
  code: string
  origin: string
  destination: string
  distance: string
  price: string
  tickets: number
  revenue: number
}

export const DEMAND_ROUTES: DemandRoute[] = [
  { code: 'GC-ANT', origin: 'Guatemala Centro', destination: 'Antigua', distance: '42 km', price: 'Q 125.00', tickets: 1284, revenue: 160500 },
  { code: 'GC-PAN', origin: 'Guatemala Centro', destination: 'Panajachel', distance: '145 km', price: 'Q 185.00', tickets: 620, revenue: 114700 },
  { code: 'GC-XEL', origin: 'Guatemala Centro', destination: 'Quetzaltenango', distance: '201 km', price: 'Q 245.00', tickets: 862, revenue: 211190 },
  { code: 'GC-ESC', origin: 'Guatemala Centro', destination: 'Escuintla', distance: '61 km', price: 'Q 95.00', tickets: 748, revenue: 71060 },
  { code: 'XE-ESC', origin: 'Quetzaltenango', destination: 'Escuintla', distance: '178 km', price: 'Q 220.00', tickets: 331, revenue: 72820 },
  { code: 'AN-ESC', origin: 'Antigua', destination: 'Escuintla', distance: '50 km', price: 'Q 110.00', tickets: 384, revenue: 42240 },
]

export interface WorkshopLine {
  date: string
  bus: string
  branch: string
  category: string
  description: string
  kind: 'Mano de obra' | 'Repuesto'
  amount: number
}

export const WORKSHOP_LINES: WorkshopLine[] = [
  { date: '2025-06-14', bus: 'P-482KLM', branch: 'Guatemala Centro', category: 'Motor', description: 'Afinación general', kind: 'Mano de obra', amount: 850 },
  { date: '2025-06-14', bus: 'P-482KLM', branch: 'Guatemala Centro', category: 'Cambio de aceite', description: 'Aceite y filtros', kind: 'Repuesto', amount: 1130 },
  { date: '2025-06-14', bus: 'P-482KLM', branch: 'Guatemala Centro', category: 'Motor', description: 'Diagnóstico computarizado', kind: 'Mano de obra', amount: 500 },
  { date: '2025-06-12', bus: 'P-728DBN', branch: 'Quetzaltenango', category: 'Frenos', description: 'Juego de pastillas delanteras', kind: 'Repuesto', amount: 1620 },
  { date: '2025-06-12', bus: 'P-728DBN', branch: 'Quetzaltenango', category: 'Frenos', description: 'Rectificado de discos', kind: 'Mano de obra', amount: 900 },
  { date: '2025-06-12', bus: 'P-728DBN', branch: 'Quetzaltenango', category: 'Frenos', description: 'Líneas de freno', kind: 'Repuesto', amount: 1100 },
  { date: '2025-06-08', bus: 'P-193JHF', branch: 'Guatemala Centro', category: 'Suspensión', description: 'Alineación y balanceo', kind: 'Mano de obra', amount: 750 },
  { date: '2025-06-08', bus: 'P-193JHF', branch: 'Guatemala Centro', category: 'Llantas', description: 'Dos llantas radiales', kind: 'Repuesto', amount: 1500 },
  { date: '2025-06-05', bus: 'P-541QTR', branch: 'Antigua', category: 'Llantas', description: 'Rotación y reparación', kind: 'Mano de obra', amount: 350 },
  { date: '2025-06-05', bus: 'P-541QTR', branch: 'Antigua', category: 'Eléctrico', description: 'Batería 12V', kind: 'Repuesto', amount: 890 },
  { date: '2025-05-28', bus: 'P-541QTR', branch: 'Antigua', category: 'Carrocería', description: 'Reparación de puerta lateral', kind: 'Mano de obra', amount: 1200 },
  { date: '2025-06-09', bus: 'P-728DBN', branch: 'Quetzaltenango', category: 'Motor', description: 'Cambio de correa', kind: 'Repuesto', amount: 1420 },
]

export interface TicketRevenueRow {
  date: string
  trip: string
  route: string
  bus: string
  tickets: number
  income: number
}

export const TICKET_REVENUE: TicketRevenueRow[] = [
  { date: '2025-06-10', trip: '07:30', route: 'Guatemala → Antigua', bus: 'P-482KLM', tickets: 33, income: 4125 },
  { date: '2025-06-11', trip: '07:30', route: 'Guatemala → Antigua', bus: 'P-482KLM', tickets: 41, income: 5125 },
  { date: '2025-06-09', trip: '09:15', route: 'Guatemala → Quetzaltenango', bus: 'P-193JHF', tickets: 28, income: 6860 },
  { date: '2025-06-12', trip: '11:00', route: 'Guatemala → Escuintla', bus: 'P-728DBN', tickets: 36, income: 3420 },
  { date: '2025-06-13', trip: '13:45', route: 'Guatemala → Panajachel', bus: 'P-541QTR', tickets: 22, income: 4070 },
  { date: '2025-06-14', trip: '07:30', route: 'Guatemala → Antigua', bus: 'P-482KLM', tickets: 38, income: 4750 },
]

export interface RentalRevenueRow {
  date: string
  client: string
  origin: string
  destination: string
  period: string
  bus: string
  branch: string
  total: number
}

export const RENTAL_REVENUE: RentalRevenueRow[] = [
  { date: '2025-06-07', client: 'Inversiones Maya', origin: 'Guatemala Centro', destination: 'Monterrico', period: '07–09 jun', bus: 'P-541QTR', branch: 'Guatemala Centro', total: 4850 },
  { date: '2025-06-05', client: 'Eventos Aurora', origin: 'Antigua', destination: 'Atitlán', period: '05–06 jun', bus: 'P-482KLM', branch: 'Antigua', total: 3900 },
  { date: '2025-06-11', client: 'Colegio El Roble', origin: 'Quetzaltenango', destination: 'Antigua', period: '11–13 jun', bus: 'P-728DBN', branch: 'Quetzaltenango', total: 6200 },
  { date: '2025-06-03', client: 'Tours Xela', origin: 'Quetzaltenango', destination: 'Escuintla', period: '03–04 jun', bus: 'P-728DBN', branch: 'Quetzaltenango', total: 2750 },
]

export interface BusDepreciationRow {
  plate: string
  branch: string
  km: number
}

export const BUS_KM: BusDepreciationRow[] = [
  { plate: 'P-482KLM', branch: 'Guatemala Centro', km: 18240 },
  { plate: 'P-193JHF', branch: 'Guatemala Centro', km: 12650 },
  { plate: 'P-728DBN', branch: 'Quetzaltenango', km: 9880 },
  { plate: 'P-541QTR', branch: 'Antigua', km: 8510 },
]

export const DEPRECIATION_RATE = 0.75
