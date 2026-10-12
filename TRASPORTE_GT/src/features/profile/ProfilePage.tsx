import { useEffect, useState } from 'react'
import { useAuth } from '../../app/providers/useAuth'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'

const PROFILE_DATA: [string, string][] = [
  ['Nombre completo', 'Ana Sofía Martínez López'],
  ['Correo electrónico', 'ana.martinez@cnb.gt'],
  ['Teléfono', '+502 5555 0184'],
  ['DPI', '2456 78120 0101'],
  ['NIT', '548921-2'],
]

const ACCOUNT_SIDEBAR_POINTS = ['Identidad verificada', 'Correo confirmado', 'Información completa']

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
        <div key={label} className={label === 'Dirección' ? 'wide' : ''}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  )
}

export function ProfilePage() {
  const { role } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!saved) return
    const timer = window.setTimeout(() => setSaved(false), 2800)
    return () => window.clearTimeout(timer)
  }, [saved])

  const branchLabel =
    role === 'Administrador del sistema' ? 'Acceso global' : role === 'Cliente' ? 'No aplica' : 'Guatemala Centro'

  const roleHint =
    role === 'Administrador del sistema'
      ? 'Acceso a todas las sucursales'
      : role === 'Cliente'
        ? 'Compras y alquileres en línea'
        : 'Gestión de Guatemala Centro'

  return (
    <section className="surface profile-page">
      <div className="profile-cover">
        <div className="profile-avatar">
          AM
          <span>
            <Icon name="check" size={13} />
          </span>
        </div>
        <div>
          <h3>Ana Martínez</h3>
          <p>{role}</p>
          <Badge tone="success">Cuenta activa</Badge>
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
                <p>Los cambios se guardaron correctamente.</p>
              </div>
            </div>
          )}
          {editing ? (
            <section className="profile-edit-form">
              <SectionHeading
                icon="user"
                title="Datos editables"
                subtitle="Los campos marcados son obligatorios para su perfil."
              />
              <div className="form-grid two">
                <Field label="Nombre completo" defaultValue="Ana Sofía Martínez López" required />
                <Field label="Correo electrónico" type="email" defaultValue="ana.martinez@cnb.gt" required />
                <Field label="Teléfono" type="tel" defaultValue="+502 5555 0184" required />
                <Field label="DPI" defaultValue="2456 78120 0101" required />
                <Field label="NIT" defaultValue="548921-2" required />
                <div className="span-two">
                  <Field label="Dirección" defaultValue="Zona 10, Ciudad de Guatemala" required />
                </div>
              </div>
              <div className="profile-form-note">
                <Icon name="check" />
                <span>Su correo y NIT deben ser únicos dentro del sistema.</span>
              </div>
            </section>
          ) : (
            <>
              <section>
                <SectionHeading
                  icon="user"
                  title="Información personal"
                  subtitle="Datos de identificación y contacto"
                />
                <DataGrid items={[...PROFILE_DATA, ['Dirección', 'Zona 10, Ciudad de Guatemala']]} />
              </section>
              <section>
                <SectionHeading
                  icon="settings"
                  title="Información de la cuenta"
                  subtitle="Acceso y asignación dentro de la plataforma"
                />
                <DataGrid
                  items={[
                    ['Rol asignado', role ?? '—'],
                    ['Sucursal', branchLabel],
                    ['Último acceso', 'Hoy, 08:42'],
                    ['Miembro desde', '12 de marzo de 2024'],
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
              <div className="profile-security">
                <span>
                  <Icon name="check" />
                </span>
                <div>
                  <strong>Cuenta protegida</strong>
                  <p>Su sesión utiliza acceso seguro y registro de actividad.</p>
                </div>
                <small>
                  <Icon name="clock" size={13} /> Hoy, 08:42
                </small>
              </div>
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
            {ACCOUNT_SIDEBAR_POINTS.map((point) => (
              <li key={point}>
                <Icon name="check" size={14} /> {point}
              </li>
            ))}
          </ul>
          <div className="profile-side-role">
            <small>Nivel de acceso</small>
            <strong>{role}</strong>
            <span>{roleHint}</span>
          </div>
        </aside>
      </div>
      <div className="profile-page-actions">
        {editing ? (
          <>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button
              icon="check"
              onClick={() => {
                setEditing(false)
                setSaved(true)
              }}
            >
              Guardar cambios
            </Button>
          </>
        ) : (
          <Button icon="user" onClick={() => setEditing(true)}>
            Editar perfil
          </Button>
        )}
      </div>
    </section>
  )
}
