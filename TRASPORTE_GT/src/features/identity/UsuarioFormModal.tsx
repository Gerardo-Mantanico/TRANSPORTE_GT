import { useState } from 'react'
import { ApiError } from '../../api/ApiError'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FormModal } from '../../components/ui/FormModal'
import { InfoNote } from '../../components/ui/Misc'
import { useCrearUsuario, useEditarUsuario, useUsuario } from '../../hooks/identity'
import { ETIQUETAS_ROL, type Rol, type Sucursal, type Usuario } from '../../types/identityTypes'

/** ADMIN_SISTEMA crea ADMIN_SISTEMA o ADMIN_SUCURSAL; ADMIN_SUCURSAL crea CAJERO o CHOFER en su sucursal. */
const ROLES_CREABLES: Partial<Record<Rol, Rol[]>> = {
  ADMIN_SISTEMA: ['ADMIN_SISTEMA', 'ADMIN_SUCURSAL'],
  ADMIN_SUCURSAL: ['CAJERO', 'CHOFER'],
}

interface CrearUsuarioModalProps {
  rolCreador: Rol
  sucursales: Sucursal[]
  onClose: () => void
  onGuardado: (usuario: Usuario) => void
}

export function CrearUsuarioModal({ rolCreador, sucursales, onClose, onGuardado }: CrearUsuarioModalProps) {
  const roles = ROLES_CREABLES[rolCreador] ?? []
  const { ejecutar, cargando, error } = useCrearUsuario()
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [correo, setCorreo] = useState('')
  const [rol, setRol] = useState<Rol>(roles[roles.length - 1] ?? 'CAJERO')
  const [idSucursal, setIdSucursal] = useState('')
  const [errorLocal, setErrorLocal] = useState<ApiError | null>(null)
  const pideSucursal = rolCreador === 'ADMIN_SISTEMA' && rol === 'ADMIN_SUCURSAL'

  const guardar = async () => {
    setErrorLocal(null)
    if (pideSucursal && !idSucursal) {
      setErrorLocal(new ApiError(400, 'VALIDACION_FALLIDA', 'Seleccione la sucursal del administrador.'))
      return
    }
    const resultado = await ejecutar({
      nombreCompleto: nombreCompleto.trim(),
      correo: correo.trim(),
      rol,
      // ADMIN_SUCURSAL omite la sucursal y el backend usa la suya.
      idSucursal: pideSucursal ? idSucursal : null,
    })
    if (resultado.ok) onGuardado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow="Nuevo registro"
      title="Crear usuario"
      actionLabel="Crear usuario"
      enviando={cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <div className="form-grid two">
        <Field
          label="Nombre completo"
          placeholder="Nombre y apellido"
          value={nombreCompleto}
          onChange={(event) => setNombreCompleto(event.target.value)}
          maxLength={150}
          required
        />
        <Field
          label="Correo"
          type="email"
          placeholder="usuario@transportes.gt"
          value={correo}
          onChange={(event) => setCorreo(event.target.value)}
          maxLength={150}
          required
        />
        <Field label="Rol" required>
          <select value={rol} onChange={(event) => setRol(event.target.value as Rol)} required>
            {roles.map((opcion) => (
              <option key={opcion} value={opcion}>
                {ETIQUETAS_ROL[opcion]}
              </option>
            ))}
          </select>
        </Field>
        {pideSucursal && (
          <Field label="Sucursal enlazada" required>
            <select value={idSucursal} onChange={(event) => setIdSucursal(event.target.value)} required>
              <option value="" disabled>
                Seleccione una opción
              </option>
              {sucursales
                .filter((sucursal) => sucursal.activa)
                .map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
            </select>
          </Field>
        )}
      </div>
      <InfoNote>
        El usuario recibirá un correo con un enlace de activación (vigente 48 h) para definir su contraseña.
      </InfoNote>
      <AvisoError error={errorLocal ?? error} />
    </FormModal>
  )
}

interface EditarUsuarioFormProps {
  usuario: Usuario
  onClose: () => void
  onGuardado: (usuario: Usuario) => void
}

function EditarUsuarioForm({ usuario, onClose, onGuardado }: EditarUsuarioFormProps) {
  const { ejecutar, cargando, error } = useEditarUsuario()
  const [nombreCompleto, setNombreCompleto] = useState(usuario.nombreCompleto)
  const [correo, setCorreo] = useState(usuario.correo)

  const guardar = async () => {
    const resultado = await ejecutar({
      id: usuario.id,
      nombreCompleto: nombreCompleto.trim(),
      correo: correo.trim(),
      version: usuario.version,
    })
    if (resultado.ok) onGuardado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow="Editar registro"
      title="Editar usuario"
      actionLabel="Guardar cambios"
      enviando={cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <div className="form-grid two">
        <Field
          label="Nombre completo"
          value={nombreCompleto}
          onChange={(event) => setNombreCompleto(event.target.value)}
          maxLength={150}
          required
        />
        <Field
          label="Correo"
          type="email"
          value={correo}
          onChange={(event) => setCorreo(event.target.value)}
          maxLength={150}
          required
        />
        <Field label="Rol" value={ETIQUETAS_ROL[usuario.rol]} disabled />
        <Field label="Sucursal" value={usuario.nombreSucursal ?? '—'} disabled />
      </div>
      <InfoNote>El rol y la sucursal no se modifican. Los usuarios no se eliminan; solo se desactivan.</InfoNote>
      <AvisoError error={error} />
    </FormModal>
  )
}

/** Carga la versión más reciente del usuario antes de editar (bloqueo optimista). */
export function EditarUsuarioModal({ id, onClose, onGuardado }: { id: string } & Omit<EditarUsuarioFormProps, 'usuario'>) {
  const { datos, cargando, error, recargar } = useUsuario(id)

  if (datos) return <EditarUsuarioForm key={datos.id} usuario={datos} onClose={onClose} onGuardado={onGuardado} />

  return (
    <FormModal eyebrow="Editar registro" title="Editar usuario" actionLabel="Guardar" onSubmit={recargar} onClose={onClose} enviando>
      {cargando ? <Cargando /> : <AvisoError error={error} onReintentar={recargar} />}
    </FormModal>
  )
}
