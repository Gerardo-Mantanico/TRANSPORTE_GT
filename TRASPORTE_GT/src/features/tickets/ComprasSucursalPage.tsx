import { useMemo, useState } from 'react'
import { useAuth } from '../../app/providers/useAuth'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { FilterToolbar } from '../../components/ui/FilterToolbar'
import { Icon } from '../../components/ui/Icon'
import { Paginacion } from '../../components/ui/Paginacion'
import { useCompra, useComprasSucursal, useViajesALaVenta } from '../../hooks/tickets'
import { useResumenViajes } from '../../hooks/trips'
import {
  ESTADOS_COMPRA,
  ETIQUETAS_CANAL,
  ETIQUETAS_ESTADO_COMPRA,
  type EstadoCompra,
  type FiltroComprasSucursal,
} from '../../types/ticketTypes'
import type { ViajeResumen } from '../../types/tripTypes'
import { etiquetaAsiento } from '../../utils/asientos'
import { formatFechaHora, formatMonto } from '../../utils/format'
import { CeldaAsientos, CeldaViaje, EstadoCompraBadge } from './CompraCeldas'

const TAMANO_PAGINA = 10

/** Detalle con los datos más recientes de la compra (útil para las RESERVADA). */
function DetalleCompraModal({
  idCompra,
  viaje,
  onClose,
}: {
  idCompra: string
  viaje: ViajeResumen | undefined
  onClose: () => void
}) {
  const { datos: compra, cargando, error, recargar } = useCompra(idCompra)

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section className="modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span className="eyebrow">Detalle de la compra</span>
            <h2>{viaje ? `${viaje.nombreOrigen} → ${viaje.nombreDestino}` : 'Compra de boletos'}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">
          {compra ? (
            <>
              <div className="detail-grid">
                <div>
                  <span>Estado</span>
                  <EstadoCompraBadge compra={compra} />
                </div>
                <div>
                  <span>Canal</span>
                  <strong>{ETIQUETAS_CANAL[compra.canal]}</strong>
                </div>
                <div>
                  <span>Salida</span>
                  <strong>{formatFechaHora(viaje?.fechaHoraSalida)}</strong>
                </div>
                <div>
                  <span>Comprador</span>
                  <strong>{compra.nombreComprador ?? 'Consumidor final'}</strong>
                </div>
                <div>
                  <span>NIT</span>
                  <strong>{compra.nitComprador ?? 'CF'}</strong>
                </div>
                <div>
                  <span>Fecha de pago</span>
                  <strong>{compra.fechaPago}</strong>
                </div>
                <div>
                  <span>Precio unitario</span>
                  <strong>{formatMonto(compra.precioUnitario)}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{formatMonto(compra.montoTotal)}</strong>
                </div>
              </div>
              <div className="summary-label">Boletos</div>
              <div className="selected-chips">
                {compra.asientos.map((boleto) => (
                  <span key={boleto.codigo} title={boleto.estado}>
                    {etiquetaAsiento(boleto.numeroAsiento)} · {boleto.codigo}
                  </span>
                ))}
              </div>
            </>
          ) : cargando ? (
            <Cargando />
          ) : (
            <AvisoError error={error} onReintentar={recargar} />
          )}
        </div>
        <footer>
          <Button variant="ghost" onClick={recargar} disabled={cargando}>
            Actualizar
          </Button>
          <Button onClick={onClose}>Cerrar</Button>
        </footer>
      </section>
    </div>
  )
}

/** Compras de la sucursal (en línea y de mostrador) para CAJERO y ADMIN_SUCURSAL. */
export function ComprasSucursalPage() {
  const { usuario } = useAuth()
  const [filtro, setFiltro] = useState<FiltroComprasSucursal>({ pagina: 0, tamano: TAMANO_PAGINA })
  const [detalle, setDetalle] = useState<string | null>(null)
  const compras = useComprasSucursal(filtro)
  // Para filtrar por viaje: las salidas a la venta de la sucursal.
  const salidas = useViajesALaVenta({ idOrigen: usuario?.idSucursal ?? undefined }, Boolean(usuario?.idSucursal))
  const pagina = compras.datos
  const ids = useMemo(() => (pagina?.contenido ?? []).map((compra) => compra.idViaje), [pagina])
  const viajes = useResumenViajes(ids)

  const actualizarFiltro = (cambios: Partial<FiltroComprasSucursal>) =>
    setFiltro((actual) => ({ ...actual, ...cambios, pagina: 0 }))

  const rows = (pagina?.contenido ?? []).map((compra) => [
    formatFechaHora(compra.creadoEn),
    <CeldaViaje compra={compra} viaje={viajes.porId.get(compra.idViaje)} cargando={viajes.cargando} />,
    <>
      <strong>{compra.nombreComprador ?? 'Consumidor final'}</strong>
      <small className="cell-note">NIT {compra.nitComprador ?? 'CF'}</small>
    </>,
    ETIQUETAS_CANAL[compra.canal],
    <CeldaAsientos compra={compra} />,
    formatMonto(compra.montoTotal),
    <EstadoCompraBadge compra={compra} />,
    <Button variant="ghost" onClick={() => setDetalle(compra.idCompra)}>
      Ver detalle
    </Button>,
  ])

  const detalleViaje = detalle
    ? viajes.porId.get(pagina?.contenido.find((compra) => compra.idCompra === detalle)?.idViaje ?? '')
    : undefined

  return (
    <>
      <section className="surface list-surface">
        <FilterToolbar searchPlaceholder="Use los filtros por estado y viaje">
          <label className="field">
            <span className="field-label">
              <span>Estado</span>
            </span>
            <select
              value={filtro.estado ?? ''}
              onChange={(event) =>
                actualizarFiltro({ estado: (event.target.value || undefined) as EstadoCompra | undefined })
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
          <label className="field">
            <span className="field-label">
              <span>Viaje</span>
            </span>
            <select
              value={filtro.idViaje ?? ''}
              onChange={(event) => actualizarFiltro({ idViaje: event.target.value || undefined })}
            >
              <option value="">Todos los viajes</option>
              {(salidas.datos ?? []).map((viaje) => (
                <option key={viaje.idViaje} value={viaje.idViaje}>
                  {viaje.nombreOrigen} → {viaje.nombreDestino} · {formatFechaHora(viaje.fechaHoraSalida)}
                </option>
              ))}
            </select>
          </label>
        </FilterToolbar>
        {compras.error ? (
          <AvisoError error={compras.error} onReintentar={compras.recargar} />
        ) : !pagina && compras.cargando ? (
          <Cargando texto="Cargando boletos vendidos..." />
        ) : rows.length ? (
          <DataTable
            headers={['Fecha', 'Viaje', 'Comprador', 'Canal', 'Asientos', 'Monto', 'Estado', 'Acciones']}
            rows={rows}
          />
        ) : (
          <div className="filter-empty">
            <span>
              <Icon name="ticket" />
            </span>
            <strong>Sin boletos vendidos</strong>
            <p>Las compras en línea y de mostrador de su sucursal aparecerán aquí.</p>
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
      </section>
      {detalle && <DetalleCompraModal idCompra={detalle} viaje={detalleViaje} onClose={() => setDetalle(null)} />}
    </>
  )
}
