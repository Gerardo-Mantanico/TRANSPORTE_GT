import { useCallback, useEffect, useMemo, useState } from 'react'
import { errorMessage } from '../../api/client'
import { listarBuses } from '../../api/fleet'
import { listarChoferes } from '../../api/fleet'
import { listarRutas, listarViajes, eliminarRuta, eliminarViaje } from '../../api/trips'
import { listarAlquileres } from '../../api/rentals'
import { listarCategorias, listarGastosTaller, desactivarCategoria } from '../../api/costs'
import { listarSucursales, listarUsuarios } from '../../api/identity'
import type {
  AlquilerResponse,
  BusResponse,
  CategoriaResponse,
  ChoferResponse,
  GastoTallerResponse,
  RutaResponse,
  SucursalResponse,
  UsuarioResponse,
  ViajeResponse,
} from '../../api/types'
import type { BadgeTone, IconName, ResourceConfig } from '../../types'
import { Avatar } from '../../components/ui/Misc'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { FilterToolbar } from '../../components/ui/FilterToolbar'
import { Icon } from '../../components/ui/Icon'
import { Lightbox } from '../../components/ui/Lightbox'
import { useToast } from '../../components/ui/useToast'
import { useAuth } from '../../app/providers/useAuth'
import { formatQ } from '../../utils/format'
import { AddRecordModal } from '../modals/AddRecordModal'
import { FlowBar, FlowModal } from '../modals/flows'
import {
  estadoAlquilerLabel,
  estadoAlquilerTone,
  estadoBusLabel,
  estadoViajeLabel,
  estadoViajeTone,
  fechaCorta,
  fechaHoraCorta,
  licenciaEstado,
  rolLabel,
  sucursalNombre,
  tipoLineaGasto,
  tipoViajeLabel,
} from './mappers'

function CellStack({ title, note }: { title: string; note: string }) {
  return (
    <>
      <strong>{title}</strong>
      <small className="cell-note">{note}</small>
    </>
  )
}

function RowActions({ children }: { children: React.ReactNode }) {
  return <div className="row-actions">{children}</div>
}

function ViewButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="icon-button"
      title="Ver detalle"
      aria-label={`Ver detalle de ${label}`}
      onClick={onClick}
    >
      <Icon name="eye" size={16} />
    </button>
  )
}

function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="icon-button"
      title="Editar"
      aria-label={`Editar ${label}`}
      onClick={onClick}
    >
      <Icon name="pencil" size={16} />
    </button>
  )
}

interface DetailState {
  title: string
  items: [string, string][]
  images?: string[]
}

const ICON_BY_LABEL: Record<string, IconName> = {
  Tipo: 'ticket',
  Salida: 'calendar',
  'Llegada estimada': 'calendar',
  Vencimiento: 'calendar',
  Creado: 'calendar',
  Bus: 'bus',
  Marca: 'bus',
  Modelo: 'bus',
  'Año de fabricación': 'bus',
  Capacidad: 'bus',
  Kilometraje: 'fuel',
  'Estado operativo': 'bus',
  Chofer: 'user',
  Correo: 'user',
  Teléfono: 'phone',
  Licencia: 'card',
  'Salario base': 'wallet',
  'Precio del boleto': 'wallet',
  Precio: 'wallet',
  Origen: 'route',
  Destino: 'route',
  Distancia: 'route',
  Sucursal: 'home',
  Estado: 'check',
  Registro: 'check',
  Descripción: 'grid',
}

function DetailModal({
  title,
  items,
  images,
  onClose,
}: {
  title: string
  items: [string, string][]
  images?: string[]
  onClose: () => void
}) {
  const [photo, setPhoto] = useState<number | null>(null)

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section className="modal" role="dialog" aria-modal="true" aria-label={`Detalle de ${title}`}>
        <header>
          <div>
            <span className="eyebrow">Detalle del registro</span>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">
          <div className="profile-data-grid">
            {items.map(([label, value]) => (
              <div key={label}>
                <span className="detail-label">
                  <Icon name={ICON_BY_LABEL[label] ?? 'grid'} size={13} /> {label}
                </span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          {images !== undefined && (
            <div className="detail-photos">
              <span className="detail-photos-title">
                <Icon name="eye" size={14} /> Foto registrada
              </span>
              {images.length > 0 ? (
                <div className="detail-photos-grid">
                  {images.map((src, index) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setPhoto(index)}
                      aria-label={`Ver foto ${index + 1} en pantalla completa`}
                      title="Ver en pantalla completa"
                    >
                      <img src={src} alt={`Foto registrada ${index + 1}`} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="detail-photos-empty">
                  <Icon name="upload" size={20} />
                  <p>Aún no se ha registrado una foto.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      {photo !== null && images && images.length > 0 && (
        <Lightbox
          urls={images}
          index={Math.min(photo, images.length - 1)}
          onIndexChange={setPhoto}
          onClose={() => setPhoto(null)}
          alt="Foto registrada"
        />
      )}
    </div>
  )
}

interface ListData {
  buses: BusResponse[]
  choferes: ChoferResponse[]
  viajes: ViajeResponse[]
  rutas: RutaResponse[]
  alquileres: AlquilerResponse[]
  gastos: GastoTallerResponse[]
  categorias: CategoriaResponse[]
  sucursales: SucursalResponse[]
  usuarios: UsuarioResponse[]
}

const EMPTY_DATA: ListData = {
  buses: [],
  choferes: [],
  viajes: [],
  rutas: [],
  alquileres: [],
  gastos: [],
  categorias: [],
  sucursales: [],
  usuarios: [],
}

interface ConfigActions {
  edit: (page: string, record: Record<string, string | number | boolean | null>) => void
  flow: (flowId: string) => void
  details: (title: string, items: [string, string][], images?: string[]) => void
  deleteRuta: (ruta: RutaResponse) => void
  deleteViaje: (viaje: ViajeResponse) => void
  toggleCategoria: (categoria: CategoriaResponse) => void
}

function busTone(bus: BusResponse): BadgeTone {
  if (!bus.activo || bus.estadoOperativo === 'FUERA_DE_SERVICIO') return 'neutral'
  if (bus.estadoOperativo === 'EN_TALLER') return 'warning'
  return 'success'
}

function buildResourceConfig(
  type: string,
  filters: Record<string, string>,
  data: ListData,
  actions: ConfigActions,
  soloLectura: boolean,
): ResourceConfig {
  const pick = (key: string, fallback: string) => filters[key] ?? fallback
  const sucursales = data.sucursales

  switch (type) {
    case 'viajes': {
      const stateFilter = pick('state', 'Todos los estados')
      const typeFilter = pick('type', 'Todos los tipos')
      const stateMap: Record<string, string> = {
        Programado: 'PROGRAMADO',
        'En tránsito': 'EN_TRANSITO',
        Completado: 'FINALIZADO',
        'Sin asignar': 'PENDIENTE_ASIGNACION',
      }
      const typeMap: Record<string, string> = {
        Regular: 'REGULAR',
        'Alquiler privado': 'ALQUILER_PRIVADO',
      }
      const trips = data.viajes.filter(
        (trip) =>
          (stateFilter === 'Todos los estados' || trip.estado === stateMap[stateFilter]) &&
          (typeFilter === 'Todos los tipos' || trip.tipoViaje === typeMap[typeFilter]),
      )
      return {
        eyebrow: 'Operación',
        title: 'Viajes',
        description: 'Programe y dé seguimiento a cada salida de la sucursal.',
        action: 'Programar viaje',
        filters: [],
        filterDefs: [
          {
            key: 'state',
            label: 'Estado',
            options: ['Todos los estados', 'Programado', 'En tránsito', 'Completado', 'Sin asignar'],
          },
          { key: 'type', label: 'Tipo', options: ['Todos los tipos', 'Regular', 'Alquiler privado'] },
        ],
        headers: ['Ruta', 'Tipo', 'Salida', 'Bus / Chofer', 'Estado', 'Acciones'],
        rows: trips.map((trip) => [
          <strong>
            {trip.nombreOrigen} <span className="route-arrow">→</span> {trip.nombreDestino}
          </strong>,
          tipoViajeLabel(trip.tipoViaje),
          fechaHoraCorta(trip.fechaHoraSalida),
          <CellStack
            title={trip.bus?.placa ?? 'Sin bus'}
            note={trip.chofer?.nombreCompleto ?? 'Sin chofer'}
          />,
          <Badge tone={estadoViajeTone(trip.estado)}>{estadoViajeLabel(trip.estado)}</Badge>,
          <RowActions>
            <ViewButton
              label={`${trip.nombreOrigen} a ${trip.nombreDestino}`}
              onClick={() =>
                actions.details(`${trip.nombreOrigen} → ${trip.nombreDestino}`, [
                  ['Tipo', tipoViajeLabel(trip.tipoViaje)],
                  ['Salida', fechaHoraCorta(trip.fechaHoraSalida)],
                  [
                    'Llegada estimada',
                    trip.fechaHoraLlegadaEstimada ? fechaHoraCorta(trip.fechaHoraLlegadaEstimada) : '—',
                  ],
                  ['Bus', trip.bus?.placa ?? 'Sin bus'],
                  ['Chofer', trip.chofer?.nombreCompleto ?? 'Sin chofer'],
                  ['Estado', estadoViajeLabel(trip.estado)],
                ])
              }
            />
            {trip.estado === 'PROGRAMADO' && !soloLectura && (
              <Button variant="ghost" onClick={() => actions.flow('VJ-04')}>
                Registrar salida
              </Button>
            )}
            {trip.estado === 'EN_TRANSITO' && !soloLectura && (
              <Button variant="ghost" onClick={() => actions.flow('VJ-05')}>
                Registrar llegada
              </Button>
            )}
            {trip.estado === 'FINALIZADO' && (
              <Button variant="ghost" onClick={() => actions.flow('VJ-03')}>
                Ver detalle
              </Button>
            )}
            {!soloLectura && (
              <EditButton
                label={`el viaje de ${trip.nombreOrigen} a ${trip.nombreDestino}`}
                onClick={() =>
                  actions.edit('viajes', {
                    id: trip.id,
                    version: trip.version,
                    idRuta: trip.idRuta,
                    idBus: trip.bus?.idBus ?? '',
                    idChofer: trip.chofer?.idChofer ?? '',
                    fechaHoraSalida: trip.fechaHoraSalida,
                    fechaHoraLlegadaEstimada: trip.fechaHoraLlegadaEstimada ?? '',
                  })
                }
              />
            )}
            {!soloLectura && (
              <Button
                variant="ghost"
                onClick={() =>
                  trip.estado === 'PROGRAMADO' || trip.estado === 'PENDIENTE_ASIGNACION'
                    ? actions.deleteViaje(trip)
                    : actions.flow('VJ-06-G')
                }
              >
                Eliminar
              </Button>
            )}
          </RowActions>,
        ]),
      }
    }
    case 'buses': {
      const stateFilter = pick('state', 'Todos los estados')
      const buses = data.buses.filter(
        (bus) => stateFilter === 'Todos los estados' || estadoBusLabel(bus) === stateFilter,
      )
      return {
        eyebrow: 'Flota',
        title: 'Buses',
        description: 'Gestione el inventario y estado operativo de su flota.',
        action: 'Registrar bus',
        filters: [],
        filterDefs: [
          {
            key: 'state',
            label: 'Estado operativo',
            options: ['Todos los estados', 'Operativo', 'En taller', 'Inactivo'],
          },
        ],
        headers: [
          'Bus',
          'Capacidad',
          'Kilometraje',
          'Sucursal',
          'Estado',
          'Acciones',
        ],
        rows: buses.map((bus) => [
          <CellStack
            title={bus.placa}
            note={`${bus.marca} ${bus.modelo} · ${bus.anioFabricacion}`}
          />,
          `${bus.capacidadPasajeros} pas.`,
          bus.kilometrajeActual != null ? `${bus.kilometrajeActual.toLocaleString('es-GT')} km` : '—',
          sucursalNombre(bus.idSucursal, sucursales),
          <Badge tone={busTone(bus)}>{estadoBusLabel(bus)}</Badge>,
          <RowActions>
            <ViewButton
              label={`el bus ${bus.placa}`}
              onClick={() =>
                actions.details(`Bus ${bus.placa}`, [
                  ['Marca', bus.marca],
                  ['Modelo', bus.modelo],
                  ['Año de fabricación', String(bus.anioFabricacion)],
                  ['Capacidad', `${bus.capacidadPasajeros} pasajeros`],
                  [
                    'Kilometraje',
                    bus.kilometrajeActual != null
                      ? `${bus.kilometrajeActual.toLocaleString('es-GT')} km`
                      : '—',
                  ],
                  ['Sucursal', sucursalNombre(bus.idSucursal, sucursales)],
                  ['Estado operativo', estadoBusLabel(bus)],
                  ['Registro', bus.activo ? 'Activo' : 'Inactivo'],
                ],
                bus.fotoUrl ? [bus.fotoUrl] : [],
              )
              }
            />
            {!soloLectura && (
              <EditButton
                label={`el bus ${bus.placa}`}
                onClick={() =>
                  actions.edit('buses', {
                    id: bus.id,
                    version: bus.version,
                    plate: bus.placa,
                    brand: bus.marca,
                    model: bus.modelo,
                    year: bus.anioFabricacion,
                    capacity: bus.capacidadPasajeros,
                    mileage: bus.kilometrajeActual ?? 0,
                    idSucursal: bus.idSucursal,
                    estadoOperativo: bus.estadoOperativo,
                    activo: bus.activo,
                    fotoUrl: bus.fotoUrl,
                  })
                }
              />
            )}
          </RowActions>,
        ]),
      }
    }
    case 'choferes': {
      const stateFilter = pick('license', 'Todas las licencias')
      const drivers = data.choferes.filter((driver) => {
        if (stateFilter === 'Todas las licencias') return true
        return licenciaEstado(driver.fechaVencimientoLicencia).label === stateFilter
      })
      return {
        eyebrow: 'Flota',
        title: 'Choferes',
        description: 'Controle licencias, disponibilidad y asignaciones.',
        action: 'Registrar chofer',
        filters: [],
        filterDefs: [
          {
            key: 'license',
            label: 'Estado de licencia',
            options: ['Todas las licencias', 'Vigente', 'Vence en 15 días', 'Vence en 3 días', 'Vencida'],
          },
        ],
        headers: [
          'Chofer',
          'Licencia',
          'Vencimiento',
          'Teléfono',
          'Salario base',
          'Sucursal',
          'Estado',
          'Acciones',
        ],
        rows: drivers.map((driver) => {
          const licence = licenciaEstado(driver.fechaVencimientoLicencia)
          return [
            <div className="person">
              <Avatar name={driver.nombreCompleto} small />
              <strong>{driver.nombreCompleto}</strong>
            </div>,
            <CellStack title={driver.numeroLicencia} note={`Tipo ${driver.tipoLicencia}`} />,
            <div className="cell-stack">
              <strong>{fechaCorta(driver.fechaVencimientoLicencia)}</strong>
              <small className="cell-note">
                <Badge tone={licence.tone}>{licence.label}</Badge>
              </small>
            </div>,
            driver.telefono,
            formatQ(driver.salarioBaseViaje),
            sucursalNombre(driver.idSucursal, sucursales),
            <Badge tone={driver.activo ? 'success' : 'neutral'}>
              {driver.activo ? 'Activo' : 'Inactivo'}
            </Badge>,
            <RowActions>
              <ViewButton
                label={driver.nombreCompleto}
                onClick={() =>
                  actions.details(driver.nombreCompleto, [
                    ['Correo', driver.correo],
                    ['Teléfono', driver.telefono],
                    ['Licencia', `${driver.numeroLicencia} · Tipo ${driver.tipoLicencia}`],
                    ['Vencimiento', `${fechaCorta(driver.fechaVencimientoLicencia)} (${licence.label})`],
                    ['Salario base', formatQ(driver.salarioBaseViaje)],
                    ['Sucursal', sucursalNombre(driver.idSucursal, sucursales)],
                    ['Estado', driver.activo ? 'Activo' : 'Inactivo'],
                  ],
                  driver.fotoUrl ? [driver.fotoUrl] : [],
                )
              }
            />
              {!soloLectura && (
                <EditButton
                  label={driver.nombreCompleto}
                  onClick={() =>
                    actions.edit('choferes', {
                      id: driver.id,
                      version: driver.version,
                      name: driver.nombreCompleto,
                      correo: driver.correo,
                      license: driver.numeroLicencia,
                      licenseType: driver.tipoLicencia,
                      expiry: driver.fechaVencimientoLicencia.slice(0, 10),
                      phone: driver.telefono,
                      salary: driver.salarioBaseViaje,
                      idSucursal: driver.idSucursal,
                      activo: driver.activo,
                      fotoUrl: driver.fotoUrl,
                    })
                  }
                />
              )}
              <Button variant="ghost" onClick={() => actions.flow('FS-05-N')}>
                Avisos
              </Button>
            </RowActions>,
          ]
        }),
      }
    }
    case 'rutas': {
      const destinationFilter = pick('destination', 'Todos los destinos')
      const routes = data.rutas.filter((route) => {
        if (destinationFilter === 'Todos los destinos') return true
        return sucursalNombre(route.idSucursalDestino, sucursales) === destinationFilter
      })
      return {
        eyebrow: 'Flota',
        title: 'Rutas',
        description: 'Defina rutas, distancias y precios desde su sucursal.',
        action: 'Nueva ruta',
        filters: [],
        filterDefs: [
          {
            key: 'destination',
            label: 'Destino',
            options: ['Todos los destinos', ...sucursales.map((sucursal) => sucursal.nombre)],
          },
        ],
        headers: ['Ruta', 'Distancia', 'Precio', 'Acciones'],
        rows: routes.map((route) => [
          <strong>
            {sucursalNombre(route.idSucursalOrigen, sucursales)}{' '}
            <span className="route-arrow">→</span> {sucursalNombre(route.idSucursalDestino, sucursales)}
          </strong>,
          `${route.distanciaKm} km`,
          formatQ(route.precioBoleto),
          <RowActions>
            <ViewButton
              label="la ruta"
              onClick={() =>
                actions.details('Detalle de la ruta', [
                  ['Origen', sucursalNombre(route.idSucursalOrigen, sucursales)],
                  ['Destino', sucursalNombre(route.idSucursalDestino, sucursales)],
                  ['Distancia', `${route.distanciaKm} km`],
                  ['Precio del boleto', formatQ(route.precioBoleto)],
                ])
              }
            />
            {!soloLectura && (
              <EditButton
                label="la ruta"
                onClick={() =>
                  actions.edit('rutas', {
                    id: route.id,
                    idSucursalOrigen: route.idSucursalOrigen,
                    idSucursalDestino: route.idSucursalDestino,
                    origin: sucursalNombre(route.idSucursalOrigen, sucursales),
                    destination: sucursalNombre(route.idSucursalDestino, sucursales),
                    distance: route.distanciaKm,
                    price: route.precioBoleto,
                  })
                }
              />
            )}
            {!soloLectura && (
              <Button variant="ghost" onClick={() => actions.deleteRuta(route)}>
                Eliminar
              </Button>
            )}
          </RowActions>,
        ]),
      }
    }
    case 'alquileres': {
      const stateFilter = pick('state', 'Todos los estados')
      const stateMap: Record<string, string> = {
        Pendiente: 'SOLICITADO',
        Cotizado: 'COTIZADO',
        Confirmado: 'CONFIRMADO',
        Finalizado: 'FINALIZADO',
        Cancelado: 'CANCELADO',
      }
      const rentals = data.alquileres.filter(
        (rental) => stateFilter === 'Todos los estados' || rental.estado === stateMap[stateFilter],
      )
      return {
        eyebrow: 'Operación',
        title: 'Alquileres privados',
        description: 'Cotice, asigne y dé seguimiento a solicitudes privadas.',
        action: 'Nueva solicitud',
        filters: [],
        filterDefs: [
          {
            key: 'state',
            label: 'Estado',
            options: [
              'Todos los estados',
              'Pendiente',
              'Cotizado',
              'Confirmado',
              'Finalizado',
              'Cancelado',
            ],
          },
        ],
        headers: ['Cliente / Trayecto', 'Fecha', 'Pasajeros', 'Precio', 'Asignación', 'Estado'],
        rows: rentals.map((rental) => [
          <CellStack title={rental.nombreCliente} note={`${rental.origen} → ${rental.destino}`} />,
          fechaHoraCorta(rental.fechaHoraSalida),
          String(rental.numeroPasajeros),
          <strong>{formatQ(rental.precioFinal ?? rental.precioEstimado)}</strong>,
          rental.placaBus ?? 'Sin asignar',
          <Badge tone={estadoAlquilerTone(rental.estado)}>{estadoAlquilerLabel(rental.estado)}</Badge>,
        ]),
      }
    }
    case 'taller': {
      const busFilter = pick('bus', 'Todos los buses')
      const plateById = new Map(data.buses.map((bus) => [bus.id, bus.placa]))
      const expenses = data.gastos.filter((expense) => {
        if (busFilter === 'Todos los buses') return true
        return plateById.get(expense.idBus) === busFilter
      })
      return {
        eyebrow: 'Control',
        title: 'Taller y repuestos',
        description: 'Registre el detalle de servicios y costos por bus.',
        action: 'Registrar gasto',
        filters: [],
        filterDefs: [
          {
            key: 'bus',
            label: 'Bus',
            options: ['Todos los buses', ...data.buses.map((bus) => bus.placa)],
          },
        ],
        headers: ['Bus / Servicio', 'Fecha', 'Categorías', 'Líneas', 'Tipo', 'Total'],
        rows: expenses.map((expense) => [
          <CellStack
            title={plateById.get(expense.idBus) ?? expense.idBus.slice(0, 8)}
            note={expense.observaciones ?? 'Servicio de taller'}
          />,
          fechaCorta(expense.fechaServicio),
          <span className="chip">
            {[...new Set(expense.lineas.map((linea) => linea.nombreCategoria))].join(' · ') || '—'}
          </span>,
          String(expense.lineas.length),
          tipoLineaGasto(expense.lineas),
          <strong>{formatQ(expense.total)}</strong>,
        ]),
      }
    }
    case 'categorias':
      return {
        eyebrow: 'Control',
        title: 'Categorías de gasto',
        description: 'Catálogo dinámico para clasificar los costos del taller.',
        action: 'Nueva categoría',
        filters: [],
        headers: ['Categoría', 'Descripción', 'Último movimiento', 'Estado', 'Acciones'],
        rows: data.categorias.map((category) => [
          <strong>{category.nombre}</strong>,
          category.descripcion ?? '—',
          fechaCorta(category.creadoEn),
          <Badge tone={category.activa ? 'success' : 'neutral'}>
            {category.activa ? 'Activa' : 'Inactiva'}
          </Badge>,
          <RowActions>
            <ViewButton
              label={`la categoría ${category.nombre}`}
              onClick={() =>
                actions.details(category.nombre, [
                  ['Descripción', category.descripcion ?? '—'],
                  ['Creado', fechaCorta(category.creadoEn)],
                  ['Estado', category.activa ? 'Activa' : 'Inactiva'],
                ])
              }
            />
            <Button variant="ghost" onClick={() => actions.toggleCategoria(category)}>
              {category.activa ? 'Desactivar' : 'Activar'}
            </Button>
          </RowActions>,
        ]),
      }
    case 'sucursales':
      return {
        eyebrow: 'Administración',
        title: 'Sucursales',
        description: 'Gestione las sedes y sus administradores enlazadas.',
        action: 'Nueva sucursal',
        filters: [],
        headers: ['Sucursal', 'Departamento', 'Dirección', 'Estado'],
        rows: data.sucursales.map((branch) => [
          <CellStack title={branch.nombre} note={branch.telefono ?? '—'} />,
          branch.departamento ?? '—',
          branch.direccion ?? '—',
          <Badge tone={branch.activa ? 'success' : 'neutral'}>
            {branch.activa ? 'Activa' : 'Inactiva'}
          </Badge>,
        ]),
      }
    case 'usuarios': {
      const roleFilter = pick('role', 'Todos los roles')
      const statusFilter = pick('status', 'Todos')
      const roleMap: Record<string, string> = {
        'Administrador del sistema': 'ADMIN_SISTEMA',
        'Administrador de sucursal': 'ADMIN_SUCURSAL',
        Cliente: 'CLIENTE',
      }
      const users = data.usuarios.filter(
        (user) =>
          (roleFilter === 'Todos los roles' || user.rol === roleMap[roleFilter]) &&
          (statusFilter === 'Todos' ||
            (statusFilter === 'Activos' && user.activo) ||
            (statusFilter === 'Inactivos' && !user.activo)),
      )
      return {
        eyebrow: 'Administración',
        title: 'Usuarios',
        description: 'Administre accesos, roles y sucursales enlazadas.',
        action: 'Nuevo usuario',
        filters: [],
        filterDefs: [
          {
            key: 'role',
            label: 'Rol',
            options: ['Todos los roles', 'Administrador del sistema', 'Administrador de sucursal'],
          },
          { key: 'status', label: 'Estado', options: ['Todos', 'Activos', 'Inactivos'] },
        ],
        headers: ['Usuario', 'Rol', 'Sucursal', 'Estado'],
        rows: users.map((user) => [
          <div className="person">
            <Avatar name={user.nombreCompleto} small />
            <span>
              <strong>{user.nombreCompleto}</strong>
              <small className="cell-note">{user.correo}</small>
            </span>
          </div>,
          rolLabel(user.rol),
          user.nombreSucursal ?? '—',
          <Badge tone={user.activo ? 'success' : 'neutral'}>
            {user.activo ? 'Activo' : 'Inactivo'}
          </Badge>,
        ]),
      }
    }
    default:
      throw new Error(`Recurso desconocido: ${type}`)
  }
}

const FILTER_DEFAULTS: Record<string, Record<string, string>> = {
  viajes: { state: 'Todos los estados', type: 'Todos los tipos' },
  buses: { state: 'Todos los estados' },
  choferes: { license: 'Todas las licencias' },
  rutas: { destination: 'Todos los destinos' },
  alquileres: { state: 'Todos los estados' },
  taller: { bus: 'Todos los buses' },
  usuarios: { role: 'Todos los roles', status: 'Todos' },
}

interface ResourceListPageProps {
  type: string
}

interface EditingRecord {
  page: string
  record: Record<string, string | number | boolean | null>
}

const PAGINAS_SOLO_ESCRITURA_SUCURSAL = new Set([
  'viajes',
  'buses',
  'choferes',
  'rutas',
  'taller',
  'alquileres',
])

export function ResourceListPage({ type }: ResourceListPageProps) {
  const { role } = useAuth()
  const soloLectura = role === 'Administrador del sistema' && PAGINAS_SOLO_ESCRITURA_SUCURSAL.has(type)
  const [filters] = useState<Record<string, string>>(() => ({
    ...(FILTER_DEFAULTS[type] ?? {}),
  }))
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<EditingRecord | null>(null)
  const [flowId, setFlowId] = useState<string | null>(null)
  const [data, setData] = useState<ListData>(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [detail, setDetail] = useState<DetailState | null>(null)
  const toast = useToast()

  const reload = useCallback(() => setReloadKey((value) => value + 1), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const loaders: Array<Promise<void>> = []

        loaders.push(
          listarSucursales({ size: 100 }).then((pagina) => {
            if (!cancelled) setData((prev) => ({ ...prev, sucursales: pagina.contenido }))
          }),
        )

        if (type === 'buses') {
          loaders.push(
            listarBuses({ size: 100 }).then((pagina) => {
              if (!cancelled) setData((prev) => ({ ...prev, buses: pagina.contenido }))
            }),
          )
        }
        if (type === 'choferes') {
          loaders.push(
            listarChoferes({ size: 100 }).then((pagina) => {
              if (!cancelled) setData((prev) => ({ ...prev, choferes: pagina.contenido }))
            }),
          )
        }
        if (type === 'viajes') {
          loaders.push(
            listarViajes().then((viajes) => {
              if (!cancelled) setData((prev) => ({ ...prev, viajes }))
            }),
          )
        }
        if (type === 'rutas') {
          loaders.push(
            listarRutas().then((rutas) => {
              if (!cancelled) setData((prev) => ({ ...prev, rutas }))
            }),
          )
        }
        if (type === 'alquileres') {
          loaders.push(
            listarAlquileres({ tamano: 100 }).then((pagina) => {
              if (!cancelled) setData((prev) => ({ ...prev, alquileres: pagina.contenido }))
            }),
          )
        }
        if (type === 'taller') {
          loaders.push(
            Promise.all([
              listarBuses({ size: 100 }).then((pagina) => pagina.contenido),
              listarGastosTaller({ tamano: 100 }).then((pagina) => pagina.contenido),
            ]).then(([buses, gastos]) => {
              if (!cancelled) setData((prev) => ({ ...prev, buses, gastos }))
            }),
          )
        }
        if (type === 'categorias') {
          loaders.push(
            listarCategorias().then((categorias) => {
              if (!cancelled) setData((prev) => ({ ...prev, categorias }))
            }),
          )
        }
        if (type === 'usuarios') {
          loaders.push(
            Promise.all([
              listarUsuarios({ size: 200 }).then((pagina) => pagina.contenido),
              listarSucursales({ size: 100 }).then((pagina) => pagina.contenido),
            ]).then(([usuarios, sucursalesList]) => {
              if (!cancelled)
                setData((prev) => ({ ...prev, usuarios, sucursales: sucursalesList }))
            }),
          )
        }
        if (type === 'sucursales') {
          loaders.push(
            listarSucursales({ size: 100 }).then((pagina) => {
              if (!cancelled) setData((prev) => ({ ...prev, sucursales: pagina.contenido }))
            }),
          )
        }

        await Promise.all(loaders)
        if (!cancelled) {
          setError(null)
          setLoading(false)
        }
      } catch (caught) {
        if (!cancelled) {
          const message = errorMessage(caught)
          setError(message)
          toast.error(message)
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [type, reloadKey, toast])

  const run = useCallback(
    async (action: () => Promise<unknown>, successMessage = 'La operación se completó correctamente.') => {
      try {
        await action()
        reload()
        toast.success(successMessage)
      } catch (caught) {
        const message = errorMessage(caught)
        setError(message)
        toast.error(message)
      }
    },
    [reload, toast],
  )

  const actions: ConfigActions = useMemo(
    () => ({
      edit: (page, record) => setEditing({ page, record }),
      flow: (id) => setFlowId(id),
      details: (title, items, images) => setDetail({ title, items, images }),
      deleteRuta: (ruta) => void run(() => eliminarRuta(ruta.id), 'Ruta eliminada.'),
      deleteViaje: (viaje) => void run(() => eliminarViaje(viaje.id), 'Viaje eliminado.'),
      toggleCategoria: (categoria) =>
        void run(() => desactivarCategoria(categoria.id, !categoria.activa), 'Estado de la categoría actualizado.'),
    }),
    [run],
  )

  const config = useMemo(() => {
    try {
      return buildResourceConfig(type, filters, data, actions, soloLectura)
    } catch {
      return {
        eyebrow: '',
        title: type,
        description: '',
        action: '',
        filters: [],
        headers: [],
        rows: [],
      }
    }
  }, [type, filters, data, actions, soloLectura])

  if (loading) {
    return (
      <section className="surface list-surface">
        <div className="filter-empty">
          <span>
            <Icon name="clock" />
          </span>
          <strong>Cargando {config.title.toLowerCase()}…</strong>
          <p>Consultando el microservicio a través del gateway.</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="surface list-surface">
        {error && (
          <div className="info-note danger-copy" style={{ margin: '0 0 1rem' }}>
            {error}{' '}
            <button type="button" className="field-action" onClick={reload}>
              Reintentar
            </button>
          </div>
        )}
        {soloLectura && (
          <div className="info-note" style={{ margin: '0 0 1rem' }}>
            Vista de solo lectura: la gestión de este recurso corresponde al administrador de la
            sucursal.
          </div>
        )}
        <FilterToolbar
          action={soloLectura ? undefined : config.action}
          onAction={() => setShowAdd(true)}
        />
        {config.rows.length ? (
          <DataTable headers={config.headers} rows={config.rows} />
        ) : (
          <div className="filter-empty">
            <span>
              <Icon name="plus" />
            </span>
            <strong>Aún no hay registros</strong>
            <p>Cuando se agregue información aparecerá aquí.</p>
          </div>
        )}
        <div className="pagination">
          <span>
            Mostrando {config.rows.length ? `1–${config.rows.length}` : '0'} de {config.rows.length}
          </span>
          <div>
            <button disabled>‹</button>
            <button className="active">1</button>
            <button disabled>›</button>
          </div>
        </div>
      </section>
      <FlowBar page={type} onOpen={setFlowId} />
      {showAdd && (
        <AddRecordModal
          page={type}
          sucursales={data.sucursales}
          buses={data.buses}
          choferes={data.choferes}
          rutas={data.rutas}
          categorias={data.categorias}
          onClose={() => {
            setShowAdd(false)
            reload()
          }}
        />
      )}
      {editing && (
        <AddRecordModal
          page={editing.page}
          initial={editing.record}
          sucursales={data.sucursales}
          buses={data.buses}
          choferes={data.choferes}
          rutas={data.rutas}
          categorias={data.categorias}
          onClose={() => {
            setEditing(null)
            reload()
          }}
        />
      )}
      {flowId && <FlowModal flowId={flowId} onClose={() => setFlowId(null)} />}
      {detail && (
        <DetailModal
          title={detail.title}
          items={detail.items}
          images={detail.images}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  )
}

export type { BusResponse, ChoferResponse, ViajeResponse, RutaResponse }
