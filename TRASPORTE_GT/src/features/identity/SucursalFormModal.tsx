import { useState } from 'react'
import { ApiError } from '../../api/ApiError'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FormModal } from '../../components/ui/FormModal'
import { InfoNote } from '../../components/ui/Misc'
import { useCrearSucursal, useEditarSucursal, useSucursal } from '../../hooks/identity'
import type { DatosSucursal, Sucursal, SucursalCreada } from '../../types/identityTypes'

interface CamposSucursal {
  nombre: string
  departamento: string
  direccion: string
  telefono: string
  latitud: string
  longitud: string
}

const VACIO: CamposSucursal = { nombre: '', departamento: '', direccion: '', telefono: '', latitud: '', longitud: '' }

function camposDesde(sucursal: Sucursal): CamposSucursal {
  return {
    nombre: sucursal.nombre,
    departamento: sucursal.departamento,
    direccion: sucursal.direccion,
    telefono: sucursal.telefono ?? '',
    latitud: String(sucursal.latitud),
    longitud: String(sucursal.longitud),
  }
}

/** Valida como `SucursalRequest` y convierte los campos del formulario. */
function aDatosSucursal(campos: CamposSucursal): DatosSucursal | ApiError {
  const latitud = Number(campos.latitud)
  const longitud = Number(campos.longitud)
  const invalido = (mensaje: string) => new ApiError(400, 'VALIDACION_FALLIDA', mensaje)
  if (campos.latitud.trim() === '' || Number.isNaN(latitud) || latitud < -90 || latitud > 90)
    return invalido('La latitud debe estar entre -90 y 90.')
  if (campos.longitud.trim() === '' || Number.isNaN(longitud) || longitud < -180 || longitud > 180)
    return invalido('La longitud debe estar entre -180 y 180.')
  if (!/^[0-9+\- ]*$/.test(campos.telefono)) return invalido('El teléfono solo puede contener dígitos, espacios, + y -.')
  return {
    nombre: campos.nombre.trim(),
    departamento: campos.departamento.trim(),
    direccion: campos.direccion.trim(),
    telefono: campos.telefono.trim() || null,
    latitud,
    longitud,
  }
}

function CamposSucursalForm({
  campos,
  onCambiar,
}: {
  campos: CamposSucursal
  onCambiar: (cambios: Partial<CamposSucursal>) => void
}) {
  return (
    <div className="form-grid two">
      <Field
        label="Nombre de la sucursal"
        placeholder="Ej. Quetzaltenango Centro"
        value={campos.nombre}
        onChange={(event) => onCambiar({ nombre: event.target.value })}
        maxLength={100}
        required
      />
      <Field
        label="Departamento"
        placeholder="Ej. Quetzaltenango"
        value={campos.departamento}
        onChange={(event) => onCambiar({ departamento: event.target.value })}
        maxLength={50}
        required
      />
      <div className="span-two">
        <Field
          label="Dirección"
          placeholder="4a. Calle 12-35, Zona 1"
          value={campos.direccion}
          onChange={(event) => onCambiar({ direccion: event.target.value })}
          maxLength={250}
          required
        />
      </div>
      <Field
        label="Teléfono"
        type="tel"
        placeholder="77651234"
        value={campos.telefono}
        onChange={(event) => onCambiar({ telefono: event.target.value })}
        maxLength={20}
      />
      <span />
      <Field
        label="Latitud"
        type="number"
        step="0.000001"
        placeholder="14.834500"
        value={campos.latitud}
        onChange={(event) => onCambiar({ latitud: event.target.value })}
        required
      />
      <Field
        label="Longitud"
        type="number"
        step="0.000001"
        placeholder="-91.518600"
        value={campos.longitud}
        onChange={(event) => onCambiar({ longitud: event.target.value })}
        required
      />
    </div>
  )
}

export function CrearSucursalModal({
  onClose,
  onGuardado,
}: {
  onClose: () => void
  onGuardado: (creada: SucursalCreada) => void
}) {
  const { ejecutar, cargando, error } = useCrearSucursal()
  const [campos, setCampos] = useState<CamposSucursal>(VACIO)
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [correoAdmin, setCorreoAdmin] = useState('')
  const [errorLocal, setErrorLocal] = useState<ApiError | null>(null)

  const guardar = async () => {
    const sucursal = aDatosSucursal(campos)
    if (sucursal instanceof ApiError) {
      setErrorLocal(sucursal)
      return
    }
    setErrorLocal(null)
    const resultado = await ejecutar({
      sucursal,
      administrador: { nombreCompleto: nombreAdmin.trim(), correo: correoAdmin.trim() },
    })
    if (resultado.ok) onGuardado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow="Nuevo registro"
      title="Nueva sucursal"
      actionLabel="Crear sucursal"
      enviando={cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <CamposSucursalForm campos={campos} onCambiar={(cambios) => setCampos((actual) => ({ ...actual, ...cambios }))} />
      <h3 className="eyebrow">Administrador de la sucursal</h3>
      <div className="form-grid two">
        <Field
          label="Nombre completo"
          placeholder="María Fernanda Pérez"
          value={nombreAdmin}
          onChange={(event) => setNombreAdmin(event.target.value)}
          maxLength={150}
          required
        />
        <Field
          label="Correo"
          type="email"
          placeholder="admin.xela@transportes.gt"
          value={correoAdmin}
          onChange={(event) => setCorreoAdmin(event.target.value)}
          maxLength={150}
          required
        />
      </div>
      <InfoNote>
        Toda sucursal tiene al menos un administrador. Recibirá un enlace de activación (vigente 48 h) para
        definir su contraseña.
      </InfoNote>
      <AvisoError error={errorLocal ?? error} />
    </FormModal>
  )
}

interface EditarSucursalFormProps {
  sucursal: Sucursal
  onClose: () => void
  onGuardado: (sucursal: Sucursal) => void
}

function EditarSucursalForm({ sucursal, onClose, onGuardado }: EditarSucursalFormProps) {
  const { ejecutar, cargando, error } = useEditarSucursal()
  const [campos, setCampos] = useState<CamposSucursal>(() => camposDesde(sucursal))
  const [errorLocal, setErrorLocal] = useState<ApiError | null>(null)

  const guardar = async () => {
    const datos = aDatosSucursal(campos)
    if (datos instanceof ApiError) {
      setErrorLocal(datos)
      return
    }
    setErrorLocal(null)
    const resultado = await ejecutar({ id: sucursal.id, sucursal: datos, version: sucursal.version })
    if (resultado.ok) onGuardado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow="Editar registro"
      title="Editar sucursal"
      actionLabel="Guardar cambios"
      enviando={cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <CamposSucursalForm campos={campos} onCambiar={(cambios) => setCampos((actual) => ({ ...actual, ...cambios }))} />
      <InfoNote>Los cambios se publican a los demás servicios (flota, viajes, reportes).</InfoNote>
      <AvisoError error={errorLocal ?? error} />
    </FormModal>
  )
}

/** Carga la versión más reciente de la sucursal antes de editar (bloqueo optimista). */
export function EditarSucursalModal({
  id,
  onClose,
  onGuardado,
}: { id: string } & Omit<EditarSucursalFormProps, 'sucursal'>) {
  const { datos, cargando, error, recargar } = useSucursal(id)

  if (datos) return <EditarSucursalForm key={datos.id} sucursal={datos} onClose={onClose} onGuardado={onGuardado} />

  return (
    <FormModal eyebrow="Editar registro" title="Editar sucursal" actionLabel="Guardar" onSubmit={recargar} onClose={onClose} enviando>
      {cargando ? <Cargando /> : <AvisoError error={error} onReintentar={recargar} />}
    </FormModal>
  )
}
