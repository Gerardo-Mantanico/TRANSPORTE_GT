import { useState } from 'react'
import { ApiError } from '../../api/ApiError'
import { useAuth } from '../../app/providers/useAuth'
import { AvisoError } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FormModal } from '../../components/ui/FormModal'
import { useBus } from '../../hooks/fleet'
import { useRegistrarLlegada, useRegistrarSalida } from '../../hooks/trips'
import type { Viaje } from '../../types/tripTypes'
import { aIsoGuatemala, ahoraLocalGuatemala, aLocalGuatemala } from '../../utils/fechaHora'
import { formatFechaHora, formatQ } from '../../utils/format'

/** Los registros no se pueden modificar ni eliminar: se exige confirmar antes de guardar. */
function ConfirmacionInmutable({ confirmado, onChange }: { confirmado: boolean; onChange: (valor: boolean) => void }) {
  return (
    <label className="immutable-check">
      <input type="checkbox" checked={confirmado} onChange={(event) => onChange(event.target.checked)} />
      <span>
        <strong>Confirmo que los datos son correctos.</strong>
        <small>Este registro no se podrá modificar ni eliminar después de guardarlo.</small>
      </span>
    </label>
  )
}

const invalido = (mensaje: string) => new ApiError(400, 'VALIDACION_FALLIDA', mensaje)

export function SalidaModal({ viaje, onClose, onGuardado }: { viaje: Viaje; onClose: () => void; onGuardado: (viaje: Viaje) => void }) {
  const { usuario } = useAuth()
  const registrar = useRegistrarSalida()
  // El administrador puede ver el kilometraje actual del bus en Flota (el chofer no tiene acceso a Flota)
  const bus = useBus(usuario?.rol === 'ADMIN_SUCURSAL' ? viaje.bus?.idBus : null)
  const [fecha, setFecha] = useState(() => ahoraLocalGuatemala())
  const [kilometraje, setKilometraje] = useState('')
  const [confirmado, setConfirmado] = useState(false)
  const [errorLocal, setErrorLocal] = useState<ApiError | null>(null)
  const kmActual = bus.datos?.kilometrajeActual

  const guardar = async () => {
    const km = Number(kilometraje)
    const error = !fecha
      ? invalido('Indique la hora real de salida.')
      : kilometraje.trim() === '' || !(km >= 0)
        ? invalido('El kilometraje inicial debe ser un número positivo.')
        : !confirmado
          ? invalido('Confirme que los datos son correctos.')
          : null
    setErrorLocal(error)
    if (error) return
    const resultado = await registrar.ejecutar({ id: viaje.id, fechaHoraSalidaReal: aIsoGuatemala(fecha), kilometrajeInicial: km })
    if (resultado.ok) onGuardado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow="Registro inmutable"
      title="Registrar salida"
      actionLabel="Registrar salida"
      enviando={registrar.cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <div className="read-only-row">
        <span>Viaje</span>
        <strong>
          {viaje.nombreOrigen} → {viaje.nombreDestino}
        </strong>
        <span>Programado</span>
        <strong>{formatFechaHora(viaje.fechaHoraSalida)}</strong>
        <span>Bus</span>
        <strong>{viaje.bus?.placa ?? '—'}</strong>
        <span>Chofer</span>
        <strong>{viaje.chofer?.nombreCompleto ?? '—'}</strong>
      </div>
      <div className="form-grid two">
        <Field
          label="Hora real de salida"
          type="datetime-local"
          value={fecha}
          onChange={(event) => setFecha(event.target.value)}
          required
        />
        <Field
          label="Kilometraje actual (km)"
          type="number"
          step="0.1"
          placeholder={kmActual !== undefined ? String(kmActual) : '0'}
          value={kilometraje}
          onChange={(event) => setKilometraje(event.target.value)}
          required
        />
      </div>
      {kmActual !== undefined && (
        <small className="cell-note">Kilometraje registrado en Flota: {kmActual.toLocaleString('es-GT')} km.</small>
      )}
      <ConfirmacionInmutable confirmado={confirmado} onChange={setConfirmado} />
      <AvisoError error={errorLocal ?? registrar.error} />
    </FormModal>
  )
}

export function LlegadaModal({ viaje, onClose, onGuardado }: { viaje: Viaje; onClose: () => void; onGuardado: (viaje: Viaje) => void }) {
  const registrar = useRegistrarLlegada()
  const salida = viaje.registroSalida
  const [fecha, setFecha] = useState(() => ahoraLocalGuatemala())
  const [kilometraje, setKilometraje] = useState('')
  const [combustible, setCombustible] = useState('')
  const [confirmado, setConfirmado] = useState(false)
  const [errorLocal, setErrorLocal] = useState<ApiError | null>(null)
  const kmInicial = salida?.kilometrajeInicial ?? 0
  const distancia = kilometraje.trim() ? Number(kilometraje) - kmInicial : null

  const guardar = async () => {
    const km = Number(kilometraje)
    const gasto = Number(combustible)
    const error = !fecha
      ? invalido('Indique la hora real de llegada.')
      : salida && aIsoGuatemala(fecha) <= aIsoGuatemala(aLocalGuatemala(salida.fechaHoraSalidaReal))
        ? invalido('La llegada debe ser posterior a la salida real.')
        : kilometraje.trim() === '' || !(km >= kmInicial)
          ? invalido(`El kilometraje final no puede ser menor que el inicial (${kmInicial.toLocaleString('es-GT')} km).`)
          : combustible.trim() === '' || !(gasto >= 0)
            ? invalido('El gasto en combustible no puede ser negativo.')
            : !confirmado
              ? invalido('Confirme que los datos son correctos.')
              : null
    setErrorLocal(error)
    if (error) return
    const resultado = await registrar.ejecutar({
      id: viaje.id,
      fechaHoraLlegadaReal: aIsoGuatemala(fecha),
      kilometrajeFinal: km,
      gastoCombustibleTotal: gasto,
    })
    if (resultado.ok) onGuardado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow="Registro inmutable"
      title="Registrar llegada"
      actionLabel="Registrar llegada"
      enviando={registrar.cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <div className="read-only-row">
        <span>Viaje</span>
        <strong>
          {viaje.nombreOrigen} → {viaje.nombreDestino}
        </strong>
        <span>Salida real</span>
        <strong>{formatFechaHora(salida?.fechaHoraSalidaReal)}</strong>
        <span>Kilometraje inicial</span>
        <strong>{kmInicial.toLocaleString('es-GT')} km</strong>
        <span>Bus</span>
        <strong>{viaje.bus?.placa ?? '—'}</strong>
      </div>
      <div className="form-grid two">
        <Field
          label="Hora real de llegada"
          type="datetime-local"
          value={fecha}
          onChange={(event) => setFecha(event.target.value)}
          required
        />
        <Field
          label="Kilometraje final (km)"
          type="number"
          step="0.1"
          placeholder={String(kmInicial)}
          value={kilometraje}
          onChange={(event) => setKilometraje(event.target.value)}
          required
        />
        <Field
          label="Gasto total en combustible (Q)"
          type="number"
          step="0.01"
          placeholder="420.00"
          value={combustible}
          onChange={(event) => setCombustible(event.target.value)}
          required
        />
        <Field
          label="Distancia recorrida"
          value={distancia !== null && distancia >= 0 ? `${distancia.toLocaleString('es-GT')} km` : '—'}
          disabled
        />
      </div>
      {combustible.trim() && <small className="cell-note">Combustible: {formatQ(Number(combustible) || 0)}</small>}
      <ConfirmacionInmutable confirmado={confirmado} onChange={setConfirmado} />
      <AvisoError error={errorLocal ?? registrar.error} />
    </FormModal>
  )
}
