import { useState } from 'react'
import { ApiError } from '../../api/ApiError'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FormModal } from '../../components/ui/FormModal'
import { Icon } from '../../components/ui/Icon'
import { InfoNote } from '../../components/ui/Misc'
import { useChofer, useCrearChofer, useEditarChofer, useSubirFotoChofer } from '../../hooks/fleet'
import { useUsuarios } from '../../hooks/identity'
import { PATRON_TELEFONO_CHOFER, TIPOS_LICENCIA, type Chofer, type TipoLicencia } from '../../types/fleetTypes'
import { hoyIso } from '../../utils/format'
import { CampoFoto } from './CampoFoto'

interface CamposChofer {
  nombreCompleto: string
  correo: string
  telefono: string
  numeroLicencia: string
  tipoLicencia: TipoLicencia
  fechaVencimientoLicencia: string
  salarioBaseViaje: string
  idUsuario: string
}

function validar(campos: CamposChofer): ApiError | null {
  const invalido = (mensaje: string) => new ApiError(400, 'VALIDACION_FALLIDA', mensaje)
  if (!PATRON_TELEFONO_CHOFER.test(campos.telefono)) return invalido('El teléfono solo puede contener dígitos, espacios, + y -.')
  const salario = Number(campos.salarioBaseViaje)
  if (!(salario >= 0) || !/^\d{1,8}(\.\d{1,2})?$/.test(campos.salarioBaseViaje))
    return invalido('El salario base por viaje debe ser un monto válido con hasta 2 decimales.')
  return null
}

interface FormularioChoferProps {
  chofer?: Chofer
  onClose: () => void
  /** Mensaje para la lista; `error` indica que el chofer se guardó pero la foto no. */
  onGuardado: (mensaje: string, error?: boolean) => void
}

function FormularioChofer({ chofer, onClose, onGuardado }: FormularioChoferProps) {
  const crear = useCrearChofer()
  const editar = useEditarChofer()
  const subirFoto = useSubirFotoChofer()
  // Usuarios de Identidad con rol CHOFER de la sucursal del administrador (para que registren sus salidas)
  const usuariosChofer = useUsuarios({ rol: 'CHOFER', activo: true, size: 100, sort: 'nombreCompleto,asc' })
  const [campos, setCampos] = useState<CamposChofer>({
    nombreCompleto: chofer?.nombreCompleto ?? '',
    correo: chofer?.correo ?? '',
    telefono: chofer?.telefono ?? '',
    numeroLicencia: chofer?.numeroLicencia ?? '',
    tipoLicencia: chofer?.tipoLicencia ?? 'B',
    fechaVencimientoLicencia: chofer?.fechaVencimientoLicencia ?? '',
    salarioBaseViaje: chofer ? String(chofer.salarioBaseViaje) : '',
    idUsuario: chofer?.idUsuario ?? '',
  })
  const [archivo, setArchivo] = useState<File | null>(null)
  const [errorLocal, setErrorLocal] = useState<ApiError | null>(null)
  const cargando = crear.cargando || editar.cargando || subirFoto.cargando
  const cambiar = (cambios: Partial<CamposChofer>) => setCampos((actual) => ({ ...actual, ...cambios }))

  const guardar = async () => {
    const invalido = validar(campos)
    setErrorLocal(invalido)
    if (invalido) return
    const datos = {
      nombreCompleto: campos.nombreCompleto.trim(),
      correo: campos.correo.trim(),
      telefono: campos.telefono.trim(),
      numeroLicencia: campos.numeroLicencia.trim(),
      tipoLicencia: campos.tipoLicencia,
      fechaVencimientoLicencia: campos.fechaVencimientoLicencia,
      salarioBaseViaje: Number(campos.salarioBaseViaje),
      idUsuario: campos.idUsuario || null,
    }
    const resultado = chofer
      ? await editar.ejecutar({ id: chofer.id, ...datos, version: chofer.version })
      : await crear.ejecutar(datos)
    if (!resultado.ok) return
    const accion = chofer ? 'actualizado' : 'registrado'
    if (!archivo) {
      onGuardado(`Chofer ${resultado.datos.nombreCompleto} ${accion}.`)
      return
    }
    const foto = await subirFoto.ejecutar({ id: resultado.datos.id, archivo })
    onGuardado(
      foto.ok
        ? `Chofer ${resultado.datos.nombreCompleto} ${accion} con su foto.`
        : `Chofer ${resultado.datos.nombreCompleto} ${accion}, pero la foto no se pudo subir (${foto.error.message}). Intente de nuevo desde Editar.`,
      !foto.ok,
    )
  }

  const opcionesUsuario = usuariosChofer.datos?.contenido ?? []
  const enlazadoFueraDeLista = campos.idUsuario && !opcionesUsuario.some((usuario) => usuario.id === campos.idUsuario)

  return (
    <FormModal
      eyebrow={chofer ? 'Editar registro' : 'Nuevo registro'}
      title={chofer ? `Editar chofer` : 'Registrar chofer'}
      actionLabel={chofer ? 'Guardar cambios' : 'Registrar chofer'}
      enviando={cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <div className="form-grid two">
        <Field
          label="Nombre completo"
          placeholder="Nombre y apellido"
          value={campos.nombreCompleto}
          onChange={(event) => cambiar({ nombreCompleto: event.target.value })}
          maxLength={150}
          required
        />
        <Field
          label="Correo"
          type="email"
          placeholder="chofer@transportes.gt"
          value={campos.correo}
          onChange={(event) => cambiar({ correo: event.target.value })}
          maxLength={150}
          required
        />
        <Field
          label="Teléfono"
          type="tel"
          placeholder="5555-1234"
          value={campos.telefono}
          onChange={(event) => cambiar({ telefono: event.target.value })}
          maxLength={20}
          required
        />
        <Field
          label="Número de licencia"
          placeholder="LIC-XEL-001"
          value={campos.numeroLicencia}
          onChange={(event) => cambiar({ numeroLicencia: event.target.value })}
          maxLength={30}
          required
        />
        <Field label="Tipo de licencia" required>
          <select
            value={campos.tipoLicencia}
            onChange={(event) => cambiar({ tipoLicencia: event.target.value as TipoLicencia })}
          >
            {TIPOS_LICENCIA.map((tipo) => (
              <option key={tipo} value={tipo}>
                Tipo {tipo}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Vencimiento de la licencia"
          type="date"
          value={campos.fechaVencimientoLicencia}
          onChange={(event) => cambiar({ fechaVencimientoLicencia: event.target.value })}
          required
        />
        <Field
          label="Salario base por viaje (Q)"
          type="number"
          step="0.01"
          placeholder="150.00"
          value={campos.salarioBaseViaje}
          onChange={(event) => cambiar({ salarioBaseViaje: event.target.value })}
          required
        />
        <Field label="Usuario de acceso (rol Chofer)">
          <select value={campos.idUsuario} onChange={(event) => cambiar({ idUsuario: event.target.value })}>
            <option value="">Sin acceso al sistema</option>
            {enlazadoFueraDeLista && <option value={campos.idUsuario}>Usuario enlazado actual</option>}
            {opcionesUsuario.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombreCompleto} · {usuario.correo}
              </option>
            ))}
          </select>
        </Field>
        <div className="span-two">
          <CampoFoto
            label="Foto del chofer"
            nombre={campos.nombreCompleto}
            fotoActual={chofer?.fotoUrl}
            onChange={setArchivo}
          />
        </div>
      </div>
      {campos.fechaVencimientoLicencia && campos.fechaVencimientoLicencia < hoyIso() && (
        <div className="persistent-note">
          <Icon name="clock" />
          <span>La licencia ya venció. El chofer no debería asignarse a viajes hasta renovarla.</span>
        </div>
      )}
      <InfoNote>
        Enlazar el usuario permite que el chofer registre la salida y llegada de sus viajes. Los choferes no se
        eliminan; solo se desactivan.
      </InfoNote>
      <AvisoError error={usuariosChofer.error}>
        <small>No se pudieron cargar los usuarios con rol Chofer.</small>
      </AvisoError>
      <AvisoError error={errorLocal ?? crear.error ?? editar.error} />
    </FormModal>
  )
}

export function CrearChoferModal(props: Omit<FormularioChoferProps, 'chofer'>) {
  return <FormularioChofer {...props} />
}

/** Carga la versión más reciente del chofer antes de editar (bloqueo optimista). */
export function EditarChoferModal({ id, ...props }: { id: string } & Omit<FormularioChoferProps, 'chofer'>) {
  const { datos, cargando, error, recargar } = useChofer(id)
  if (datos) return <FormularioChofer key={datos.id} chofer={datos} {...props} />
  return (
    <FormModal eyebrow="Editar registro" title="Editar chofer" actionLabel="Guardar" onSubmit={recargar} onClose={props.onClose} enviando>
      {cargando ? <Cargando /> : <AvisoError error={error} onReintentar={recargar} />}
    </FormModal>
  )
}
