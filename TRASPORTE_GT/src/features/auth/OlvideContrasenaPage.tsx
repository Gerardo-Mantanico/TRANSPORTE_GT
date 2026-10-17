import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { AvisoError } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { useOlvideContrasena } from '../../hooks/identity'
import { AuthLayout } from './AuthLayout'

export function OlvideContrasenaPage() {
  const { ejecutar, cargando, error } = useOlvideContrasena()
  const [correo, setCorreo] = useState('')
  const [mensaje, setMensaje] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const resultado = await ejecutar({ correo: correo.trim() })
    if (resultado.ok) setMensaje(resultado.datos?.mensaje ?? 'Revise su correo.')
  }

  return (
    <AuthLayout
      eyebrow="Recuperar acceso"
      title="¿Olvidó su contraseña?"
      description="Ingrese el correo de su cuenta y le enviaremos un enlace para restablecerla."
    >
      {mensaje ? (
        <div className="recover-sent">
          <span>
            <Icon name="check" size={26} />
          </span>
          <strong>Enlace enviado</strong>
          <p>
            {mensaje}. Correo indicado: <strong>{correo}</strong>
          </p>
          <small>El enlace vence en 30 minutos. Revise también su carpeta de correo no deseado.</small>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Field
              label="Correo electrónico"
              type="email"
              placeholder="nombre@correo.com"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <AvisoError error={error} />
          <Button type="submit" icon="arrow" disabled={cargando}>
            {cargando ? 'Enviando...' : 'Enviar enlace'}
          </Button>
        </form>
      )}
      <div className="auth-switch">
        ¿Recordó su contraseña? <Link to="/login">Iniciar sesión</Link>
      </div>
    </AuthLayout>
  )
}
