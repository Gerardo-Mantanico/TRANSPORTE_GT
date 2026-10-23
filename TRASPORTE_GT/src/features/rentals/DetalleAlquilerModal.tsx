import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Icon } from '../../components/ui/Icon'
import { useAlquiler } from '../../hooks/rentals'
import { ETIQUETAS_CANAL_ALQUILER } from '../../types/rentalTypes'
import { formatDateEs, formatFechaHora, formatQ } from '../../utils/format'
import { EstadoAlquilerBadge } from './EstadoAlquilerBadge'

export function DetalleAlquilerModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { datos: alquiler, cargando, error, recargar } = useAlquiler(id)

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section className="modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span className="eyebrow">Detalle de alquiler</span>
            <h2>{alquiler ? `${alquiler.origen} → ${alquiler.destino}` : 'Alquiler privado'}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">
          {alquiler ? (
            <>
              <div className="detail-grid">
                <div>
                  <span>Estado</span>
                  <EstadoAlquilerBadge estado={alquiler.estado} />
                </div>
                <div>
                  <span>Canal</span>
                  <strong>{ETIQUETAS_CANAL_ALQUILER[alquiler.canal]}</strong>
                </div>
                <div>
                  <span>Cliente</span>
                  <strong>
                    {alquiler.nombreCliente} · NIT {alquiler.nitCliente}
                  </strong>
                </div>
                <div>
                  <span>Pasajeros</span>
                  <strong>{alquiler.numeroPasajeros}</strong>
                </div>
                <div>
                  <span>Salida</span>
                  <strong>{formatFechaHora(alquiler.fechaHoraSalida)}</strong>
                </div>
                <div>
                  <span>{alquiler.idaYVuelta ? 'Retorno' : 'Tipo'}</span>
                  <strong>{alquiler.idaYVuelta ? formatFechaHora(alquiler.fechaHoraRetorno) : 'Solo ida'}</strong>
                </div>
                <div>
                  <span>Llegada estimada</span>
                  <strong>{alquiler.fechaHoraLlegadaEstimada ? formatFechaHora(alquiler.fechaHoraLlegadaEstimada) : 'Por cotizar'}</strong>
                </div>
                <div>
                  <span>Distancia</span>
                  <strong>{alquiler.distanciaEstimadaKm.toLocaleString('es-GT')} km</strong>
                </div>
                <div>
                  <span>Precio estimado</span>
                  <strong>{formatQ(alquiler.precioEstimado)}</strong>
                </div>
                <div>
                  <span>Precio final</span>
                  <strong>{alquiler.precioFinal !== null ? formatQ(alquiler.precioFinal) : 'Por cotizar'}</strong>
                </div>
                <div>
                  <span>Bus</span>
                  <strong>{alquiler.placaBus ?? 'Sin asignar'}</strong>
                </div>
                <div>
                  <span>Chofer</span>
                  <strong>{alquiler.nombreChofer ?? 'Sin asignar'}</strong>
                </div>
                {alquiler.fechaPago && (
                  <div>
                    <span>Pago</span>
                    <strong>
                      {formatDateEs(alquiler.fechaPago)} · {alquiler.idPago ? 'Cartera' : 'Efectivo'}
                    </strong>
                  </div>
                )}
                {alquiler.motivoCancelacion && (
                  <div>
                    <span>Cancelado</span>
                    <strong>
                      {alquiler.motivoCancelacion === 'VIAJE_ELIMINADO' ? 'Se eliminó el viaje' : alquiler.motivoCancelacion}
                    </strong>
                  </div>
                )}
              </div>
              <div className="summary-label">Historial de precios</div>
              {(alquiler.cotizaciones ?? []).map((cotizacion) => (
                <div className="read-only-row" key={cotizacion.id}>
                  <span>{cotizacion.tipo === 'ESTIMADA' ? 'Estimado del sistema' : 'Ajuste del administrador'}</span>
                  <strong>{formatQ(cotizacion.precio)}</strong>
                  <span>{formatFechaHora(cotizacion.creadoEn)}</span>
                  <strong>{cotizacion.comentario ?? '—'}</strong>
                </div>
              ))}
            </>
          ) : error ? (
            <AvisoError error={error} onReintentar={recargar} />
          ) : (
            cargando && <Cargando texto="Cargando alquiler..." />
          )}
        </div>
      </section>
    </div>
  )
}
