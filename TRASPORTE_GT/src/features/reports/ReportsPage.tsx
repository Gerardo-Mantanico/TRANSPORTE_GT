import { useMemo, useState, type ReactNode } from 'react'
import {
  BUSES,
  BRANCHES,
  DEPRECIATION_RATE,
  DEMAND_ROUTES,
  DRIVERS,
  EXPENSE_ENTRIES,
  INCOME_ENTRIES,
  RENTAL_REVENUE,
  ROUTES,
  SYSTEM_REPORTS,
  BRANCH_REPORTS,
  TICKET_REVENUE,
  TODAY,
  WORKSHOP_LINES,
  BUS_KM,
  type LedgerEntry,
} from '../../data/mock'
import type { IconName } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { LeafletRouteMap } from '../../components/domain/LeafletRouteMap'
import { exportToPdf, formatQ, formatQCompact, formatDateEs } from '../../utils/format'

interface FilterDef {
  key: string
  label: string
  options: string[]
}

interface ReportFilters {
  allRecords: boolean
  from: string
  to: string
  selects: Record<string, string>
}

interface BuiltReport {
  headers: string[]
  rows: ReactNode[][]
  grandLabel: string
  grandValue: string
  mainStat: string
  mainStatLabel: string
  secondaryStat: string
  secondaryStatLabel: string
  mapRoutes?: { origin: string; destination: string; label?: string }[]
}

interface ReportDef {
  title: string
  subtitle: string
  icon: IconName
  filterDefs: FilterDef[]
  build: (filters: ReportFilters) => BuiltReport
}

function defaultFilters(): ReportFilters {
  return { allRecords: true, from: TODAY, to: TODAY, selects: {} }
}

function inRange(entry: { date: string }, filters: ReportFilters) {
  if (filters.allRecords) return true
  return entry.date >= filters.from && entry.date <= filters.to
}

function subtotalRow(label: string, value: string, span: number): ReactNode[] {
  const cells: ReactNode[] = Array.from({ length: span }, (_, index) => (
    <span className="subtotal-cell" key={index}>
      {index === 0 ? <strong>{label}</strong> : index === span - 1 ? <strong>{value}</strong> : ''}
    </span>
  ))
  return cells
}

function groupLedger(
  entries: LedgerEntry[],
  filters: ReportFilters,
): { branch: string; items: LedgerEntry[]; subtotal: number }[] {
  const filtered = entries.filter((entry) => inRange(entry, filters))
  const branches = BRANCHES.map((branch) => branch.name).sort((a, b) => a.localeCompare(b, 'es'))
  return branches
    .map((branch) => {
      const items = filtered.filter((entry) => entry.branch === branch)
      return { branch, items, subtotal: items.reduce((sum, item) => sum + item.amount, 0) }
    })
    .filter((group) => group.items.length > 0)
}

const SYSTEM_REPORT_DEFS: ReportDef[] = [
  {
    title: SYSTEM_REPORTS[0][0],
    subtitle: SYSTEM_REPORTS[0][1],
    icon: SYSTEM_REPORTS[0][4] as IconName,
    filterDefs: [],
    build: (filters) => {
      const groups = groupLedger(INCOME_ENTRIES, filters)
      const rows: ReactNode[][] = []
      let total = 0
      groups.forEach((group) => {
        group.items.forEach((item) => {
          rows.push([
            item.branch,
            formatDateEs(item.date),
            item.concept,
            item.source,
            formatQCompact(item.amount),
          ])
        })
        rows.push(subtotalRow(`Subtotal ${group.branch}`, formatQCompact(group.subtotal), 5))
        total += group.subtotal
      })
      return {
        headers: ['Sucursal', 'Fecha', 'Concepto', 'Origen del ingreso', 'Monto'],
        rows,
        grandLabel: 'TOTAL GLOBAL DE INGRESOS',
        grandValue: formatQCompact(total),
        mainStat: formatQCompact(total),
        mainStatLabel: 'Ingresos en el periodo',
        secondaryStat: `${groups.length} sucursales`,
        secondaryStatLabel: 'Con actividad',
      }
    },
  },
  {
    title: SYSTEM_REPORTS[1][0],
    subtitle: SYSTEM_REPORTS[1][1],
    icon: SYSTEM_REPORTS[1][4] as IconName,
    filterDefs: [],
    build: (filters) => {
      const groups = groupLedger(EXPENSE_ENTRIES, filters)
      const rows: ReactNode[][] = []
      let total = 0
      groups.forEach((group) => {
        group.items.forEach((item) => {
          rows.push([
            item.branch,
            formatDateEs(item.date),
            item.concept,
            item.source,
            formatQCompact(item.amount),
          ])
        })
        rows.push(subtotalRow(`Subtotal ${group.branch}`, formatQCompact(group.subtotal), 5))
        total += group.subtotal
      })
      return {
        headers: ['Sucursal', 'Fecha', 'Concepto', 'Tipo de gasto', 'Monto'],
        rows,
        grandLabel: 'TOTAL GLOBAL DE GASTOS',
        grandValue: formatQCompact(total),
        mainStat: formatQCompact(total),
        mainStatLabel: 'Gastos en el periodo',
        secondaryStat: `${groups.length} sucursales`,
        secondaryStatLabel: 'Con gastos',
      }
    },
  },
  {
    title: SYSTEM_REPORTS[2][0],
    subtitle: SYSTEM_REPORTS[2][1],
    icon: SYSTEM_REPORTS[2][4] as IconName,
    filterDefs: [{ key: 'branch', label: 'Sucursal', options: ['Todas las sucursales', ...BRANCHES.map((b) => b.name)] }],
    build: (filters) => {
      const branchFilter = filters.selects.branch ?? 'Todas las sucursales'
      const incomeGroups = groupLedger(INCOME_ENTRIES, filters)
      const expenseGroups = groupLedger(EXPENSE_ENTRIES, filters)
      const names = BRANCHES.map((branch) => branch.name)
        .sort((a, b) => a.localeCompare(b, 'es'))
        .filter((name) => branchFilter === 'Todas las sucursales' || name === branchFilter)

      let tIn = 0
      let tCost = 0
      const rows = names.map((name) => {
        const income = incomeGroups.find((group) => group.branch === name)?.subtotal ?? 0
        const cost = expenseGroups.find((group) => group.branch === name)?.subtotal ?? 0
        tIn += income
        tCost += cost
        return [
          name,
          formatQCompact(income),
          formatQCompact(cost),
          <strong>{formatQCompact(income - cost)}</strong>,
        ]
      })
      rows.push([
        <strong>TOTAL GENERAL</strong>,
        <strong>{formatQCompact(tIn)}</strong>,
        <strong>{formatQCompact(tCost)}</strong>,
        <strong>{formatQCompact(tIn - tCost)}</strong>,
      ])
      return {
        headers: ['Sucursal', 'Ingresos', 'Costos', 'Ganancia neta'],
        rows,
        grandLabel: 'GANANCIA NETA GLOBAL',
        grandValue: formatQCompact(tIn - tCost),
        mainStat: formatQCompact(tIn - tCost),
        mainStatLabel: 'Ganancia neta',
        secondaryStat: `${formatQCompact(tIn)} / ${formatQCompact(tCost)}`,
        secondaryStatLabel: 'Ingresos / Costos',
      }
    },
  },
  {
    title: SYSTEM_REPORTS[3][0],
    subtitle: SYSTEM_REPORTS[3][1],
    icon: SYSTEM_REPORTS[3][4] as IconName,
    filterDefs: [],
    build: () => {
      const sorted = [...DEMAND_ROUTES].sort((a, b) => b.tickets - a.tickets)
      const totalTickets = sorted.reduce((sum, route) => sum + route.tickets, 0)
      const totalRevenue = sorted.reduce((sum, route) => sum + route.revenue, 0)
      const rows = sorted.map((route, index) => [
        <strong>#{index + 1}</strong>,
        `${route.origin} → ${route.destination}`,
        route.distance,
        route.price,
        String(route.tickets),
        formatQCompact(route.revenue),
      ])
      return {
        headers: ['#', 'Ruta', 'Distancia', 'Precio boleto', 'Boletos vendidos', 'Ingresos'],
        rows,
        grandLabel: 'TOTAL DE BOLETOS VENDIDOS',
        grandValue: `${totalTickets.toLocaleString('es-GT')} boletos · ${formatQCompact(totalRevenue)}`,
        mainStat: totalTickets.toLocaleString('es-GT'),
        mainStatLabel: 'Boletos vendidos',
        secondaryStat: formatQCompact(totalRevenue),
        secondaryStatLabel: 'Ingresos por boletos',
      }
    },
  },
  {
    title: SYSTEM_REPORTS[4][0],
    subtitle: SYSTEM_REPORTS[4][1],
    icon: SYSTEM_REPORTS[4][4] as IconName,
    filterDefs: [
      { key: 'branch', label: 'Sucursal', options: ['Todas las sucursales', ...BRANCHES.map((b) => b.name)] },
      { key: 'bus', label: 'Bus', options: ['Todos los buses', ...BUSES.map((b) => b.plate)] },
    ],
    build: (filters) => {
      const branchFilter = filters.selects.branch ?? 'Todas las sucursales'
      const busFilter = filters.selects.bus ?? 'Todos los buses'
      const lines = WORKSHOP_LINES.filter(
        (line) =>
          inRange(line, filters) &&
          (branchFilter === 'Todas las sucursales' || line.branch === branchFilter) &&
          (busFilter === 'Todos los buses' || line.bus === busFilter),
      )
      const categories = [...new Set(lines.map((line) => line.category))].sort((a, b) =>
        a.localeCompare(b, 'es'),
      )
      const rows: ReactNode[][] = []
      let grand = 0
      categories.forEach((category) => {
        const categoryLines = lines.filter((line) => line.category === category)
        categoryLines.forEach((line) => {
          rows.push([
            line.category,
            line.bus,
            formatDateEs(line.date),
            line.description,
            formatQ(line.amount),
          ])
        })
        const subtotal = categoryLines.reduce((sum, line) => sum + line.amount, 0)
        rows.push(subtotalRow(`Subtotal ${category}`, formatQ(subtotal), 5))
        grand += subtotal
      })
      return {
        headers: ['Categoría', 'Bus', 'Fecha', 'Descripción', 'Monto'],
        rows,
        grandLabel: 'GRAN TOTAL DE TALLER',
        grandValue: formatQ(grand),
        mainStat: formatQ(grand),
        mainStatLabel: 'Gastos de taller',
        secondaryStat: `${categories.length} categorías`,
        secondaryStatLabel: 'Con movimientos',
      }
    },
  },
  {
    title: SYSTEM_REPORTS[5][0],
    subtitle: SYSTEM_REPORTS[5][1],
    icon: SYSTEM_REPORTS[5][4] as IconName,
    filterDefs: [{ key: 'branch', label: 'Sucursal de origen', options: ['Todas las sucursales', ...BRANCHES.map((b) => b.name)] }],
    build: (filters) => {
      const branchFilter = filters.selects.branch ?? 'Todas las sucursales'
      const routes = ROUTES.filter(
        (route) => branchFilter === 'Todas las sucursales' || route.origin === branchFilter,
      )
      return {
        headers: ['Sucursal de origen', 'Destino', 'Distancia', 'Precio', 'Viajes programados'],
        rows: routes.map((route) => [
          route.origin,
          route.destination,
          route.distance,
          route.price,
          String(route.trips),
        ]),
        grandLabel: 'RUTAS EN EL MAPA',
        grandValue: `${routes.length} rutas${branchFilter === 'Todas las sucursales' ? '' : ` desde ${branchFilter}`}`,
        mainStat: String(routes.length),
        mainStatLabel: 'Rutas trazadas',
        secondaryStat: branchFilter,
        secondaryStatLabel: 'Filtro aplicado',
        mapRoutes: routes.map((route) => ({
          origin: route.origin,
          destination: route.destination,
          label: `${route.distance} · ${route.price}`,
        })),
      }
    },
  },
]

const BRANCH_REPORT_DEFS: ReportDef[] = [
  {
    title: BRANCH_REPORTS[0][0],
    subtitle: BRANCH_REPORTS[0][1],
    icon: BRANCH_REPORTS[0][4] as IconName,
    filterDefs: [{ key: 'state', label: 'Estado operativo', options: ['Todos los estados', 'Operativo', 'En taller', 'Inactivo'] }],
    build: (filters) => {
      const stateFilter = filters.selects.state ?? 'Todos los estados'
      const buses = BUSES.filter((bus) => stateFilter === 'Todos los estados' || bus.state === stateFilter)
      const rows = buses.map((bus) => [
        <strong>{bus.plate}</strong>,
        bus.brand,
        bus.model,
        `${bus.capacity} pas.`,
        bus.driver,
        bus.mileage,
        String(bus.trips),
        <Badge tone={bus.state === 'Operativo' ? 'success' : bus.state === 'En taller' ? 'warning' : 'neutral'}>
          {bus.state}
        </Badge>,
      ])
      return {
        headers: ['Placa', 'Marca', 'Modelo', 'Capacidad', 'Chofer asignado', 'Kilometraje', 'Total viajes', 'Estado'],
        rows,
        grandLabel: 'TOTAL DE BUSES',
        grandValue: `${buses.length} buses · ${buses.filter((bus) => bus.state === 'Operativo').length} operativos`,
        mainStat: String(buses.length),
        mainStatLabel: 'Buses listados',
        secondaryStat: String(buses.reduce((sum, bus) => sum + bus.trips, 0)),
        secondaryStatLabel: 'Viajes acumulados',
      }
    },
  },
  {
    title: BRANCH_REPORTS[1][0],
    subtitle: BRANCH_REPORTS[1][1],
    icon: BRANCH_REPORTS[1][4] as IconName,
    filterDefs: [{ key: 'state', label: 'Estado de licencia', options: ['Todos los estados', 'Vigente', 'Vence en 15 días', 'Vence en 3 días'] }],
    build: (filters) => {
      const stateFilter = filters.selects.state ?? 'Todos los estados'
      const drivers = DRIVERS.filter(
        (driver) => stateFilter === 'Todos los estados' || driver.expiryState === stateFilter,
      )
      const rows = drivers.map((driver) => [
        driver.license,
        driver.name,
        `Tipo ${driver.licenseType}`,
        formatDateEs(driver.expiry),
        String(driver.trips),
        <Badge tone={driver.tone}>{driver.expiryState}</Badge>,
      ])
      return {
        headers: ['Licencia', 'Nombre completo', 'Tipo', 'Fecha de vencimiento', 'Total viajes', 'Estado'],
        rows,
        grandLabel: 'TOTAL DE CHOFERES',
        grandValue: `${drivers.length} choferes · ${drivers.filter((driver) => driver.expiryState !== 'Vigente').length} por vencer`,
        mainStat: String(drivers.length),
        mainStatLabel: 'Choferes listados',
        secondaryStat: String(drivers.reduce((sum, driver) => sum + driver.trips, 0)),
        secondaryStatLabel: 'Viajes acumulados',
      }
    },
  },
  {
    title: BRANCH_REPORTS[2][0],
    subtitle: BRANCH_REPORTS[2][1],
    icon: BRANCH_REPORTS[2][4] as IconName,
    filterDefs: [
      { key: 'route', label: 'Ruta', options: ['Todas las rutas', ...[...new Set(TICKET_REVENUE.map((row) => row.route))]] },
      { key: 'bus', label: 'Bus', options: ['Todos los buses', ...[...new Set(TICKET_REVENUE.map((row) => row.bus))]] },
    ],
    build: (filters) => {
      const routeFilter = filters.selects.route ?? 'Todas las rutas'
      const busFilter = filters.selects.bus ?? 'Todos los buses'
      const rowsData = TICKET_REVENUE.filter(
        (row) =>
          inRange(row, filters) &&
          (routeFilter === 'Todas las rutas' || row.route === routeFilter) &&
          (busFilter === 'Todos los buses' || row.bus === busFilter),
      )
      const tickets = rowsData.reduce((sum, row) => sum + row.tickets, 0)
      const income = rowsData.reduce((sum, row) => sum + row.income, 0)
      return {
        headers: ['Fecha', 'Hora del viaje', 'Ruta', 'Bus', 'Boletos vendidos', 'Ingreso total'],
        rows: rowsData.map((row) => [
          formatDateEs(row.date),
          row.trip,
          row.route,
          row.bus,
          String(row.tickets),
          <strong>{formatQ(row.income)}</strong>,
        ]),
        grandLabel: 'TOTAL DE INGRESOS POR BOLETOS',
        grandValue: formatQ(income),
        mainStat: formatQ(income),
        mainStatLabel: 'Ingresos por boletos',
        secondaryStat: String(tickets),
        secondaryStatLabel: 'Boletos vendidos',
      }
    },
  },
  {
    title: BRANCH_REPORTS[3][0],
    subtitle: BRANCH_REPORTS[3][1],
    icon: BRANCH_REPORTS[3][4] as IconName,
    filterDefs: [],
    build: (filters) => {
      const rowsData = RENTAL_REVENUE.filter((row) => inRange(row, filters))
      const total = rowsData.reduce((sum, row) => sum + row.total, 0)
      return {
        headers: ['Fecha', 'Cliente', 'Origen', 'Destino', 'Fechas', 'Bus asignado', 'Precio total'],
        rows: rowsData.map((row) => [
          formatDateEs(row.date),
          row.client,
          row.origin,
          row.destination,
          row.period,
          row.bus,
          <strong>{formatQ(row.total)}</strong>,
        ]),
        grandLabel: 'TOTAL DE INGRESOS POR ALQUILERES',
        grandValue: formatQ(total),
        mainStat: formatQ(total),
        mainStatLabel: 'Ingresos por alquileres',
        secondaryStat: String(rowsData.length),
        secondaryStatLabel: 'Alquileres registrados',
      }
    },
  },
  {
    title: BRANCH_REPORTS[4][0],
    subtitle: BRANCH_REPORTS[4][1],
    icon: BRANCH_REPORTS[4][4] as IconName,
    filterDefs: [],
    build: () => {
      const rows = BUS_KM.map((row) => {
        const depreciation = row.km * DEPRECIATION_RATE
        return [
          <strong>{row.plate}</strong>,
          row.branch,
          `${row.km.toLocaleString('es-GT')} km`,
          `${formatQ(DEPRECIATION_RATE)}/km`,
          <strong>{formatQ(depreciation)}</strong>,
        ]
      })
      const totalKm = BUS_KM.reduce((sum, row) => sum + row.km, 0)
      const totalDep = totalKm * DEPRECIATION_RATE
      return {
        headers: ['Bus', 'Sucursal', 'Kilómetros recorridos', 'Depreciación por km', 'Depreciación acumulada'],
        rows,
        grandLabel: 'DEPRECIACIÓN ACUMULADA TOTAL',
        grandValue: formatQ(totalDep),
        mainStat: formatQ(totalDep),
        mainStatLabel: 'Depreciación acumulada',
        secondaryStat: `${totalKm.toLocaleString('es-GT')} km`,
        secondaryStatLabel: 'Kilómetros totales',
      }
    },
  },
  {
    title: BRANCH_REPORTS[5][0],
    subtitle: BRANCH_REPORTS[5][1],
    icon: BRANCH_REPORTS[5][4] as IconName,
    filterDefs: [{ key: 'bus', label: 'Bus', options: ['Todos los buses', ...BUSES.map((b) => b.plate)] }],
    build: (filters) => {
      const busFilter = filters.selects.bus ?? 'Todos los buses'
      const lines = WORKSHOP_LINES.filter(
        (line) => inRange(line, filters) && (busFilter === 'Todos los buses' || line.bus === busFilter),
      )
      const buses = [...new Set(lines.map((line) => line.bus))].sort((a, b) => a.localeCompare(b, 'es'))
      const rows: ReactNode[][] = []
      let grand = 0
      buses.forEach((bus) => {
        const busLines = lines.filter((line) => line.bus === bus)
        const categories = [...new Set(busLines.map((line) => line.category))].sort((a, b) =>
          a.localeCompare(b, 'es'),
        )
        let busTotal = 0
        categories.forEach((category) => {
          const categoryLines = busLines.filter((line) => line.category === category)
          const subtotal = categoryLines.reduce((sum, line) => sum + line.amount, 0)
          busTotal += subtotal
          rows.push([
            bus,
            category,
            String(categoryLines.length),
            categoryLines.map((line) => line.description).join(' · '),
            <strong>{formatQ(subtotal)}</strong>,
          ])
        })
        rows.push(subtotalRow(`Total bus ${bus}`, formatQ(busTotal), 5))
        grand += busTotal
      })
      return {
        headers: ['Bus', 'Categoría', 'Líneas', 'Descripciones', 'Subtotal categoría'],
        rows,
        grandLabel: 'GRAN TOTAL DE TALLER',
        grandValue: formatQ(grand),
        mainStat: formatQ(grand),
        mainStatLabel: 'Gastos de taller',
        secondaryStat: `${buses.length} buses`,
        secondaryStatLabel: 'Con gastos registrados',
      }
    },
  },
]

interface ReportsPageProps {
  system?: boolean
}

export function ReportsPage({ system = false }: ReportsPageProps) {
  const reportDefs = system ? SYSTEM_REPORT_DEFS : BRANCH_REPORT_DEFS
  const reportCards = system ? SYSTEM_REPORTS : BRANCH_REPORTS
  const [selectedIndex, setSelectedIndex] = useState(system ? 2 : 0)
  const selected = reportDefs[selectedIndex]

  const [draft, setDraft] = useState<ReportFilters>(defaultFilters)
  const [applied, setApplied] = useState<ReportFilters>(defaultFilters)
  const [lastSelection, setLastSelection] = useState(`${system}-${selectedIndex}`)

  const selectionKey = `${system}-${selectedIndex}`
  if (lastSelection !== selectionKey) {
    setLastSelection(selectionKey)
    setDraft(defaultFilters())
    setApplied(defaultFilters())
  }

  const built = useMemo(() => selected.build(applied), [selected, applied])

  const periodLabel = applied.allRecords
    ? 'Todo el historial'
    : `${formatDateEs(applied.from)} — ${formatDateEs(applied.to)}`

  const setSelect = (key: string, value: string) =>
    setDraft((current) => ({ ...current, selects: { ...current.selects, [key]: value } }))

  return (
    <>
      <section className="report-grid">
        {reportCards.map(([title, subtitle], index) => (
          <button
            key={title}
            className={selectedIndex === index ? 'active' : ''}
            onClick={() => setSelectedIndex(index)}
          >
            <span>
              <Icon name={reportCards[index][4] as IconName} />
            </span>
            <div>
              <strong>{title}</strong>
              <small>{subtitle}</small>
            </div>
            <Icon name="chevron" size={16} />
          </button>
        ))}
      </section>
      <section className="surface report-detail">
        <div className="report-header">
          <div>
            <span className="eyebrow">Reporte seleccionado</span>
            <h2>{selected.title}</h2>
            <p>{selected.subtitle}</p>
          </div>
          <Button icon="download" onClick={exportToPdf}>
            Exportar PDF
          </Button>
        </div>
        <div className="filter-shell report-filters">
          <div className="filter-panel" style={{ display: 'block' }}>
            <div className="filters">
              <label className="check-row report-all-records">
                <input
                  type="checkbox"
                  checked={draft.allRecords}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, allRecords: event.target.checked }))
                  }
                />
                <span>
                  <strong>Todo el historial</strong>
                  <small>Si se desmarca, se filtra por el intervalo seleccionado.</small>
                </span>
              </label>
              <Field
                label="Desde"
                type="date"
                value={draft.from}
                onChange={(event) => setDraft((current) => ({ ...current, from: event.target.value }))}
              />
              <Field
                label="Hasta"
                type="date"
                value={draft.to}
                onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value }))}
              />
              {selected.filterDefs.map((def) => (
                <label className="field" key={def.key}>
                  <span className="field-label">
                    <span>{def.label}</span>
                  </span>
                  <select
                    value={draft.selects[def.key] ?? def.options[0]}
                    onChange={(event) => setSelect(def.key, event.target.value)}
                  >
                    {def.options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <div className="filter-actions">
              <button
                onClick={() => {
                  const reset = defaultFilters()
                  setDraft(reset)
                  setApplied(reset)
                }}
              >
                Restablecer
              </button>
              <Button variant="secondary" onClick={() => setApplied(draft)}>
                Aplicar filtros
              </Button>
            </div>
          </div>
        </div>
        <div className="report-stats">
          <div>
            <span>{built.mainStatLabel}</span>
            <strong>{built.mainStat}</strong>
          </div>
          <div>
            <span>{built.secondaryStatLabel}</span>
            <strong>{built.secondaryStat}</strong>
          </div>
          <div>
            <span>Periodo</span>
            <strong>{periodLabel}</strong>
          </div>
        </div>
        {built.mapRoutes && (
          <div className="report-map">
            <LeafletRouteMap routes={built.mapRoutes} />
          </div>
        )}
        {built.rows.length ? (
          <DataTable headers={built.headers} rows={built.rows} />
        ) : (
          <div className="filter-empty">
            <span>
              <Icon name="search" />
            </span>
            <strong>Sin registros para los filtros seleccionados</strong>
            <p>Ajuste el intervalo o restablezca los filtros para ver resultados.</p>
          </div>
        )}
        <div className="grand-total">
          <span>{built.grandLabel}</span>
          <strong>{built.grandValue}</strong>
        </div>
      </section>
    </>
  )
}
