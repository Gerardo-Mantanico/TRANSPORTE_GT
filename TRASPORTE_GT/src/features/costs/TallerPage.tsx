import { useMemo, useState } from 'react'
import { useAuth } from '../../app/providers/useAuth'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FilterToolbar } from '../../components/ui/FilterToolbar'
import { Icon } from '../../components/ui/Icon'
import { Paginacion } from '../../components/ui/Paginacion'
import { useGastosTaller } from '../../hooks/costs'
import { useBuses } from '../../hooks/fleet'
import type { GastoTaller } from '../../types/costsTypes'
import { cellText } from '../../utils/cellText'
import { formatDateEs, formatQ } from '../../utils/format'
import { DetalleGastoModal } from './DetalleGastoModal'
import { GastoTallerModal } from './GastoTallerModal'

const TAMANO_PAGINA = 10

type ModalTaller = { tipo: 'registrar' } | { tipo: 'detalle'; gasto: GastoTaller }

/** Gastos de taller por bus. ADMIN_SUCURSAL registra los de su sucursal; ADMIN_SISTEMA consulta todos. */
export function TallerPage() {
  const { usuario } = useAuth()
  const esAdminSucursal = usuario?.rol === 'ADMIN_SUCURSAL'
  const [idBus, setIdBus] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [pagina, setPagina] = useState(0)
  const [texto, setTexto] = useState('')
  const [modal, setModal] = useState<ModalTaller | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const rangoInvalido = Boolean(desde && hasta && desde > hasta)

  const gastos = useGastosTaller({
    idBus: idBus || undefined,
    desde: desde || undefined,
    hasta: hasta || undefined,
    pagina,
    tamano: TAMANO_PAGINA,
  })
  const buses = useBuses({ size: 100, sort: 'placa,asc' })
  const listaBuses = useMemo(() => buses.datos?.contenido ?? [], [buses.datos])
  const placas = useMemo(() => new Map(listaBuses.map((bus) => [bus.id, bus.placa])), [listaBuses])
  const placa = (id: string) => placas.get(id) ?? 'Bus'

  const cambiar = (aplicar: () => void) => {
    aplicar()
    setPagina(0)
  }

  const datos = gastos.datos
  const todas = (datos?.contenido ?? []).map((gasto) => [
    <>
      <strong>{placa(gasto.idBus)}</strong>
      <small className="cell-note">{gasto.observaciones ?? 'Sin observaciones'}</small>
    </>,
    formatDateEs(gasto.fechaServicio),
    <span className="chip">{[...new Set(gasto.lineas.map((linea) => linea.nombreCategoria))].join(', ')}</span>,
    String(gasto.lineas.length),
    <strong>{formatQ(gasto.total)}</strong>,
    <Button variant="ghost" onClick={() => setModal({ tipo: 'detalle', gasto })}>
      Ver detalle
    </Button>,
  ])
  const busqueda = texto.trim().toLocaleLowerCase('es')
  const rows = busqueda ? todas.filter((row) => cellText(row).toLocaleLowerCase('es').includes(busqueda)) : todas

  return (
    <>
      <section className="surface list-surface">
        <FilterToolbar
          searchPlaceholder="Buscar en esta página por bus o categoría..."
          onSearch={setTexto}
          action={esAdminSucursal ? 'Registrar gasto' : undefined}
          onAction={esAdminSucursal ? () => setModal({ tipo: 'registrar' }) : undefined}
        >
          <label className="field">
            <span className="field-label">
              <span>Bus</span>
            </span>
            <select value={idBus} onChange={(event) => cambiar(() => setIdBus(event.target.value))}>
              <option value="">Todos los buses</option>
              {listaBuses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.placa}
                </option>
              ))}
            </select>
          </label>
          <Field label="Servicio desde" type="date" value={desde} onChange={(event) => cambiar(() => setDesde(event.target.value))} />
          <Field label="Servicio hasta" type="date" value={hasta} onChange={(event) => cambiar(() => setHasta(event.target.value))} />
        </FilterToolbar>
        {aviso && (
          <div className="success-note" role="status">
            <Icon name="check" />
            <span>{aviso}</span>
          </div>
        )}
        {rangoInvalido ? (
          <div className="empty-inline">
            <Icon name="calendar" />
            <div>
              <strong>Rango de fechas inválido</strong>
              <p>La fecha inicial no puede ser posterior a la final.</p>
            </div>
          </div>
        ) : gastos.error ? (
          <AvisoError error={gastos.error} onReintentar={gastos.recargar} />
        ) : !datos && gastos.cargando ? (
          <Cargando texto="Cargando gastos de taller..." />
        ) : rows.length ? (
          <DataTable headers={['Bus / Observaciones', 'Fecha', 'Categorías', 'Líneas', 'Total', 'Acciones']} rows={rows} />
        ) : (
          <div className="filter-empty">
            <span>
              <Icon name="wrench" />
            </span>
            <strong>No hay gastos de taller</strong>
            <p>Pruebe con otros filtros{esAdminSucursal ? ' o registre un servicio' : ''}.</p>
          </div>
        )}
        <Paginacion pagina={datos} deshabilitada={gastos.cargando} onCambiar={setPagina} />
      </section>
      {modal?.tipo === 'registrar' && (
        <GastoTallerModal
          buses={listaBuses.filter((bus) => bus.activo)}
          onClose={() => setModal(null)}
          onRegistrado={(gasto) => {
            setModal(null)
            setAviso(`Servicio de ${placa(gasto.idBus)} registrado por ${formatQ(gasto.total)}.`)
            gastos.recargar()
          }}
        />
      )}
      {modal?.tipo === 'detalle' && <DetalleGastoModal gasto={modal.gasto} placa={placa(modal.gasto.idBus)} onClose={() => setModal(null)} />}
    </>
  )
}
