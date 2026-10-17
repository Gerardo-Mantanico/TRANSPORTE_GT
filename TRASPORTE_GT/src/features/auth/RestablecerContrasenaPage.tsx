import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError } from '../../api/ApiError'
import { Button } from '../../components/ui/Button'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { useEnlaceContrasena, useRestablecerContrasena } from '../../hooks/identity'
import { MENSAJE_POLITICA_CONTRASENA, POLITICA_CONTRASENA } from '../../types/identityTypes'
import { AuthLayout } from './AuthLayout'

function EnlaceInvalido() {
  return (
    <>
      <div className="recover-sent">
        <span>
          <Icon name="close" size={26} />
        </span>
        <strong>Enlace no válido</strong>
        <p>El enlace no existe, ya se usó o expiró. Solicite uno nuevo para continuar.</p>
      </div>
      <div className="auth-switch">
        <Link to="/olvide-contrasena">Solicitar un nuevo enlace</Link>
      </div>
    </>
  )
}

/** Sirve para restablecer la contraseña y para activar una cuenta nueva (`?token=`). */
export function RestablecerContrasenaPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const enlace = useEnlaceContrasena(token)
  const restablecer = useRestablecerContrasena()
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [errorLocal, setErrorLocal] = useState<ApiError | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const activacion = enlace.datos?.proposito === 'ACTIVACION'

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setErrorLocal(null)
    if (!POLITICA_CONTRASENA.test(nueva)) {
      setErrorLocal(new ApiError(400, 'VALIDACION_FALLIDA', MENSAJE_POLITICA_CONTRASENA))
      return
    }
    if (nueva !== confirmacion) {
      setErrorLocal(new ApiError(400, 'VALIDACION_FALLIDA', 'Las contraseñas no coinciden.'))
      return
    }
    const resultado = await restablecer.ejecutar({ token: token ?? '', nuevaContrasena: nueva })
    if (resultado.ok) setMensaje(resultado.datos?.mensaje ?? 'Contraseña definida. Ya puede iniciar sesión')
  }

  const contenido = () => {
    if (!token || restablecer.error?.status === 410) return <EnlaceInvalido />
    if (enlace.cargando) return <Cargando texto="Validando enlace..." />
    if (enlace.error) return <AvisoError error={enlace.error} onReintentar={enlace.recargar} />
    if (!enlace.datos) return <EnlaceInvalido />
    if (mensaje) {
      return (
        <>
          <div className="recover-sent">
            <span>
              <Icon name="check" size={26} />
            </span>
            <strong>{activacion ? 'Cuenta activada' : 'Contraseña actualizada'}</strong>
            <p>{mensaje}.</p>
          </div>
          <Link className="button primary" to="/login" replace>
            <span>Iniciar sesión</span>
          </Link>
        </>
      )
    }
    return (
      <form onSubmit={handleSubmit}>
        <p className="muted">
          Cuenta: <strong>{enlace.datos.correoEnmascarado}</strong>
        </p>
        <div className="form-grid">
          <Field
            label="Nueva contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={nueva}
            onChange={(event) => setNueva(event.target.value)}
            autoComplete="new-password"
            required
          />
          <Field
            label="Confirmar contraseña"
            type="password"
            placeholder="Repita la contraseña"
            value={confirmacion}
            onChange={(event) => setConfirmacion(event.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <small className="cell-note">{MENSAJE_POLITICA_CONTRASENA}</small>
        <AvisoError error={errorLocal ?? restablecer.error} />
        <Button type="submit" icon="check" disabled={restablecer.cargando}>
          {restablecer.cargando ? 'Guardando...' : activacion ? 'Activar cuenta' : 'Guardar contraseña'}
        </Button>
      </form>
    )
  }

  return (
    <AuthLayout
      eyebrow={activacion ? 'Activar cuenta' : 'Restablecer acceso'}
      title={activacion ? 'Defina su contraseña' : 'Cree una nueva contraseña'}
      description={
        activacion
          ? 'Bienvenido. Defina la contraseña con la que ingresará a la plataforma.'
          : 'Elija una contraseña distinta a la anterior.'
      }
    >
      {contenido()}
    </AuthLayout>
  )
}
