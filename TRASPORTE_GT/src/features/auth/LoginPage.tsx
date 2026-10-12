import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { defaultPageFor } from '../../app/navigationPaths'
import { useAuth } from '../../app/providers/useAuth'
import { useTheme } from '../../app/providers/useTheme'
import type { Role } from '../../types'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { Logo } from '../../components/ui/Logo'

const DEFAULT_ROLE: Role = 'Administrador de sucursal'

export function LoginPage() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login')
  const [recoverEmail, setRecoverEmail] = useState('')
  const [recoverSent, setRecoverSent] = useState(false)
  const registerMode = mode === 'register'
  const recoverMode = mode === 'recover'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (recoverMode) {
      setRecoverSent(true)
      return
    }
    const role: Role = registerMode ? 'Cliente' : DEFAULT_ROLE
    login(role)
    navigate(defaultPageFor(role), { replace: true })
  }

  const switchMode = (next: typeof mode) => {
    setMode(next)
    setRecoverSent(false)
  }

  return (
    <main className="auth-page">
      <button
        className="theme-toggle auth-theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
      </button>
      <div className="auth-brand">
        <Logo />
        <div>
          <span className="eyebrow light">Plataforma de transporte</span>
          <h1>
            Un viaje más simple,
            <br />
            una operación más inteligente.
          </h1>
          <p>Conectamos pasajeros, equipos y decisiones en una sola plataforma.</p>
        </div>
        <div className="auth-route">
          <span>GUA</span>
          <div>
            <i />
            <i />
            <i />
          </div>
          <span>ANT</span>
        </div>
      </div>
      <section className="auth-panel">
        <div className={`auth-card ${registerMode ? 'wide' : ''}`.trim()}>
          <div className="mobile-logo">
            <Logo />
          </div>
          <span className="eyebrow">
            {registerMode
              ? 'Nueva cuenta'
              : recoverMode
                ? 'Recuperar acceso'
                : 'Bienvenido de vuelta'}
          </span>
          <h2>
            {registerMode
              ? 'Cree su cuenta'
              : recoverMode
                ? '¿Olvidó su contraseña?'
                : 'Ingrese a la plataforma'}
          </h2>
          <p className="muted">
            {registerMode
              ? 'Complete sus datos para comprar boletos o solicitar alquileres.'
              : recoverMode
                ? 'Ingrese el correo de su cuenta y le enviaremos un enlace para restablecerla.'
                : 'Utilice sus credenciales para continuar.'}
          </p>
          {recoverMode && recoverSent ? (
            <div className="recover-sent">
              <span>
                <Icon name="check" size={26} />
              </span>
              <strong>Enlace enviado</strong>
              <p>
                Si existe una cuenta asociada a <strong>{recoverEmail}</strong>, recibirá un correo
                con las instrucciones en unos minutos.
              </p>
              <small>Revise también su carpeta de correo no deseado.</small>
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
                <Field label="Nombre completo" placeholder="Andrea López" required />
                <Field label="Correo electrónico" type="email" placeholder="andrea@correo.com" required />
                <Field label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" required />
                <Field label="NIT" placeholder="1234567-8" required />
                <Field label="DPI" placeholder="0000 00000 0000" required />
                <Field label="Teléfono" placeholder="+502 5555 5555" required />
                <div className="span-two">
                  <Field label="Dirección" placeholder="Zona, municipio, departamento" required />
                </div>
              </div>
            ) : (
              <>
                <Field label="Correo electrónico" type="email" placeholder="nombre@correo.com" required />
                <div className="field">
                  <span>
                    Contraseña <b> *</b>
                  </span>
                  <input type="password" placeholder="Ingrese su contraseña" required />
                  <button type="button" className="field-action below" onClick={() => switchMode('recover')}>
                    ¿Olvidó su contraseña?
                  </button>
                </div>
              </>
            )}
            <Button
              type="submit"
              icon="arrow"
              onClick={handleSubmit}
            >
              {recoverMode ? 'Enviar enlace' : registerMode ? 'Crear cuenta' : 'Ingresar'}
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
          </div>
      </section>
    </main>
  )
}
