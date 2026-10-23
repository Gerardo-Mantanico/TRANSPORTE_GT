import { useState } from 'react'
import { AvisoError } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FormModal } from '../../components/ui/FormModal'
import { InfoNote } from '../../components/ui/Misc'
import { useCotizarAlquiler } from '../../hooks/rentals'
import type { Alquiler } from '../../types/rentalTypes'
import { aIsoGuatemala, aLocalGuatemala, sumarHorasLocal } from '../../utils/fechaHora'
import { formatFechaHora, formatQ } from '../../utils/format'

/** El ADMIN_SUCURSAL fija el precio final y la llegada estimada (SOLICITADO o COTIZADO → COTIZADO). */
export function CotizarModal({
  alquiler,
  onClose,
  onCotizado,
}: {
  alquiler: Alquiler
  onClose: () => void
  onCotizado: (alquiler: Alquiler) => void
}) {
  const cotizar = useCotizarAlquiler()
  // En ida y vuelta la llegada es el regreso al origen: se propone a partir del retorno
  const base = aLocalGuatemala(alquiler.fechaHoraRetorno ?? alquiler.fechaHoraSalida)
  const [precio, setPrecio] = useState(String(alquiler.precioFinal ?? alquiler.precioEstimado))
  const [llegada, setLlegada] = useState(
    alquiler.fechaHoraLlegadaEstimada ? aLocalGuatemala(alquiler.fechaHoraLlegadaEstimada) : sumarHorasLocal(base, 4),
  )
  const [comentario, setComentario] = useState('')

  const guardar = async () => {
    const resultado = await cotizar.ejecutar({
      id: alquiler.id,
      precioFinal: Number(precio),
      fechaHoraLlegadaEstimada: aIsoGuatemala(llegada),
      comentario: comentario.trim() || null,
    })
    if (resultado.ok) onCotizado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow={alquiler.estado === 'COTIZADO' ? 'Reajustar cotización' : 'Cotizar alquiler'}
      title={`${alquiler.origen} → ${alquiler.destino}`}
      actionLabel="Guardar cotización"
      enviando={cotizar.cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <p className="modal-paragraph">
        {alquiler.nombreCliente} · {alquiler.numeroPasajeros} pasajeros · salida {formatFechaHora(alquiler.fechaHoraSalida)}
        {alquiler.idaYVuelta && <> · retorno {formatFechaHora(alquiler.fechaHoraRetorno)}</>}
      </p>
      <div className="form-grid two">
        <Field label="Precio final (Q)" type="number" step="0.01" value={precio} onChange={(event) => setPrecio(event.target.value)} required />
        <Field label="Llegada estimada" type="datetime-local" value={llegada} onChange={(event) => setLlegada(event.target.value)} required />
      </div>
      <Field label="Comentario" placeholder="Ej. Incluye peajes" value={comentario} onChange={(event) => setComentario(event.target.value)} maxLength={250} />
      <InfoNote>
        Precio estimado por tarifa: {formatQ(alquiler.precioEstimado)} ({alquiler.distanciaEstimadaKm.toLocaleString('es-GT')} km).
        {alquiler.idaYVuelta && ' En ida y vuelta la llegada estimada es el regreso al origen.'}
      </InfoNote>
      <AvisoError error={cotizar.error} />
    </FormModal>
  )
}
