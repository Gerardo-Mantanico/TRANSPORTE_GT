import { useEffect, useState, type FormEvent } from 'react'
import { errorMessage } from '../../api/client'
import { actualizarPerfil, obtenerYo } from '../../api/identity'
import { actualizarClienteYo, obtenerClienteYo } from '../../api/wallet'
import type { ClienteResponse, UsuarioResponse } from '../../api/types'
import { useAuth } from '../../app/providers/useAuth'
import { initialsOf } from '../../app/providers/roles'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { useToast } from '../../components/ui/useToast'
import { formatDateEs } from '../../utils/format'
import { isValidPhone, maxLen, required } from '../../utils/validators'

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
  const { role, user, login, token } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [perfil, setPerfil] = useState<UsuarioResponse | null>(null)
  const [cliente, setCliente] = useState<ClienteResponse | null>(null)
  const [form, setForm] = useState({
    nombreCompleto: '',
    telefono: '',
    dpi: '',
    nit: '',
    direccion: '',
  })
  const toast = useToast()

  const fail = (message: string) => {
    setError(message)
    toast.error(message)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const yo = await obtenerYo()
        if (cancelled) return
        setPerfil(yo)
        setForm((prev) => ({
          ...prev,
          nombreCompleto: yo.nombreCompleto,
        }))
        const clienteData = await obtenerClienteYo()
        if (!cancelled && clienteData) {
          setCliente(clienteData)
          setForm((prev) => ({
            ...prev,
            telefono: clienteData.telefono ?? '',
            dpi: clienteData.dpi ?? '',
            nit: clienteData.nit ?? '',
            direccion: clienteData.direccion ?? '',
          }))
        }
      } catch (caught) {
        if (cancelled) return
        const message = errorMessage(caught)
        setError(message)
        toast.error(message)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [toast])

  const branchLabel =
    role === 'Administrador del sistema'
      ? 'Acceso global'
      : role === 'Cliente'
        ? 'No aplica'
        : perfil?.nombreSucursal ?? '—'

  const roleHint =
    role === 'Administrador del sistema'
      ? 'Acceso a todas las sucursales'
      : role === 'Cliente'
        ? 'Compras y alquileres en línea'
        : `Gestión de ${perfil?.nombreSucursal ?? 'su sucursal'}`

  const displayName = perfil?.nombreCompleto ?? user?.nombreCompleto ?? 'Usuario'
  const initials = initialsOf(displayName)

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const nameError = required(form.nombreCompleto, 'El nombre completo')
    if (nameError) {
      fail(nameError)
      return
    }
    const nameLen = maxLen(form.nombreCompleto, 150, 'El nombre completo')
    if (nameLen) {
      fail(nameLen)
      return
    }
    if (form.telefono && !isValidPhone(form.telefono)) {
      fail('El teléfono solo puede contener dígitos, espacios, "+" y "-" (máx. 20 caracteres).')
      return
    }
    if (form.dpi && !/^\d{1,13}$/.test(form.dpi.trim())) {
      fail('El DPI debe contener solo dígitos (máximo 13).')
      return
    }
    if (form.nit && !/^[0-9kK-]{1,15}$/.test(form.nit.trim())) {
      fail('El NIT solo puede contener dígitos, "K", "-" (máximo 15 caracteres).')
      return
    }

    setSaving(true)
    try {
      const updated = await actualizarPerfil(form.nombreCompleto)
      setPerfil(updated)
      if (role === 'Cliente' && (form.nit || form.dpi || form.telefono || form.direccion)) {
        const clienteActualizado = await actualizarClienteYo({
          nit: form.nit || null,
          dpi: form.dpi || null,
          telefono: form.telefono || null,
          direccion: form.direccion || null,
        })
        setCliente(clienteActualizado)
      }
      if (token && user) {
        login({
          token,
          expiraEn: new Date().toISOString(),
          usuario: { ...user, nombreCompleto: updated.nombreCompleto },
        })
      }
      setEditing(false)
      setSaved(true)
      toast.success('Perfil actualizado correctamente.')
    } catch (caught) {
      fail(errorMessage(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="surface profile-page">
      <div className="profile-cover">
        <div className="profile-avatar">
          {initials}
          <span>
            <Icon name="check" size={13} />
          </span>
        </div>
        <div>
          <h3>{displayName}</h3>
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
          {error && <p className="danger-copy">{error}</p>}
          {editing ? (
            <form className="profile-edit-form" onSubmit={handleSave}>
              <SectionHeading
                icon="user"
                title="Datos editables"
                subtitle="Solo puede cambiar su nombre. El correo lo modifica un administrador."
              />
              <div className="form-grid two">
                <Field
                  label="Nombre completo"
                  value={form.nombreCompleto}
                  onChange={(event) => setForm((prev) => ({ ...prev, nombreCompleto: event.target.value }))}
                  required
                />
                <Field label="Correo electrónico" type="email" defaultValue={perfil?.correo ?? ''} disabled />
                <Field
                  label="Teléfono"
                  type="tel"
                  value={form.telefono}
                  onChange={(event) => setForm((prev) => ({ ...prev, telefono: event.target.value }))}
                />
                <Field
                  label="DPI"
                  value={form.dpi}
                  onChange={(event) => setForm((prev) => ({ ...prev, dpi: event.target.value }))}
                />
                <Field
                  label="NIT"
                  value={form.nit}
                  onChange={(event) => setForm((prev) => ({ ...prev, nit: event.target.value }))}
                />
                <div className="span-two">
                  <Field
                    label="Dirección"
                    value={form.direccion}
                    onChange={(event) => setForm((prev) => ({ ...prev, direccion: event.target.value }))}
                  />
                </div>
              </div>
              <div className="profile-form-note">
                <Icon name="check" />
                <span>Su correo y NIT deben ser únicos dentro del sistema.</span>
              </div>
            </form>
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
                    ['Nombre completo', perfil?.nombreCompleto ?? '—'],
                    ['Correo electrónico', perfil?.correo ?? '—'],
                    ['Teléfono', cliente?.telefono ?? '—'],
                    ['DPI', cliente?.dpi ?? '—'],
                    ['NIT', cliente?.nit ?? '—'],
                    ['Dirección', cliente?.direccion ?? '—'],
                  ]}
                />
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
                    ['Creado', perfil?.creadoEn ? formatDateEs(perfil.creadoEn.slice(0, 10)) : '—'],
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
            <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button icon="check" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </>
        ) : (
          <>
            <Button icon="user" onClick={() => setEditing(true)}>
              Editar perfil
            </Button>
          </>
        )}
      </div>
    </section>
  )
}
