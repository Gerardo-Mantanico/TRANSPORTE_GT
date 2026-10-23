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
  taller: { bus: 'Todos los buses' },
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
