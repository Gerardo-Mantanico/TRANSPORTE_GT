import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { errorMessage } from '../../api/client'
import { login as loginRequest, olvideContrasena, registro } from '../../api/identity'
import { defaultPageFor } from '../../app/navigationPaths'
import { useAuth } from '../../app/providers/useAuth'
import { roleFromRolBackend } from '../../app/providers/roles'
import { useTheme } from '../../app/providers/useTheme'
import { Button } from '../../components/ui/Button'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { Logo } from '../../components/ui/Logo'
import { useToast } from '../../components/ui/useToast'
import { isValidEmail, passwordError, required } from '../../utils/validators'
import { AuthLayout } from './AuthLayout'

export function LoginPage() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const toast = useToast()
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login')
  const [recoverEmail, setRecoverEmail] = useState('')
  const [recoverSent, setRecoverSent] = useState(false)
  const [error, setError] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get('expirada')
      ? 'Su sesión expiró o el token ya no es válido. Inicie sesión nuevamente.'
      : null,
  )
  const [loading, setLoading] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    nombreCompleto: '',
    correo: '',
    contrasena: '',
  })
  const [loginForm, setLoginForm] = useState({ correo: '', contrasena: '' })
  const registerMode = mode === 'register'
  const recoverMode = mode === 'recover'

  const fail = (message: string) => {
    setError(message)
    toast.error(message)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (recoverMode) {
      if (!isValidEmail(recoverEmail)) {
        fail('Ingresa un correo electrónico válido.')
        return
      }
    } else if (registerMode) {
      const nameError = required(registerForm.nombreCompleto, 'El nombre completo')
      if (nameError) {
        fail(nameError)
        return
      }
      if (!isValidEmail(registerForm.correo)) {
        fail('Ingresa un correo electrónico válido.')
        return
      }
      const pwdError = passwordError(registerForm.contrasena)
      if (pwdError) {
        fail(pwdError)
        return
      }
    } else {
      if (!isValidEmail(loginForm.correo)) {
        fail('Ingresa un correo electrónico válido.')
        return
      }
      if (!loginForm.contrasena) {
        fail('Ingresa tu contraseña.')
        return
      }
    }

    setLoading(true)
    try {
      if (recoverMode) {
        await olvideContrasena(recoverEmail)
        setRecoverSent(true)
        toast.success('Enlace de recuperación enviado a tu correo.')
        return
      }
      if (registerMode) {
        await registro(registerForm)
        const session = await loginRequest(registerForm.correo, registerForm.contrasena)
        const role = roleFromRolBackend(session.usuario.rol)
        if (!role) {
          fail('Su cuenta fue creada, pero este rol aún no tiene interfaz disponible.')
          return
        }
        login({ token: session.token, expiraEn: session.expiraEn, usuario: session.usuario })
        toast.success('Cuenta creada correctamente.')
        navigate(defaultPageFor(role), { replace: true })
        return
      }
      const session = await loginRequest(loginForm.correo, loginForm.contrasena)
      const role = roleFromRolBackend(session.usuario.rol)
      if (!role) {
        fail(`El rol "${session.usuario.rol}" aún no tiene interfaz disponible en este prototipo.`)
        return
      }
      login({ token: session.token, expiraEn: session.expiraEn, usuario: session.usuario })
      navigate(defaultPageFor(role), { replace: true })
    } catch (caught) {
      fail(errorMessage(caught))
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (next: typeof mode) => {
    setMode(next)
    setRecoverSent(false)
    setError(null)
  }

  return (
    <AuthLayout
      eyebrow={registerMode ? 'Nueva cuenta' : recoverMode ? 'Recuperar acceso' : 'Bienvenido de vuelta'}
      title={registerMode ? 'Cree su cuenta' : recoverMode ? 'Recupere su contraseña' : 'Ingrese a la plataforma'}
      description={
        registerMode
          ? 'Complete sus datos para comprar boletos o solicitar alquileres.'
          : recoverMode
            ? 'Ingrese su correo y le enviaremos un enlace de recuperación.'
            : 'Utilice sus credenciales para continuar.'
      }
    >
      {recoverSent ? (
        <div className="success-note">
          <Icon name="check" />
          <span>Enlace enviado. Revise su bandeja de entrada.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {recoverMode ? (
            <div className="form-grid">
              <Field
                label="Correo electrónico"
                type="email"
                placeholder="nombre@correo.com"
                value={recoverEmail}
                onChange={(event) => setRecoverEmail(event.target.value)}
                required
              />
            </div>
          ) : registerMode ? (
            <div className="form-grid two">
              <Field
                label="Nombre completo"
                placeholder="Andrea López"
                value={registerForm.nombreCompleto}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, nombreCompleto: event.target.value }))
                }
                required
              />
              <Field
                label="Correo electrónico"
                type="email"
                placeholder="andrea@correo.com"
                value={registerForm.correo}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, correo: event.target.value }))
                }
                required
              />
              <Field
                label="Contraseña"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={registerForm.contrasena}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, contrasena: event.target.value }))
                }
                required
              />
            </div>
          ) : (
            <>
              <Field
                label="Correo electrónico"
                type="email"
                placeholder="nombre@correo.com"
                value={loginForm.correo}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, correo: event.target.value }))
                }
                required
              />
              <div className="field">
                <span>
                  Contraseña <b> *</b>
                </span>
                <input
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={loginForm.contrasena}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, contrasena: event.target.value }))
                  }
                  required
                />
                <button type="button" className="field-action below" onClick={() => switchMode('recover')}>
                  ¿Olvidó su contraseña?
                </button>
              </div>
            </>
          )}
          {error && <p className="danger-copy">{error}</p>}
          <Button type="submit" icon="arrow" disabled={loading}>
            {loading
              ? 'Espere…'
              : recoverMode
                ? 'Enviar enlace'
                : registerMode
                  ? 'Crear cuenta'
                  : 'Ingresar'}
          </Button>
        </form>
      )}
      {recoverSent ? (
        <button type="button" className="auth-switch-link" onClick={() => switchMode('login')}>
          Volver a iniciar sesión
        </button>
      ) : (
        <div className="auth-switch">
          {recoverMode
            ? '¿Recordó su contraseña?'
            : registerMode
              ? '¿Ya tiene una cuenta?'
              : '¿Aún no tiene cuenta?'}{' '}
          <button
            type="button"
            onClick={() => switchMode(recoverMode || registerMode ? 'login' : 'register')}
          >
            {recoverMode || registerMode ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </div>
      )}
    </AuthLayout>
  )
}
