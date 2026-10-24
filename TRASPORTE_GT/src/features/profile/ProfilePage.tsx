import { useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../../api/ApiError'
import { useAuth } from '../../app/providers/useAuth'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { AvisoError } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { useCambiarContrasena, useEditarMiPerfil } from '../../hooks/identity'
import {
  ETIQUETAS_ROL,
  MENSAJE_POLITICA_CONTRASENA,
  POLITICA_CONTRASENA,
  type Rol,
} from '../../types/identityTypes'
import { formatFechaLarga, iniciales } from '../../utils/format'
import { PerfilComercial } from '../customerWallet/PerfilComercial'

const PISTAS_ROL: Record<Rol, string> = {
  ADMIN_SISTEMA: 'Acceso a todas las sucursales',
  ADMIN_SUCURSAL: 'Gestión de su sucursal y su personal',
  CAJERO: 'Venta de boletos en su sucursal',
  CHOFER: 'Consulta de viajes asignados',
  CLIENTE: 'Compras y alquileres en línea',
}

function SectionHeading({ icon, title, subtitle }: { icon: 'user' | 'settings'; title: string; subtitle: string }) {
  return (
    <div className="profile-section-title">
      <div>
        <Icon name={icon} />
      </div>
      <span>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
    </div>
  )
}

function DataGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="profile-data-grid">
      {items.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  )
}

function CambiarContrasenaForm({ onListo }: { onListo: () => void }) {
  const { ejecutar, cargando, error } = useCambiarContrasena()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [errorLocal, setErrorLocal] = useState<ApiError | null>(null)

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
    const resultado = await ejecutar({ contrasenaActual: actual, nuevaContrasena: nueva })
    if (resultado.ok) onListo()
  }

  return (
    <form className="profile-edit-form" onSubmit={handleSubmit}>
      <SectionHeading icon="settings" title="Cambiar contraseña" subtitle={MENSAJE_POLITICA_CONTRASENA} />
      <div className="form-grid two">
        <div className="span-two">
          <Field
            label="Contraseña actual"
            type="password"
            value={actual}
            onChange={(event) => setActual(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <Field
          label="Nueva contraseña"
          type="password"
          value={nueva}
          onChange={(event) => setNueva(event.target.value)}
          autoComplete="new-password"
          required
        />
        <Field
          label="Confirmar contraseña"
          type="password"
          value={confirmacion}
          onChange={(event) => setConfirmacion(event.target.value)}
          autoComplete="new-password"
          required
        />
      </div>
      <AvisoError error={errorLocal ?? error} />
      <Button type="submit" icon="check" disabled={cargando}>
        {cargando ? 'Guardando...' : 'Actualizar contraseña'}
      </Button>
    </form>
  )
}

export function ProfilePage() {
  const { usuario, refrescarUsuario } = useAuth()
  const editarPerfil = useEditarMiPerfil()
  const [editing, setEditing] = useState(false)
  const [cambiandoContrasena, setCambiandoContrasena] = useState(false)
  const [nombre, setNombre] = useState('')
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    if (!saved) return
    const timer = window.setTimeout(() => setSaved(null), 2800)
    return () => window.clearTimeout(timer)
  }, [saved])

  if (!usuario) return null

  const branchLabel =
    usuario.rol === 'ADMIN_SISTEMA'
      ? 'Acceso global'
      : usuario.rol === 'CLIENTE'
        ? 'No aplica'
        : (usuario.nombreSucursal ?? '—')

  const empezarEdicion = () => {
    setNombre(usuario.nombreCompleto)
    editarPerfil.reiniciar()
    setEditing(true)
  }

  const guardarPerfil = async (event: FormEvent) => {
    event.preventDefault()
    const resultado = await editarPerfil.ejecutar({ nombreCompleto: nombre.trim() })
    if (!resultado.ok) return
    await refrescarUsuario().catch(() => undefined)
    setEditing(false)
    setSaved('Los cambios se guardaron correctamente.')
  }

  return (
    <section className="surface profile-page">
      <div className="profile-cover">
        <div className="profile-avatar">
          {iniciales(usuario.nombreCompleto)}
          <span>
            <Icon name="check" size={13} />
          </span>
        </div>
        <div>
          <h3>{usuario.nombreCompleto}</h3>
          <p>{ETIQUETAS_ROL[usuario.rol]}</p>
          <Badge tone={usuario.activo ? 'success' : 'neutral'}>
            {usuario.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
          </Badge>
        </div>
      </div>
      <div className="profile-page-layout">
        <div className="profile-body">
          {saved && (
            <div className="profile-saved" role="status">
              <span>
                <Icon name="check" />
              </span>
              <div>
                <strong>Perfil actualizado</strong>
                <p>{saved}</p>
              </div>
            </div>
          )}
          {editing ? (
            <form id="perfil-form" className="profile-edit-form" onSubmit={guardarPerfil}>
              <SectionHeading
                icon="user"
                title="Datos editables"
                subtitle="Solo puede cambiar su nombre. El correo lo modifica un administrador."
              />
              <div className="form-grid">
                <Field
                  label="Nombre completo"
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  maxLength={150}
                  required
                />
              </div>
              <AvisoError error={editarPerfil.error} />
            </form>
          ) : cambiandoContrasena ? (
            <CambiarContrasenaForm
              onListo={() => {
                setCambiandoContrasena(false)
                setSaved('Su contraseña se actualizó correctamente.')
              }}
            />
          ) : (
            <>
              <section>
                <SectionHeading
                  icon="user"
                  title="Información personal"
                  subtitle="Datos de identificación y contacto"
                />
                <DataGrid
                  items={[
                    ['Nombre completo', usuario.nombreCompleto],
                    ['Correo electrónico', usuario.correo],
                  ]}
                />
              </section>
              {/* Todo usuario tiene perfil comercial, sea cual sea su rol. */}
              <PerfilComercial onGuardado={setSaved} />
              <section>
                <SectionHeading
                  icon="settings"
                  title="Información de la cuenta"
                  subtitle="Acceso y asignación dentro de la plataforma"
                />
                <DataGrid
                  items={[
                    ['Rol asignado', ETIQUETAS_ROL[usuario.rol]],
                    ['Sucursal', branchLabel],
                    ['Estado', usuario.activo ? 'Activa' : 'Inactiva'],
                    ['Miembro desde', formatFechaLarga(usuario.creadoEn)],
                  ]}
                />
                <div className="account-readonly-note">
                  <Icon name="check" />
                  <p>
                    El rol y la sucursal están protegidos. Solo un administrador autorizado puede
                    modificarlos desde el módulo de usuarios.
                  </p>
                </div>
              </section>
            </>
          )}
        </div>
        <aside className="profile-side">
          <div>
            <span className="profile-side-icon">
              <Icon name="user" />
            </span>
            <h3>Su perfil</h3>
            <p>
              Mantener sus datos actualizados facilita la comunicación y validación de operaciones
              dentro de la plataforma.
            </p>
          </div>
          <ul>
            <li>
              <Icon name="check" size={14} /> {usuario.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
            </li>
            <li>
              <Icon name="check" size={14} />{' '}
              {usuario.activacionPendiente ? 'Activación pendiente' : 'Contraseña definida'}
            </li>
          </ul>
          <div className="profile-side-role">
            <small>Nivel de acceso</small>
            <strong>{ETIQUETAS_ROL[usuario.rol]}</strong>
            <span>{PISTAS_ROL[usuario.rol]}</span>
          </div>
        </aside>
      </div>
      <div className="profile-page-actions">
        {editing ? (
          <>
            <Button variant="ghost" onClick={() => setEditing(false)} disabled={editarPerfil.cargando}>
              Cancelar
            </Button>
            <Button type="submit" form="perfil-form" icon="check" disabled={editarPerfil.cargando}>
              {editarPerfil.cargando ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </>
        ) : cambiandoContrasena ? (
          <Button variant="ghost" onClick={() => setCambiandoContrasena(false)}>
            Cancelar
          </Button>
        ) : (
          <>
            <Button variant="secondary" icon="settings" onClick={() => setCambiandoContrasena(true)}>
              Cambiar contraseña
            </Button>
            <Button icon="user" onClick={empezarEdicion}>
              Editar perfil
            </Button>
          </>
        )}
      </div>
    </section>
  )
}
