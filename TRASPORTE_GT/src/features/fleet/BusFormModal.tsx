import { useState } from 'react'
import { ApiError } from '../../api/ApiError'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FormModal } from '../../components/ui/FormModal'
import { InfoNote } from '../../components/ui/Misc'
import { useBus, useCrearBus, useEditarBus, useSubirFotoBus } from '../../hooks/fleet'
import type { Bus } from '../../types/fleetTypes'
import { CampoFoto } from './CampoFoto'

interface CamposBus {
  placa: string
  marca: string
  modelo: string
  anio: string
  capacidad: string
  kilometraje: string
}

function validar(campos: CamposBus, conKilometraje: boolean): ApiError | null {
  const invalido = (mensaje: string) => new ApiError(400, 'VALIDACION_FALLIDA', mensaje)
  const anio = Number(campos.anio)
  const capacidad = Number(campos.capacidad)
  if (!Number.isInteger(anio) || anio < 1980 || anio > 2100) return invalido('El año debe estar entre 1980 y 2100.')
  if (!Number.isInteger(capacidad) || capacidad < 1 || capacidad > 600)
    return invalido('La capacidad debe ser un entero entre 1 y 600.')
  if (conKilometraje && campos.kilometraje.trim() && !(Number(campos.kilometraje) >= 0))
    return invalido('El kilometraje no puede ser negativo.')
  return null
}

interface FormularioBusProps {
  bus?: Bus
  onClose: () => void
  /** Mensaje para la lista; `error` indica que el bus se guardó pero la foto no. */
  onGuardado: (mensaje: string, error?: boolean) => void
}

function FormularioBus({ bus, onClose, onGuardado }: FormularioBusProps) {
  const crear = useCrearBus()
  const editar = useEditarBus()
  const subirFoto = useSubirFotoBus()
  const [campos, setCampos] = useState<CamposBus>({
    placa: bus?.placa ?? '',
    marca: bus?.marca ?? '',
    modelo: bus?.modelo ?? '',
    anio: bus ? String(bus.anioFabricacion) : '',
    capacidad: bus ? String(bus.capacidadPasajeros) : '',
    kilometraje: '',
  })
  const [archivo, setArchivo] = useState<File | null>(null)
  const [errorLocal, setErrorLocal] = useState<ApiError | null>(null)
  const cargando = crear.cargando || editar.cargando || subirFoto.cargando
  const cambiar = (cambios: Partial<CamposBus>) => setCampos((actual) => ({ ...actual, ...cambios }))

  const guardar = async () => {
    const invalido = validar(campos, !bus)
    setErrorLocal(invalido)
    if (invalido) return
    const datos = {
      placa: campos.placa.trim().toUpperCase(),
      marca: campos.marca.trim(),
      modelo: campos.modelo.trim(),
      anioFabricacion: Number(campos.anio),
      capacidadPasajeros: Number(campos.capacidad),
    }
    const resultado = bus
      ? await editar.ejecutar({ id: bus.id, ...datos, version: bus.version })
      : await crear.ejecutar({ ...datos, kilometrajeActual: campos.kilometraje.trim() ? Number(campos.kilometraje) : null })
    if (!resultado.ok) return
    const accion = bus ? 'actualizado' : 'registrado'
    if (!archivo) {
      onGuardado(`Bus ${resultado.datos.placa} ${accion}.`)
      return
    }
    // Segundo paso: la foto se sube con el id del bus ya guardado
    const foto = await subirFoto.ejecutar({ id: resultado.datos.id, archivo })
    onGuardado(
      foto.ok
        ? `Bus ${resultado.datos.placa} ${accion} con su foto.`
        : `Bus ${resultado.datos.placa} ${accion}, pero la foto no se pudo subir (${foto.error.message}). Intente de nuevo desde Editar.`,
      !foto.ok,
    )
  }

  return (
    <FormModal
      eyebrow={bus ? 'Editar registro' : 'Nuevo registro'}
      title={bus ? `Editar bus ${bus.placa}` : 'Registrar bus'}
      actionLabel={bus ? 'Guardar cambios' : 'Registrar bus'}
      enviando={cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <div className="form-grid two">
        <div className="span-two">
          <CampoFoto label="Foto del bus" nombre={campos.placa} fotoActual={bus?.fotoUrl} onChange={setArchivo} />
        </div>
        <Field
          label="Placa"
          placeholder="P123XYZ"
          value={campos.placa}
          onChange={(event) => cambiar({ placa: event.target.value })}
          maxLength={15}
          required
        />
        <Field
          label="Marca"
          placeholder="Mercedes-Benz"
          value={campos.marca}
          onChange={(event) => cambiar({ marca: event.target.value })}
          maxLength={50}
          required
        />
        <Field
          label="Modelo"
          placeholder="Marcopolo"
          value={campos.modelo}
          onChange={(event) => cambiar({ modelo: event.target.value })}
          maxLength={50}
          required
        />
        <Field
          label="Año de fabricación"
          type="number"
          placeholder="2022"
          value={campos.anio}
          onChange={(event) => cambiar({ anio: event.target.value })}
          required
        />
        <Field
          label="Capacidad de pasajeros"
          type="number"
          placeholder="45"
          value={campos.capacidad}
          onChange={(event) => cambiar({ capacidad: event.target.value })}
          required
        />
        {bus ? (
          <Field label="Kilometraje actual (km)" value={String(bus.kilometrajeActual)} disabled />
        ) : (
          <Field
            label="Kilometraje inicial (km)"
            type="number"
            step="0.1"
            placeholder="0"
            value={campos.kilometraje}
            onChange={(event) => cambiar({ kilometraje: event.target.value })}
          />
        )}
      </div>
      <InfoNote>
        {bus
          ? 'El kilometraje solo cambia con los registros de salida y llegada de los viajes.'
          : 'El bus se registra en su sucursal con estado Disponible.'}
      </InfoNote>
      <AvisoError error={errorLocal ?? crear.error ?? editar.error} />
    </FormModal>
  )
}

export function CrearBusModal(props: Omit<FormularioBusProps, 'bus'>) {
  return <FormularioBus {...props} />
}

/** Carga la versión más reciente del bus antes de editar (bloqueo optimista). */
export function EditarBusModal({ id, ...props }: { id: string } & Omit<FormularioBusProps, 'bus'>) {
  const { datos, cargando, error, recargar } = useBus(id)
  if (datos) return <FormularioBus key={datos.id} bus={datos} {...props} />
  return (
    <FormModal eyebrow="Editar registro" title="Editar bus" actionLabel="Guardar" onSubmit={recargar} onClose={props.onClose} enviando>
      {cargando ? <Cargando /> : <AvisoError error={error} onReintentar={recargar} />}
    </FormModal>
  )
}
