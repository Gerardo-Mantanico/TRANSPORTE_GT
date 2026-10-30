import { useState } from 'react'
import { ApiError } from '../../api/ApiError'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { FormModal } from '../../components/ui/FormModal'
import { InfoNote } from '../../components/ui/Misc'
import { SelectorUbicacionMapa } from '../../components/domain/SelectorUbicacionMapa'
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

const DEPARTAMENTOS_GUATEMALA = [
  'Alta Verapaz',
  'Baja Verapaz',
  'Chimaltenango',
  'Chiquimula',
  'El Progreso',
  'Escuintla',
  'Guatemala',
  'Huehuetenango',
  'Izabal',
  'Jalapa',
  'Jutiapa',
  'Petén',
  'Quetzaltenango',
  'Quiché',
  'Retalhuleu',
  'Sacatepéquez',
  'San Marcos',
  'Santa Rosa',
  'Sololá',
  'Suchitepéquez',
  'Totonicapán',
  'Zacapa',
] as const

function departamentoCatalogado(valor: string): string {
  const normalizar = (texto: string) =>
    texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/departamento( de)?|department/g, '').trim()
  return DEPARTAMENTOS_GUATEMALA.find((departamento) => normalizar(departamento) === normalizar(valor)) ?? ''
}

/** El backend almacena coordenadas como NUMERIC(9,6). */
function redondearCoordenada(valor: number): number {
  return Math.round(valor * 1e6) / 1e6
}

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
  const problema = validarPaso(campos, 1) ?? validarPaso(campos, 2)
  if (problema) return problema
  const latitud = Number(campos.latitud)
  const longitud = Number(campos.longitud)
  const invalido = (mensaje: string) => new ApiError(400, 'VALIDACION_FALLIDA', mensaje)
  if (campos.latitud.trim() === '' || Number.isNaN(latitud) || latitud < -90 || latitud > 90)
    return invalido('La latitud debe estar entre -90 y 90.')
  if (campos.longitud.trim() === '' || Number.isNaN(longitud) || longitud < -180 || longitud > 180)
    return invalido('La longitud debe estar entre -180 y 180.')
  return {
    nombre: campos.nombre.trim(),
    departamento: campos.departamento.trim(),
    direccion: campos.direccion.trim(),
    telefono: campos.telefono.trim() || null,
    latitud: redondearCoordenada(latitud),
    longitud: redondearCoordenada(longitud),
  }
}

function validarPaso(campos: CamposSucursal, paso: 1 | 2): ApiError | null {
  if (paso === 1 && !campos.nombre.trim())
    return new ApiError(400, 'VALIDACION_FALLIDA', 'Completa el nombre de la sucursal.')
  if (paso === 1 && campos.telefono !== '' && !/^[0-9]{8}$/.test(campos.telefono))
    return new ApiError(400, 'VALIDACION_FALLIDA', 'El teléfono debe contener exactamente 8 dígitos.')
  if (paso === 2 && (!campos.direccion.trim() || !campos.latitud.trim() || !campos.longitud.trim()))
    return new ApiError(400, 'VALIDACION_FALLIDA', 'Busca la ubicación o marca un punto en el mapa.')
  if (paso === 2 && !departamentoCatalogado(campos.departamento))
    return new ApiError(400, 'VALIDACION_FALLIDA', 'No se ha identificado el departamento. Selecciona una ubicación de Guatemala en el mapa o vuelve a buscar la dirección.')
  return null
}

function PasosSucursal({ actual, total }: { actual: number; total: number }) {
  const etiquetas = ['Datos básicos', 'Ubicación', ...(total === 3 ? ['Administrador'] : [])]
  return (
    <div className="branch-form-steps" aria-label="Pasos del formulario">
      {etiquetas.map((etiqueta, indice) => {
        const numero = indice + 1
        return (
          <div className={`branch-form-step ${numero === actual ? 'active' : ''} ${numero < actual ? 'complete' : ''}`} key={etiqueta}>
            <span>{numero < actual ? '✓' : numero}</span>
            <small>{etiqueta}</small>
          </div>
        )
      })}
    </div>
  )
}

function NavegacionSucursal({ paso, total, cargando, onAnterior, onGuardar }: {
  paso: number
  total: number
  cargando: boolean
  onAnterior: () => void
  onGuardar: () => void
}) {
  return (
    <div className="branch-form-footer">
      <Button variant="ghost" onClick={onAnterior} disabled={paso === 1 || cargando}>Anterior</Button>
      {paso < total ? (
        <Button type="submit" icon="chevron" disabled={cargando}>Siguiente</Button>
      ) : (
        <Button type="button" icon="save" onClick={onGuardar} disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar sucursal'}</Button>
      )}
    </div>
  )
}

function CamposSucursalForm({
  campos,
  onCambiar,
  paso,
}: {
  campos: CamposSucursal
  onCambiar: (cambios: Partial<CamposSucursal>) => void
  paso: 1 | 2
}) {
  return (
    <div className="form-grid two">
      {paso === 1 ? (
        <>
          <Field
            label="Nombre de la sucursal"
            placeholder="Ej. Quetzaltenango Centro"
            value={campos.nombre}
            onChange={(event) => onCambiar({ nombre: event.target.value })}
            maxLength={100}
            required
          />
          <Field
            label="Teléfono"
            type="tel"
            placeholder="77651234"
            value={campos.telefono}
            onChange={(event) => onCambiar({ telefono: event.target.value.replace(/[^0-9]/g, '') })}
            minLength={8}
            maxLength={8}
          />
        </>
      ) : (
        <>
          <div className="span-two branch-location-section">
            <div className="branch-location-heading">
              <strong>Selecciona la ubicación de la sucursal <b>*</b></strong>
              <small>Busca una dirección o haz clic en el mapa. Se completarán automáticamente la dirección, el departamento y las coordenadas.</small>
            </div>
            <SelectorUbicacionMapa
              punto={
                campos.latitud.trim() && campos.longitud.trim() && !Number.isNaN(Number(campos.latitud)) && !Number.isNaN(Number(campos.longitud))
                  ? [Number(campos.latitud), Number(campos.longitud)]
                  : null
              }
              direccion={campos.direccion}
              onCambiar={(punto) => onCambiar({ latitud: String(punto[0]), longitud: String(punto[1]), departamento: '', direccion: '' })}
              onDireccion={(direccion) => onCambiar({ direccion })}
              onDepartamento={(departamento) => {
                const catalogado = departamentoCatalogado(departamento)
                onCambiar({ departamento: catalogado })
              }}
            />
            <p role="status">Departamento: <strong>{campos.departamento || 'Pendiente de identificar en el mapa'}</strong></p>
          </div>
        </>
      )}
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
  const [paso, setPaso] = useState<1 | 2 | 3>(1)

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

  const avanzar = () => {
    if (paso < 3) {
      const problema = validarPaso(campos, paso as 1 | 2)
      setErrorLocal(problema)
      if (!problema) setPaso((actual) => (actual + 1) as 1 | 2 | 3)
    }
  }

  return (
    <FormModal
      eyebrow="Nuevo registro"
      title={`Nueva sucursal · Paso ${paso} de 3`}
      actionLabel="Crear sucursal"
      enviando={cargando}
      onSubmit={paso < 3 ? avanzar : guardar}
      onClose={onClose}
      footer={
        <NavegacionSucursal
          paso={paso}
          total={3}
          cargando={cargando}
          onAnterior={() => setPaso((actual) => Math.max(1, actual - 1) as 1 | 2 | 3)}
          onGuardar={guardar}
        />
      }
    >
      <PasosSucursal actual={paso} total={3} />
      {paso === 1 ? (
        <CamposSucursalForm paso={1} campos={campos} onCambiar={(cambios) => setCampos((actual) => ({ ...actual, ...cambios }))} />
      ) : paso === 2 ? (
        <CamposSucursalForm paso={2} campos={campos} onCambiar={(cambios) => setCampos((actual) => ({ ...actual, ...cambios }))} />
      ) : (
        <>
          <div className="branch-step-intro"><strong>Asigna el administrador</strong><span>Esta persona recibirá el acceso para gestionar la sucursal.</span></div>
          <div className="form-grid two">
            <Field label="Nombre completo" placeholder="María Fernanda Pérez" value={nombreAdmin} onChange={(event) => setNombreAdmin(event.target.value)} maxLength={150} required />
            <Field label="Correo" type="email" placeholder="admin.xela@transportes.gt" value={correoAdmin} onChange={(event) => setCorreoAdmin(event.target.value)} maxLength={150} required />
          </div>
          <InfoNote>Toda sucursal tiene al menos un administrador. Recibirá un enlace de activación vigente 48 horas para definir su contraseña.</InfoNote>
        </>
      )}
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
  const [paso, setPaso] = useState<1 | 2>(1)

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

  const avanzar = () => {
    const problema = validarPaso(campos, paso)
    setErrorLocal(problema)
    if (!problema && paso === 1) setPaso(2)
  }

  return (
    <FormModal
      eyebrow="Editar registro"
      title={`Editar sucursal · Paso ${paso} de 2`}
      actionLabel="Guardar cambios"
      enviando={cargando}
      onSubmit={paso === 1 ? avanzar : guardar}
      onClose={onClose}
      footer={
        <NavegacionSucursal
          paso={paso}
          total={2}
          cargando={cargando}
          onAnterior={() => setPaso(1)}
          onGuardar={guardar}
        />
      }
    >
      <PasosSucursal actual={paso} total={2} />
      <CamposSucursalForm paso={paso} campos={campos} onCambiar={(cambios) => setCampos((actual) => ({ ...actual, ...cambios }))} />
      {paso === 2 && <InfoNote>Los cambios se publican a los demás servicios (flota, viajes, reportes).</InfoNote>}
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
