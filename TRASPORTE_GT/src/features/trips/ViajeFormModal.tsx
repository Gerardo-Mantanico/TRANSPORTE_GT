import { useState } from 'react'
import { ApiError } from '../../api/ApiError'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FormModal } from '../../components/ui/FormModal'
import { InfoNote } from '../../components/ui/Misc'
import { useBuses, useChoferes } from '../../hooks/fleet'
import { useAsignarViaje, useCrearViaje, useEditarViaje, useViaje } from '../../hooks/trips'
import type { Ruta, Viaje } from '../../types/tripTypes'
import { aIsoGuatemala, aLocalGuatemala, ahoraLocalGuatemala, sumarHorasLocal } from '../../utils/fechaHora'
import { formatQ } from '../../utils/format'
import { SelectorBus, SelectorChofer } from './SelectoresRecursos'

/** Recursos activos de la sucursal del administrador (Flota filtra por su sucursal). */
function useRecursosFlota() {
  const buses = useBuses({ activo: true, size: 100, sort: 'placa,asc' })
  const choferes = useChoferes({ activo: true, size: 100, sort: 'nombreCompleto,asc' })
  return { buses, choferes, cargando: buses.cargando || choferes.cargando, error: buses.error ?? choferes.error }
}

function validarFechas(salida: string, llegada: string): ApiError | null {
  if (!salida || !llegada) return new ApiError(400, 'VALIDACION_FALLIDA', 'Indique la salida y la llegada estimada.')
  if (llegada <= salida)
    return new ApiError(400, 'VALIDACION_FALLIDA', 'La llegada estimada debe ser posterior a la salida.')
  return null
}

interface FormularioViajeProps {
  viaje?: Viaje
  rutas: Ruta[]
  nombreSucursal: (id: string) => string
  onClose: () => void
  onGuardado: (viaje: Viaje) => void
}

function FormularioViaje({ viaje, rutas, nombreSucursal, onClose, onGuardado }: FormularioViajeProps) {
  const crear = useCrearViaje()
  const editar = useEditarViaje()
  const recursos = useRecursosFlota()
  const [idRuta, setIdRuta] = useState(viaje?.idRuta ?? '')
  const [idBus, setIdBus] = useState(viaje?.bus?.idBus ?? '')
  const [idChofer, setIdChofer] = useState(viaje?.chofer?.idChofer ?? '')
  const [salida, setSalida] = useState(() => (viaje ? aLocalGuatemala(viaje.fechaHoraSalida) : ahoraLocalGuatemala(1)))
  const [llegada, setLlegada] = useState(() =>
    viaje ? aLocalGuatemala(viaje.fechaHoraLlegadaEstimada) : ahoraLocalGuatemala(5),
  )
  const [errorLocal, setErrorLocal] = useState<ApiError | null>(null)
  const ruta = rutas.find((item) => item.id === idRuta)

  const guardar = async () => {
    const invalido = !viaje && !idRuta ? new ApiError(400, 'VALIDACION_FALLIDA', 'Seleccione la ruta.') : validarFechas(salida, llegada)
    setErrorLocal(invalido)
    if (invalido) return
    const fechas = { fechaHoraSalida: aIsoGuatemala(salida), fechaHoraLlegadaEstimada: aIsoGuatemala(llegada) }
    const resultado = viaje
      ? await editar.ejecutar({ id: viaje.id, idBus, idChofer, ...fechas })
      : await crear.ejecutar({ idRuta, idBus, idChofer, ...fechas })
    if (resultado.ok) onGuardado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow={viaje ? 'Editar registro' : 'Nuevo registro'}
      title={viaje ? 'Editar viaje' : 'Programar viaje regular'}
      actionLabel={viaje ? 'Guardar cambios' : 'Programar viaje'}
      enviando={crear.cargando || editar.cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      {recursos.cargando && !recursos.buses.datos ? (
        <Cargando texto="Cargando buses y choferes..." />
      ) : (
        <div className="form-grid two">
          {viaje ? (
            <Field label="Ruta" value={`${viaje.nombreOrigen} → ${viaje.nombreDestino}`} disabled />
          ) : (
            <Field label="Ruta" required>
              <select value={idRuta} onChange={(event) => setIdRuta(event.target.value)} required>
                <option value="" disabled>
                  Seleccione una opción
                </option>
                {rutas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {nombreSucursal(item.idSucursalOrigen)} → {nombreSucursal(item.idSucursalDestino)} ·{' '}
                    {formatQ(item.precioBoleto)}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Tipo de viaje" value={viaje?.tipoViaje === 'ALQUILER_PRIVADO' ? 'Alquiler privado' : 'Regular'} disabled />
          <SelectorBus buses={recursos.buses.datos?.contenido ?? []} valor={idBus} onChange={setIdBus} pasajeros={viaje?.numeroPasajeros} />
          <SelectorChofer
            choferes={recursos.choferes.datos?.contenido ?? []}
            valor={idChofer}
            onChange={setIdChofer}
            fechaLlegada={llegada.slice(0, 10)}
          />
          <Field
            label="Fecha y hora de salida"
            type="datetime-local"
            value={salida}
            onChange={(event) => {
              const nueva = event.target.value
              // Conserva la duración al mover la salida
              if (salida && llegada && nueva) {
                const duracion = (new Date(aIsoGuatemala(llegada)).getTime() - new Date(aIsoGuatemala(salida)).getTime()) / 3_600_000
                if (duracion > 0) setLlegada(sumarHorasLocal(nueva, duracion))
              }
              setSalida(nueva)
            }}
            required
          />
          <Field
            label="Llegada estimada"
            type="datetime-local"
            value={llegada}
            onChange={(event) => setLlegada(event.target.value)}
            required
          />
        </div>
      )}
      <InfoNote>
        {viaje
          ? 'El tipo y la ruta no se pueden cambiar. Si el viaje ya tiene boletos, el bus nuevo debe tener asientos suficientes.'
          : `El tipo de viaje no podrá modificarse después de guardar.${ruta ? ` Precio del boleto: ${formatQ(ruta.precioBoleto)}.` : ''}`}
      </InfoNote>
      <AvisoError error={recursos.error}>
        <small>No se pudieron cargar los buses o choferes de Flota.</small>
      </AvisoError>
      <AvisoError error={errorLocal ?? crear.error ?? editar.error} />
    </FormModal>
  )
}

export function CrearViajeModal(props: Omit<FormularioViajeProps, 'viaje'>) {
  return <FormularioViaje {...props} />
}

/** Carga la versión más reciente del viaje antes de editar. */
export function EditarViajeModal({ id, ...props }: { id: string } & Omit<FormularioViajeProps, 'viaje'>) {
  const { datos, cargando, error, recargar } = useViaje(id)
  if (datos) return <FormularioViaje key={datos.id} viaje={datos} {...props} />
  return (
    <FormModal eyebrow="Editar registro" title="Editar viaje" actionLabel="Guardar" onSubmit={recargar} onClose={props.onClose} enviando>
      {cargando ? <Cargando /> : <AvisoError error={error} onReintentar={recargar} />}
    </FormModal>
  )
}

/** Asigna bus y chofer a un viaje de alquiler PENDIENTE_ASIGNACION (pasa a PROGRAMADO). */
export function AsignacionModal({
  viaje,
  onClose,
  onGuardado,
}: {
  viaje: Viaje
  onClose: () => void
  onGuardado: (viaje: Viaje) => void
}) {
  const asignar = useAsignarViaje()
  const recursos = useRecursosFlota()
  const [idBus, setIdBus] = useState('')
  const [idChofer, setIdChofer] = useState('')

  const guardar = async () => {
    const resultado = await asignar.ejecutar({ id: viaje.id, idBus, idChofer })
    if (resultado.ok) onGuardado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow="Alquiler privado"
      title="Asignar bus y chofer"
      actionLabel="Asignar"
      enviando={asignar.cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <p className="modal-paragraph">
        <strong>
          {viaje.nombreOrigen} → {viaje.nombreDestino}
        </strong>{' '}
        · {viaje.numeroPasajeros ?? '—'} pasajeros
      </p>
      {recursos.cargando && !recursos.buses.datos ? (
        <Cargando texto="Cargando buses y choferes..." />
      ) : (
        <div className="form-grid two">
          <SelectorBus
            buses={recursos.buses.datos?.contenido ?? []}
            valor={idBus}
            onChange={setIdBus}
            pasajeros={viaje.numeroPasajeros}
          />
          <SelectorChofer
            choferes={recursos.choferes.datos?.contenido ?? []}
            valor={idChofer}
            onChange={setIdChofer}
            fechaLlegada={aLocalGuatemala(viaje.fechaHoraLlegadaEstimada).slice(0, 10)}
          />
        </div>
      )}
      <InfoNote>El bus debe tener al menos tantos asientos como pasajeros del alquiler.</InfoNote>
      <AvisoError error={asignar.error ?? recursos.error} />
    </FormModal>
  )
}
