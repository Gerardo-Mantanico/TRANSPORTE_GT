import { useMemo, useState } from 'react'
import {
  BUSES,
  BRANCHES,
  EXPENSE_CATEGORIES,
  RENTALS,
  ROUTES,
  TODAY,
  TODAY_TRIPS,
  WORKSHOP_EXPENSES,
} from '../../data/mock'
import type { ResourceConfig, ResourceFilterDef, TableRow } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { FilterToolbar } from '../../components/ui/FilterToolbar'
import { Icon } from '../../components/ui/Icon'
import { cellText } from '../../utils/cellText'
import { AddRecordModal } from '../modals/AddRecordModal'
import { FlowBar, FlowModal } from '../modals/flows'

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

interface ConfigActions {
  edit: (page: string, record: Record<string, string | number>) => void
  flow: (flowId: string) => void
}

function buildResourceConfig(
  type: string,
  filters: Record<string, string>,
  actions: ConfigActions,
): ResourceConfig {
  const pick = (key: string, fallback: string) => filters[key] ?? fallback

  switch (type) {
    case 'viajes': {
      const stateFilter = pick('state', 'Todos los estados')
      const typeFilter = pick('type', 'Todos los tipos')
      const trips = TODAY_TRIPS.filter(
        (trip) =>
          (stateFilter === 'Todos los estados' || trip.state === stateFilter) &&
          (typeFilter === 'Todos los tipos' || trip.type === typeFilter),
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
            options: ['Todos los estados', 'Programado', 'En tránsito', 'Completado'],
          },
          { key: 'type', label: 'Tipo', options: ['Todos los tipos', 'Regular', 'Alquiler privado'] },
        ],
        headers: ['Ruta', 'Tipo', 'Salida', 'Bus / Chofer', 'Estado', 'Acciones'],
        rows: trips.map((trip) => [
          <strong>{trip.route}</strong>,
          trip.type,
          `${TODAY} · ${trip.time}`,
          <CellStack title={trip.bus} note={trip.driver} />,
          <Badge tone={trip.tone}>{trip.state}</Badge>,
          <RowActions>
            <Button
              variant="ghost"
              onClick={() =>
                actions.flow(
                  trip.state === 'En tránsito'
                    ? 'VJ-05'
                    : trip.state === 'Programado'
                      ? 'VJ-04'
                      : 'VJ-03',
                )
              }
            >
              {trip.state === 'En tránsito'
                ? 'Registrar llegada'
                : trip.state === 'Programado'
                  ? 'Registrar salida'
                  : 'Ver detalle'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => actions.flow(trip.state === 'Programado' ? 'VJ-06' : 'VJ-06-G')}
            >
              Eliminar
            </Button>
          </RowActions>,
        ]),
      }
    }
    case 'rutas': {
      const destinationFilter = pick('destination', 'Todos los destinos')
      const routes = ROUTES.filter(
        (route) => destinationFilter === 'Todos los destinos' || route.destination === destinationFilter,
      )
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
            options: ['Todos los destinos', ...BRANCHES.map((branch) => branch.name)],
          },
        ],
        headers: ['Ruta', 'Distancia', 'Precio', 'Viajes asociados', 'Estado', 'Acciones'],
        rows: routes.map((route) => [
          <strong>
            {route.origin} <span className="route-arrow">→</span> {route.destination}
          </strong>,
          route.distance,
          route.price,
          String(route.trips),
          <Badge tone="success">Activa</Badge>,
          <RowActions>
            <Button
              variant="ghost"
              onClick={() =>
                actions.edit('rutas', {
                  origin: route.origin,
                  destination: route.destination,
                  distance: route.distance,
                  price: route.price,
                })
              }
            >
              Editar
            </Button>
            <Button
              variant="ghost"
              onClick={() => actions.flow(route.trips > 0 ? 'G3' : 'GEN-DEACT')}
            >
              Eliminar
            </Button>
          </RowActions>,
        ]),
      }
    }
    case 'alquileres': {
      const stateFilter = pick('state', 'Todos los estados')
      const rentals = RENTALS.filter(
        (rental) => stateFilter === 'Todos los estados' || rental.state === stateFilter,
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
            options: ['Todos los estados', 'Pendiente', 'Confirmado', 'Pagado'],
          },
        ],
        headers: ['Cliente / Trayecto', 'Fecha', 'Pasajeros', 'Precio', 'Asignación', 'Estado'],
        rows: rentals.map((rental) => [
          <CellStack title={rental.client} note={rental.route} />,
          rental.date,
          String(rental.passengers),
          <strong>{rental.price}</strong>,
          rental.assignment,
          <Badge tone={rental.tone}>{rental.state}</Badge>,
        ]),
      }
    }
    case 'taller': {
      const busFilter = pick('bus', 'Todos los buses')
      const expenses = WORKSHOP_EXPENSES.filter(
        (expense) => busFilter === 'Todos los buses' || expense.bus === busFilter,
      )
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
            options: ['Todos los buses', ...BUSES.map((bus) => bus.plate)],
          },
        ],
        headers: ['Bus / Servicio', 'Fecha', 'Categorías', 'Líneas', 'Tipo', 'Total', 'Acciones'],
        rows: expenses.map((expense) => [
          <CellStack title={expense.bus} note={expense.service} />,
          expense.date,
          <span className="chip">{expense.categories}</span>,
          expense.lines,
          expense.type,
          <strong>{expense.total}</strong>,
          <Button variant="ghost" onClick={() => actions.flow('TR-02-D')}>
            Ver detalle
          </Button>,
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
        headers: ['Categoría', 'Gastos asociados', 'Último movimiento', 'Estado', 'Acciones'],
        rows: EXPENSE_CATEGORIES.map((category) => [
          <strong>{category.name}</strong>,
          String(category.expenses),
          category.lastMove,
          <Badge tone="success">Activa</Badge>,
          <RowActions>
            <Button
              variant="ghost"
              onClick={() =>
                actions.edit('categorias', { name: category.name, state: 'Activa' })
              }
            >
              Editar
            </Button>
            <Button
              variant="ghost"
              onClick={() => actions.flow(category.expenses > 0 ? 'TR-04' : 'GEN-DEACT')}
            >
              Desactivar
            </Button>
          </RowActions>,
        ]),
      }
    default:
      throw new Error(`Recurso desconocido: ${type}`)
  }
}

const FILTER_DEFAULTS: Record<string, Record<string, string>> = {
  viajes: { state: 'Todos los estados', type: 'Todos los tipos' },
  rutas: { destination: 'Todos los destinos' },
  alquileres: { state: 'Todos los estados' },
  taller: { bus: 'Todos los buses' },
}

interface ResourceListPageProps {
  type: string
}

interface EditingRecord {
  page: string
  record: Record<string, string | number>
}

export function ResourceListPage({ type }: ResourceListPageProps) {
  const [filters, setFilters] = useState<Record<string, string>>(() => ({
    ...(FILTER_DEFAULTS[type] ?? {}),
  }))
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<EditingRecord | null>(null)
  const [flowId, setFlowId] = useState<string | null>(null)

  const actions: ConfigActions = useMemo(
    () => ({
      edit: (page, record) => setEditing({ page, record }),
      flow: (id) => setFlowId(id),
    }),
    [],
  )

  const config = useMemo(
    () => buildResourceConfig(type, filters, actions),
    [type, filters, actions],
  )

  const filterDefs: ResourceFilterDef[] = config.filterDefs ?? []

  const filteredRows = useMemo(
    () =>
      config.rows.filter((row) =>
        cellText(row as TableRow).toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es')),
      ),
    [config.rows, search],
  )

  return (
    <>
      <section className="surface list-surface">
        <FilterToolbar
          searchPlaceholder={`Buscar en ${config.title.toLowerCase()}...`}
          onSearch={setSearch}
          action={config.action}
          onAction={() => setShowAdd(true)}
        >
          {filterDefs.map((def) => (
            <label className="field" key={def.key}>
              <span className="field-label">
                <span>{def.label}</span>
              </span>
              <select
                value={filters[def.key] ?? def.options[0]}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, [def.key]: event.target.value }))
                }
              >
                {def.options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          ))}
        </FilterToolbar>
        {filteredRows.length ? (
          <DataTable headers={config.headers} rows={filteredRows} />
        ) : (
          <div className="filter-empty">
            <span>
              <Icon name="search" />
            </span>
            <strong>No encontramos resultados</strong>
            <p>Pruebe con otro término o restablezca los filtros.</p>
          </div>
        )}
        <div className="pagination">
          <span>
            Mostrando {filteredRows.length ? `1–${filteredRows.length}` : '0'} de {config.rows.length}
          </span>
          <div>
            <button disabled>‹</button>
            <button className="active">1</button>
            <button disabled>›</button>
          </div>
        </div>
      </section>
      <FlowBar page={type} onOpen={setFlowId} />
      {showAdd && <AddRecordModal page={type} onClose={() => setShowAdd(false)} />}
      {editing && (
        <AddRecordModal
          page={editing.page}
          initial={editing.record}
          onClose={() => setEditing(null)}
        />
      )}
      {flowId && <FlowModal flowId={flowId} onClose={() => setFlowId(null)} />}
    </>
  )
}
