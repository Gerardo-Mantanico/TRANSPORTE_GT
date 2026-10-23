import { useMemo, useState } from 'react'
import {
  BUSES,
  EXPENSE_CATEGORIES,
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
