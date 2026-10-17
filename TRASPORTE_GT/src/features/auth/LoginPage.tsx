import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { ApiError } from '../../api/ApiError'
import { defaultPageFor } from '../../app/navigationPaths'
import { useAuth } from '../../app/providers/useAuth'
import { Button } from '../../components/ui/Button'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { useRegistro } from '../../hooks/identity'
import { MENSAJE_POLITICA_CONTRASENA, POLITICA_CONTRASENA } from '../../types/identityTypes'
import { AuthLayout } from './AuthLayout'

export function LoginPage() {
  const { estado, usuario, login } = useAuth()
  const location = useLocation()
  const registro = useRegistro()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const registerMode = mode === 'register'

  const desde = (location.state as { desde?: string } | null)?.desde

  if (estado === 'cargando') return <Cargando texto="Verificando su sesión..." pantalla />
  // Con sesión iniciada vuelve a la ruta que pidió; ProtectedRoute la corrige si su rol no tiene acceso.
  if (usuario) return <Navigate to={desde ?? defaultPageFor(usuario.rol)} replace />

  const iniciar = async () => {
    try {
      await login({ correo: correo.trim(), contrasena })
    } catch (causa) {
      setError(ApiError.desde(causa))
      setEnviando(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (enviando) return
    setError(null)
    if (registerMode && !POLITICA_CONTRASENA.test(contrasena)) {
      setError(new ApiError(400, 'VALIDACION_FALLIDA', MENSAJE_POLITICA_CONTRASENA))
      return
    }
    setEnviando(true)
    if (registerMode) {
      const resultado = await registro.ejecutar({
        nombreCompleto: nombreCompleto.trim(),
        correo: correo.trim(),
        contrasena,
      })
      if (!resultado.ok) {
        setError(resultado.error)
        setEnviando(false)
        return
      }
    }
    await iniciar()
  }

  const switchMode = () => {
    setMode(registerMode ? 'login' : 'register')
    setError(null)
  }

  return (
    <AuthLayout
      eyebrow={registerMode ? 'Nueva cuenta' : 'Bienvenido de vuelta'}
      title={registerMode ? 'Cree su cuenta' : 'Ingrese a la plataforma'}
      description={
        registerMode
          ? 'Complete sus datos para comprar boletos o solicitar alquileres.'
          : 'Utilice sus credenciales para continuar.'
      }
    >
      <form onSubmit={handleSubmit}>
        {registerMode && (
          <Field
            label="Nombre completo"
            placeholder="Andrea López"
            value={nombreCompleto}
            onChange={(event) => setNombreCompleto(event.target.value)}
            autoComplete="name"
            maxLength={150}
            required
          />
        )}
        <Field
          label="Correo electrónico"
          type="email"
          placeholder="nombre@correo.com"
          value={correo}
          onChange={(event) => setCorreo(event.target.value)}
          autoComplete="email"
          maxLength={150}
          required
        />
        <div className="field">
          <span>
            Contraseña <b> *</b>
          </span>
          <input
            type="password"
            placeholder={registerMode ? 'Mínimo 8 caracteres' : 'Ingrese su contraseña'}
            value={contrasena}
            onChange={(event) => setContrasena(event.target.value)}
            autoComplete={registerMode ? 'new-password' : 'current-password'}
            required
          />
          {registerMode ? (
            <small className="cell-note">{MENSAJE_POLITICA_CONTRASENA}</small>
          ) : (
            <Link className="field-action below" to="/olvide-contrasena">
              ¿Olvidó su contraseña?
            </Link>
          )}
        </div>
        <AvisoError error={error} />
        <Button type="submit" icon="arrow" disabled={enviando}>
          {enviando ? 'Procesando...' : registerMode ? 'Crear cuenta' : 'Ingresar'}
        </Button>
      </form>
      <div className="auth-switch">
        {registerMode ? '¿Ya tiene una cuenta?' : '¿Aún no tiene cuenta?'}{' '}
        <button type="button" onClick={switchMode}>
          {registerMode ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>
      </div>
    </AuthLayout>
  )
}
