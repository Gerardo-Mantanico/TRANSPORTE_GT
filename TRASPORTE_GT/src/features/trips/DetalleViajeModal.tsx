import { useAuth } from '../../app/providers/useAuth'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { FormModal } from '../../components/ui/FormModal'
import { Icon } from '../../components/ui/Icon'
import { InfoNote } from '../../components/ui/Misc'
import { useEliminarViaje, useViaje } from '../../hooks/trips'
import { ETIQUETAS_TIPO_VIAJE, type Viaje } from '../../types/tripTypes'
import { formatFechaHora, formatQ } from '../../utils/format'
import { ResumenCostosViaje } from '../costs/ResumenCostosViaje'
import { EstadoViajeBadge } from './EstadoViajeBadge'

export function DetalleViajeModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { datos: viaje, cargando, error, recargar } = useViaje(id)
  const { usuario } = useAuth()
  // GET /costos/viajes/{id}: solo administradores
  const puedeVerCostos = usuario?.rol === 'ADMIN_SISTEMA' || usuario?.rol === 'ADMIN_SUCURSAL'

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section className="modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span className="eyebrow">Detalle de viaje</span>
            <h2>{viaje ? `${viaje.nombreOrigen} → ${viaje.nombreDestino}` : 'Viaje'}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">
          {viaje ? (
            <>
              <div className="detail-grid">
                <div>
                  <span>Estado</span>
                  <EstadoViajeBadge estado={viaje.estado} />
                </div>
                <div>
                  <span>Tipo</span>
                  <strong>{ETIQUETAS_TIPO_VIAJE[viaje.tipoViaje]}</strong>
                </div>
                <div>
                  <span>Salida programada</span>
                  <strong>{formatFechaHora(viaje.fechaHoraSalida)}</strong>
                </div>
                <div>
                  <span>Llegada estimada</span>
                  <strong>{formatFechaHora(viaje.fechaHoraLlegadaEstimada)}</strong>
                </div>
                <div>
                  <span>Bus</span>
                  <strong>{viaje.bus ? `${viaje.bus.placa} · ${viaje.bus.capacidad} pasajeros` : 'Sin asignar'}</strong>
                </div>
                <div>
                  <span>Chofer</span>
                  <strong>{viaje.chofer?.nombreCompleto ?? 'Sin asignar'}</strong>
                </div>
                {viaje.precioBoleto !== null && (
                  <div>
                    <span>Precio del boleto</span>
                    <strong>{formatQ(viaje.precioBoleto)}</strong>
                  </div>
                )}
                {viaje.numeroPasajeros !== null && (
                  <div>
                    <span>Pasajeros del alquiler</span>
                    <strong>{viaje.numeroPasajeros}</strong>
                  </div>
                )}
              </div>
              <div className="summary-label">Registro de salida</div>
              {viaje.registroSalida ? (
                <div className="read-only-row">
                  <span>Hora real</span>
                  <strong>{formatFechaHora(viaje.registroSalida.fechaHoraSalidaReal)}</strong>
                  <span>Kilometraje inicial</span>
                  <strong>{viaje.registroSalida.kilometrajeInicial.toLocaleString('es-GT')} km</strong>
                </div>
              ) : (
                <small className="cell-note">Aún no registrada.</small>
              )}
              <div className="summary-label">Registro de llegada</div>
              {viaje.registroLlegada ? (
                <div className="read-only-row">
                  <span>Hora real</span>
                  <strong>{formatFechaHora(viaje.registroLlegada.fechaHoraLlegadaReal)}</strong>
                  <span>Kilometraje final</span>
                  <strong>{viaje.registroLlegada.kilometrajeFinal.toLocaleString('es-GT')} km</strong>
                  <span>Distancia</span>
                  <strong>{viaje.registroLlegada.distanciaRecorridaKm.toLocaleString('es-GT')} km</strong>
                  <span>Combustible</span>
                  <strong>{formatQ(viaje.registroLlegada.gastoCombustibleTotal)}</strong>
                </div>
              ) : (
                <small className="cell-note">Aún no registrada.</small>
              )}
              {(viaje.registroSalida || viaje.registroLlegada) && (
                <InfoNote>Los registros de salida y llegada son inmutables.</InfoNote>
              )}
              {viaje.registroLlegada && puedeVerCostos && <ResumenCostosViaje idViaje={viaje.id} />}
            </>
          ) : cargando ? (
            <Cargando />
          ) : (
            <AvisoError error={error} onReintentar={recargar} />
          )}
        </div>
        <footer>
          <Button icon="close" onClick={onClose}>Cerrar</Button>
        </footer>
      </section>
    </div>
  )
}

export function EliminarViajeModal({ viaje, onClose, onEliminado }: { viaje: Viaje; onClose: () => void; onEliminado: () => void }) {
  const eliminar = useEliminarViaje()

  const confirmar = async () => {
    const resultado = await eliminar.ejecutar(viaje.id)
    if (resultado.ok) onEliminado()
  }

  return (
    <FormModal
      eyebrow="Acción destructiva"
      title="Eliminar viaje"
      actionLabel="Eliminar viaje"
      danger
      enviando={eliminar.cargando}
      onSubmit={confirmar}
      onClose={onClose}
    >
      <p className="modal-paragraph">
        ¿Desea eliminar el viaje{' '}
        <strong>
          {viaje.nombreOrigen} → {viaje.nombreDestino}
        </strong>{' '}
        del {formatFechaHora(viaje.fechaHoraSalida)}?
      </p>
      <InfoNote>
        {viaje.tipoViaje === 'ALQUILER_PRIVADO'
          ? 'El alquiler se cancelará y, si se pagó con cartera, se reembolsará al cliente.'
          : 'Los boletos vendidos se anularán: las compras en línea se reembolsan a la cartera del cliente.'}{' '}
        Solo se puede eliminar un viaje que no ha iniciado.
      </InfoNote>
      <div className="cell-stack">
        <Badge tone="danger">Esta acción no se puede deshacer</Badge>
      </div>
      <AvisoError error={eliminar.error} />
    </FormModal>
  )
}
