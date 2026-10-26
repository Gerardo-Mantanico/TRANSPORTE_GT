import { AvisoError, Cargando } from '../../components/ui/Estado'
import { useResumenCostosViaje } from '../../hooks/costs'
import { formatQ } from '../../utils/format'

/** Costos de un viaje ya cerrado: los genera Costos al consumir LlegadaRegistrada. */
export function ResumenCostosViaje({ idViaje }: { idViaje: string }) {
  const resumen = useResumenCostosViaje(idViaje)
  const datos = resumen.datos
  const total = (datos?.combustible?.monto ?? 0) + (datos?.depreciacion?.monto ?? 0) + (datos?.pagoChofer?.monto ?? 0)

  return (
    <>
      <div className="summary-label">Costos del viaje</div>
      {resumen.error ? (
        resumen.error.status === 404 ? (
          <small className="cell-note">Costos todavía no procesó la llegada de este viaje.</small>
        ) : (
          <AvisoError error={resumen.error} onReintentar={resumen.recargar} />
        )
      ) : !datos ? (
        <Cargando texto="Cargando costos..." />
      ) : (
        <div className="read-only-row">
          <span>Combustible</span>
          <strong>{datos.combustible ? formatQ(datos.combustible.monto) : '—'}</strong>
          <span>Depreciación</span>
          <strong>
            {datos.depreciacion
              ? `${formatQ(datos.depreciacion.monto)} (${datos.depreciacion.distanciaKm.toLocaleString('es-GT')} km × ${formatQ(datos.depreciacion.montoPorKm)})`
              : '—'}
          </strong>
          <span>Salario del chofer</span>
          <strong>
            {datos.pagoChofer
              ? `${formatQ(datos.pagoChofer.monto)}${datos.pagoChofer.multiplicador !== 1 ? ` (× ${datos.pagoChofer.multiplicador})` : ''}`
              : '—'}
          </strong>
          <span>Total</span>
          <strong>{formatQ(total)}</strong>
        </div>
      )}
    </>
  )
}
