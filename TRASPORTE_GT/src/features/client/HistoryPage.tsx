import { useMemo, useState } from 'react'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { FilterToolbar } from '../../components/ui/FilterToolbar'
import { Icon } from '../../components/ui/Icon'
import { Paginacion } from '../../components/ui/Paginacion'
import { useMisCompras } from '../../hooks/tickets'
import { useResumenViajes } from '../../hooks/trips'
import {
  ESTADOS_COMPRA,
  ETIQUETAS_CANAL,
  ETIQUETAS_ESTADO_COMPRA,
  type EstadoCompra,
  type FiltroMisCompras,
} from '../../types/ticketTypes'
import { cellText } from '../../utils/cellText'
import { formatFechaCorta, formatMonto } from '../../utils/format'
import { MisAlquileres } from '../rentals/MisAlquileres'
import { CeldaAsientos, CeldaViaje, EstadoCompraBadge } from '../tickets/CompraCeldas'
import { DescargarBoletosButton } from '../tickets/DescargarBoletosButton'

const TAMANO_PAGINA = 10

function BoletosComprados() {
  const [filtro, setFiltro] = useState<FiltroMisCompras>({ pagina: 0, tamano: TAMANO_PAGINA })
  const [texto, setTexto] = useState('')
  const compras = useMisCompras(filtro)
  const pagina = compras.datos
  const ids = useMemo(() => (pagina?.contenido ?? []).map((compra) => compra.idViaje), [pagina])
  const viajes = useResumenViajes(ids)

  const todas = (pagina?.contenido ?? []).map((compra) => [
    formatFechaCorta(compra.creadoEn),
    <CeldaViaje compra={compra} viaje={viajes.porId.get(compra.idViaje)} cargando={viajes.cargando} />,
    <CeldaAsientos compra={compra} />,
    ETIQUETAS_CANAL[compra.canal],
    formatMonto(compra.montoTotal),
    <EstadoCompraBadge compra={compra} />,
    <DescargarBoletosButton compra={compra} />,
  ])
  const busqueda = texto.trim().toLocaleLowerCase('es')
  const rows = busqueda
    ? todas.filter((row) => cellText(row).toLocaleLowerCase('es').includes(busqueda))
    : todas

  return (
    <>
      <FilterToolbar searchPlaceholder="Buscar en esta página del historial..." onSearch={setTexto}>
        <label className="field">
          <span className="field-label">
            <span>Estado</span>
          </span>
          <select
            value={filtro.estado ?? ''}
            onChange={(event) =>
              setFiltro((actual) => ({
                ...actual,
                pagina: 0,
                estado: (event.target.value || undefined) as EstadoCompra | undefined,
              }))
            }
          >
            <option value="">Todas</option>
            {ESTADOS_COMPRA.map((estado) => (
              <option key={estado} value={estado}>
                {ETIQUETAS_ESTADO_COMPRA[estado]}s
              </option>
            ))}
          </select>
        </label>
      </FilterToolbar>
      {compras.error ? (
        <AvisoError error={compras.error} onReintentar={compras.recargar} />
      ) : !pagina && compras.cargando ? (
        <Cargando texto="Cargando sus boletos..." />
      ) : rows.length ? (
        <DataTable headers={['Fecha', 'Viaje', 'Asientos', 'Origen', 'Monto', 'Estado', 'Boletos']} rows={rows} />
      ) : (
        <div className="filter-empty">
          <span>
            <Icon name="ticket" />
          </span>
          <strong>Sin boletos</strong>
          <p>Sus compras en línea y en mostrador (con su NIT) aparecerán aquí.</p>
        </div>
      )}
      <AvisoError error={viajes.error}>
        <small>No pudimos cargar los datos de los viajes; se muestran las compras igualmente.</small>
      </AvisoError>
      <Paginacion
        pagina={pagina}
        deshabilitada={compras.cargando}
        onCambiar={(numero) => setFiltro((actual) => ({ ...actual, pagina: numero }))}
      />
    </>
  )
}

export function HistoryPage() {
  const [tab, setTab] = useState(0)

  return (
    <>
      <div className="tabs">
        <button className={tab === 0 ? 'active' : ''} onClick={() => setTab(0)}>
          Boletos comprados
        </button>
        <button className={tab === 1 ? 'active' : ''} onClick={() => setTab(1)}>
          Viajes privados
        </button>
      </div>
      <section className="surface list-surface">
        {tab === 0 ? (
          <BoletosComprados />
        ) : (
          <MisAlquileres />
        )}
        <div className="persistent-note">
          <Icon name="check" />
          <span>
            Las compras y alquileres presenciales hechos con su NIT aparecen aquí, incluso si se hicieron
            antes de crear su cuenta.
          </span>
        </div>
      </section>
    </>
  )
}
