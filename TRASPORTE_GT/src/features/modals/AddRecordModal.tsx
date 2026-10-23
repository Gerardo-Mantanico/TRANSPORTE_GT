import { useState, type FormEvent } from 'react'
import { errorMessage } from '../../api/client'
import {
  crearBus,
  actualizarBus,
  crearChofer,
  actualizarChofer,
  cambiarActivoBus,
  cambiarActivoChofer,
  subirFotoBus,
  subirFotoChofer,
} from '../../api/fleet'
import { crearRuta, crearViaje, actualizarRuta } from '../../api/trips'
import { solicitarAlquiler } from '../../api/rentals'
import { crearCategoria, registrarGastoTaller } from '../../api/costs'
import { crearSucursal, crearUsuario } from '../../api/identity'
import type {
  BusResponse,
  CategoriaResponse,
  ChoferResponse,
  RutaResponse,
  SucursalResponse,
} from '../../api/types'
import { useAuth } from '../../app/providers/useAuth'
import { Button } from '../../components/ui/Button'
import { Dropzone } from '../../components/ui/Dropzone'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { InfoNote } from '../../components/ui/Misc'
import { SelectField } from '../../components/ui/SelectField'
import { useToast } from '../../components/ui/useToast'
import { formatQ } from '../../utils/format'
import {
  YEAR_MAX,
  YEAR_MIN,
  afterDate,
  isValidEmail,
  isValidPhone,
  maxLen,
  required,
  toIntInRange,
  toNumberInRange,
} from '../../utils/validators'
import { mapearTipoLicenciaFrontend, mapearTipoLineaBackend } from '../lists/mappers'
import { TODAY } from '../../types'

const TITLES: Record<string, string> = {
  taller: 'Registrar gasto de taller',
  categorias: 'Nueva categoría',
}

const EDIT_TITLES: Record<string, string> = {
  taller: 'Editar gasto de taller',
  categorias: 'Editar categoría',
}

function resolveTitle(page: string, edit: boolean) {
  if (edit) return EDIT_TITLES[page] ?? `Editar registro de ${page}`
  return TITLES[page] ?? `Nuevo registro de ${page}`
}

function resolveNote(page: string): string | null {
  if (page === 'viajes') return 'El tipo de viaje no podrá modificarse después de guardar.'
  if (page === 'taller') return 'La categoría es obligatoria en todas las líneas del gasto.'
  if (page === 'buses' || page === 'choferes') return null
  if (page === 'usuarios')
    return 'Los usuarios no se eliminan; solo se desactivan. Debe existir al menos un administrador de sistema activo.'
  return 'Los cambios quedarán registrados en el historial de la plataforma.'
}

function PhotoField({
  label,
  onChange,
}: {
  label: string
  onChange?: (files: File[]) => void
}) {
  return <Dropzone label={label} multiple={false} max={1} onChange={onChange} />
}

function ActivoSwitch({
  activo,
  onChange,
  noun,
}: {
  activo: boolean
  onChange: (value: boolean) => void
  noun: string
}) {
  return (
    <label className="switch-row">
      <input
        type="checkbox"
        checked={activo}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <strong>Registro activo</strong>
        <small>
          Si lo desactiva, {noun} no estará disponible para nuevas asignaciones ni viajes nuevos.
        </small>
      </span>
    </label>
  )
}

function CurrentPhoto({ url, alt }: { url: string; alt: string }) {
  return (
    <div className="current-photo">
      <span>Foto registrada</span>
      <img src={url} alt={alt} />
    </div>
  )
}

function toIsoOffset(datetimeLocal: string): string {
  if (!datetimeLocal) return ''
  const date = new Date(datetimeLocal)
  return Number.isNaN(date.getTime()) ? datetimeLocal : date.toISOString()
}

interface ExpenseLine {
  id: number
  category: string
  kind: string
  description: string
  amount: string
}

interface WorkshopFormProps {
  buses: BusResponse[]
  categorias: CategoriaResponse[]
  onSubmit: (payload: {
    idBus: string
    fechaServicio: string
    lineas: Array<{ idCategoria: string; descripcion: string; tipo: 'MANO_DE_OBRA' | 'REPUESTO'; monto: number }>
  }) => Promise<void>
}

function WorkshopForm({ buses, categorias, onSubmit }: WorkshopFormProps) {
  const [bus, setBus] = useState('')
  const [date, setDate] = useState(TODAY)
  const [lines, setLines] = useState<ExpenseLine[]>([
    { id: 1, category: '', kind: 'Mano de obra', description: '', amount: '' },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const categoryOptions = categorias
    .filter((categoria) => categoria.activa)
    .map((categoria) => ({ value: categoria.id, label: categoria.nombre }))

  const updateLine = (id: number, patch: Partial<ExpenseLine>) =>
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)))

  const addLine = () =>
    setLines((current) => [
      ...current,
      {
        id: Math.max(...current.map((line) => line.id), 0) + 1,
        category: '',
        kind: 'Mano de obra',
        description: '',
        amount: '',
      },
    ])

  const removeLine = (id: number) =>
    setLines((current) => (current.length > 1 ? current.filter((line) => line.id !== id) : current))

  const total = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!bus) {
      setError('Selecciona el bus al que pertenece el gasto.')
      return
    }
    if (!date) {
      setError('La fecha del servicio es obligatoria.')
      return
    }
    for (const [index, line] of lines.entries()) {
      if (!line.category) {
        setError(`Línea ${index + 1}: selecciona la categoría.`)
        return
      }
      if (!line.description.trim()) {
        setError(`Línea ${index + 1}: la descripción es obligatoria.`)
        return
      }
      const amount = toNumberInRange(line.amount, 0.01, 99999999, 'el monto')
      if (!amount.ok) {
        setError(`Línea ${index + 1}: ${amount.error}`)
        return
      }
    }

    setSaving(true)
    try {
      await onSubmit({
        idBus: bus,
        fechaServicio: date,
        lineas: lines.map((line) => ({
          idCategoria: line.category,
          descripcion: line.description,
          tipo: mapearTipoLineaBackend(line.kind),
          monto: Number(line.amount) || 0,
        })),
      })
    } catch (caught) {
      const message = errorMessage(caught)
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} id="workshop-form">
      <div className="form-grid two">
        <Field label="Bus" required>
          <select value={bus} onChange={(event) => setBus(event.target.value)}>
            <option value="" disabled>
              Seleccione una opción
            </option>
            {buses.map((item) => (
              <option key={item.id} value={item.id}>
                {`${item.placa} · ${item.marca}`}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Fecha del servicio"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
      </div>
      <div className="expense-lines">
        {lines.map((line, index) => (
          <div className="expense-line-block" key={line.id}>
            <div className="expense-line-head">
              <strong>Línea {index + 1}</strong>
              {lines.length > 1 && (
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => removeLine(line.id)}
                  aria-label={`Eliminar línea ${index + 1}`}
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
            <div className="expense-line">
              <Field label="Categoría" required>
                <select
                  value={line.category}
                  onChange={(event) => updateLine(line.id, { category: event.target.value })}
                >
                  <option value="" disabled>
                    Seleccione una opción
                  </option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tipo" required>
                <select
                  value={line.kind}
                  onChange={(event) => updateLine(line.id, { kind: event.target.value })}
                >
                  <option>Mano de obra</option>
                  <option>Repuesto</option>
                </select>
              </Field>
              <Field
                label="Descripción"
                placeholder="Detalle del trabajo o repuesto"
                value={line.description}
                onChange={(event) => updateLine(line.id, { description: event.target.value })}
                required
              />
              <Field
                label="Monto"
                type="number"
                placeholder="0.00"
                value={line.amount}
                onChange={(event) => updateLine(line.id, { amount: event.target.value })}
                required
              />
            </div>
          </div>
        ))}
      </div>
      <Button variant="secondary" icon="plus" onClick={addLine}>
        Agregar línea
      </Button>
      <div className="total-line">
        <span>Total del gasto</span>
        <strong>{formatQ(total)}</strong>
      </div>
      {error && <p className="danger-copy">{error}</p>}
      <Button type="submit" disabled={saving}>
        {saving ? 'Guardando…' : 'Registrar gasto'}
      </Button>
    </form>
  )
}

export interface AddRecordModalProps {
  page: string
  onClose: () => void
  initial?: Record<string, string | number | boolean | null>
  sucursales?: SucursalResponse[]
  buses?: BusResponse[]
  choferes?: ChoferResponse[]
  rutas?: RutaResponse[]
  categorias?: CategoriaResponse[]
}

export function AddRecordModal({
  page,
  onClose,
  initial,
  sucursales = [],
  buses = [],
  choferes = [],
  rutas = [],
  categorias = [],
}: AddRecordModalProps) {
  const isEdit = Boolean(initial)
  const record = initial ?? {}
  const isWorkshop = page === 'taller'
  const isCategories = page === 'categorias'
          <form onSubmit={handleSubmit}>
            {isTrips && (
              <div className="form-grid two">
                <SelectField
                  label="Ruta"
                  options={routeOptions}
                  value={form.idRuta}
                  onChange={(value) => update({ idRuta: value })}
                  required
                />
                <SelectField
                  label="Bus asignado"
                  options={busOptions}
                  value={form.idBus}
                  onChange={(value) => update({ idBus: value })}
                  required
                />
                <SelectField
                  label="Chofer asignado"
                  options={driverOptions}
                  value={form.idChofer}
                  onChange={(value) => update({ idChofer: value })}
                  required
                />
                <Field
                  label="Fecha y hora de salida"
                  type="datetime-local"
                  value={form.depart}
                  onChange={(event) => update({ depart: event.target.value })}
                  required
                />
                <Field
                  label="Llegada estimada"
                  type="datetime-local"
                  value={form.arrive}
                  onChange={(event) => update({ arrive: event.target.value })}
                  required
                />
              </div>
            )}
            {isUsers && (
              <div className="form-grid two">
                <Field
                  label="Nombre completo"
                  placeholder="Nombre y apellido"
                  value={form.name}
                  onChange={(event) => update({ name: event.target.value })}
                  required
                />
                <Field
                  label="Correo"
                  type="email"
                  placeholder="usuario@correo.com"
                  value={form.correo}
                  onChange={(event) => update({ correo: event.target.value })}
                  required
                />
                <SelectField
                  label="Rol"
                  options={roleOptions}
                  value={form.rol}
                  onChange={(value) => update({ rol: value })}
                  required
                />
                <SelectField
                  label="Sucursal enlazada"
                  options={branchOptions}
                  value={form.idSucursal}
                  onChange={(value) => update({ idSucursal: value })}
                  required={form.rol !== 'ADMIN_SISTEMA'}
                />
              </div>
            )}
            {isBuses && (
              <div className="form-grid two">
                <Field
                  label="Placa"
                  placeholder="P-000ABC"
                  value={form.plate}
                  onChange={(event) => update({ plate: event.target.value })}
                  required
                />
                <Field
                  label="Marca"
                  placeholder="Mercedes-Benz"
                  value={form.brand}
                  onChange={(event) => update({ brand: event.target.value })}
                  required
                />
                <Field
                  label="Modelo"
                  placeholder="Marcopolo"
                  value={form.model}
                  onChange={(event) => update({ model: event.target.value })}
                  required
                />
                <Field
                  label="Año de fabricación"
                  type="number"
                  placeholder="2022"
                  value={form.year}
                  onChange={(event) =>
                    update({ year: event.target.value.replace(/\D/g, '').slice(0, 4) })
                  }
                  min={YEAR_MIN}
                  max={YEAR_MAX}
                  step={1}
                  inputMode="numeric"
                  required
                />
                <Field
                  label="Capacidad de pasajeros"
                  type="number"
                  placeholder="45"
                  value={form.capacity}
                  onChange={(event) =>
                    update({ capacity: event.target.value.replace(/\D/g, '') })
                  }
                  min={1}
                  max={600}
                  step={1}
                  inputMode="numeric"
                  required
                />
                <Field
                  label="Kilometraje actual (km)"
                  type="number"
                  placeholder="0"
                  value={form.mileage}
                  onChange={(event) =>
                    update({
                      mileage: event.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1'),
                    })
                  }
                  min={0}
                  step="any"
                  inputMode="decimal"
                />
                {isEdit && (
                  <div className="span-two">
                    <ActivoSwitch
                      activo={form.activo}
                      onChange={(value) => update({ activo: value })}
                      noun="el bus"
                    />
                  </div>
                )}
                {isEdit && form.fotoUrl && (
                  <div className="span-two">
                    <CurrentPhoto url={form.fotoUrl} alt={`Foto del bus ${form.plate}`} />
                  </div>
                )}
                <div className="span-two">
                  <PhotoField label="Foto del bus" onChange={setFotos} />
                </div>
              </div>
            )}
            {isDrivers && (
              <div className="form-grid two">
                <Field
                  label="Nombre completo"
                  placeholder="Nombre y apellido"
                  value={form.name}
                  onChange={(event) => update({ name: event.target.value })}
                  required
                />
                <Field
                  label="Correo"
                  type="email"
                  placeholder="chofer@correo.com"
                  value={form.correo}
                  onChange={(event) => update({ correo: event.target.value })}
                  required
                />
                <Field
                  label="Número de licencia"
                  placeholder="A-000000"
                  value={form.license}
                  onChange={(event) => update({ license: event.target.value })}
                  required
                />
                <SelectField
                  label="Tipo de licencia"
                  options={[
                    { value: 'A', label: 'A' },
                    { value: 'B', label: 'B' },
                    { value: 'C', label: 'C' },
                    { value: 'M', label: 'M' },
                    { value: 'E', label: 'E' },
                  ]}
                  value={form.licenseType}
                  onChange={(value) =>
                    update({ licenseType: mapearTipoLicenciaFrontend(value) })
                  }
                  required
                />
                <Field
                  label="Fecha de vencimiento"
                  type="date"
                  value={form.expiry}
                  onChange={(event) => update({ expiry: event.target.value })}
                  min={TODAY}
                  required
                />
                <Field
                  label="Teléfono"
                  placeholder="5555-0000"
                  value={form.phone}
                  onChange={(event) => update({ phone: event.target.value })}
                  required
                />
                <Field
                  label="Salario base por viaje (Q)"
                  type="number"
                  placeholder="520"
                  value={form.salary}
                  onChange={(event) => update({ salary: event.target.value })}
                  required
                />
                {!isEdit && (
                  <SelectField
                    label="Sucursal"
                    options={driverBranchOptions}
                    value={form.idSucursal}
                    onChange={(value) => update({ idSucursal: value })}
                    required
                  />
                )}
                {isEdit && (
                  <div className="span-two">
                    <ActivoSwitch
                      activo={form.activo}
                      onChange={(value) => update({ activo: value })}
                      noun="el chofer"
                    />
                  </div>
                )}
                {isEdit && form.fotoUrl && (
                  <div className="span-two">
                    <CurrentPhoto url={form.fotoUrl} alt={`Foto de ${form.name}`} />
                  </div>
                )}
                <div className="span-two">
                  <PhotoField label="Foto del chofer" onChange={setFotos} />
                </div>
              </div>
            )}
            {isRoutes && (
              <div className="form-grid two">
                <SelectField
                  label="Sucursal de origen"
                  options={branchOptions}
                  value={form.idSucursal}
                  onChange={(value) => update({ idSucursal: value })}
                  required
                />
                <SelectField
                  label="Sucursal de destino"
                  options={branchOptions.filter((option) => option.value !== form.idSucursal)}
                  value={typeof record.idSucursalDestino === 'string' ? record.idSucursalDestino : ''}
                  onChange={() => undefined}
                  disabled
                />
                <Field
                  label="Distancia aproximada (km)"
                  type="number"
                  placeholder="42"
                  value={form.distance}
                  onChange={(event) => update({ distance: event.target.value })}
                  required
                />
                <Field
                  label="Precio del boleto (Q)"
                  type="number"
                  placeholder="125.00"
                  value={form.price}
                  onChange={(event) => update({ price: event.target.value })}
                  required
                />
              </div>
            )}
            {isBranches && (
              <div className="form-grid two">
                <Field
                  label="Nombre de la sucursal"
                  placeholder="Ej. Guatemala Centro"
                  value={form.originName}
                  onChange={(event) => update({ originName: event.target.value })}
                  required
                />
                <Field
                  label="Departamento"
                  placeholder="Ej. Quetzaltenango"
                  value={form.department}
                  onChange={(event) => update({ department: event.target.value })}
                />
                <div className="span-two">
                  <Field
                    label="Dirección"
                    placeholder="Zona, calle, número"
                    value={form.address}
                    onChange={(event) => update({ address: event.target.value })}
                  />
                </div>
                <Field
                  label="Teléfono"
                  placeholder="77651234"
                  value={form.telefono}
                  onChange={(event) => update({ telefono: event.target.value })}
                />
                <Field
                  label="Nombre del administrador"
                  placeholder="Nombre y apellido"
                  value={form.adminNombre}
                  onChange={(event) => update({ adminNombre: event.target.value })}
                  required
                />
                <Field
                  label="Correo del administrador"
                  type="email"
                  placeholder="admin.sucursal@transportes.gt"
                  value={form.adminCorreo}
                  onChange={(event) => update({ adminCorreo: event.target.value })}
                  required
                />
              </div>
            )}
            {isCategories && (
              <div className="form-grid">
                <Field
                  label="Nombre de la categoría"
                  placeholder="Ej. Eléctrico"
                  value={form.categoryName}
                  onChange={(event) => update({ categoryName: event.target.value })}
                  required
                />
                <Field
                  label="Descripción"
                  placeholder="Detalle de la categoría"
                  value={form.categoryDescription}
                  onChange={(event) => update({ categoryDescription: event.target.value })}
                />
              </div>
            )}
            {isRentals && (
              <div className="form-grid two">
                <SelectField
                  label="Sucursal de origen"
                  options={branchOptions}
                  value={form.idSucursal}
                  onChange={(value) => update({ idSucursal: value })}
                  required
                />
                <Field
                  label="Destino"
                  placeholder="Ej. Monterrico"
                  value={form.destination}
                  onChange={(event) => update({ destination: event.target.value })}
                  required
                />
                <Field
                  label="Fecha de salida"
                  type="date"
                  value={form.departureDate}
                  onChange={(event) => update({ departureDate: event.target.value })}
                  required
                />
                <Field
                  label="Número de pasajeros"
                  type="number"
                  placeholder="32"
                  value={form.passengers}
                  onChange={(event) => update({ passengers: event.target.value })}
                  required
                />
                <Field
                  label="Distancia estimada (km)"
                  type="number"
                  placeholder="80"
                  value={form.distanceKm}
                  onChange={(event) => update({ distanceKm: event.target.value })}
                  required
                />
                <Field
                  label="NIT del cliente (opcional)"
                  placeholder="1234567-8"
                  value={form.nit}
                  onChange={(event) => update({ nit: event.target.value })}
                />
              </div>
            )}
            {!isTrips &&
              !isWorkshop &&
              !isUsers &&
              !isBuses &&
              !isDrivers &&
              !isRoutes &&
              !isBranches &&
              !isCategories &&
              !isRentals && (
                <div className="form-grid">
                  <Field label="Nombre o referencia" placeholder="Ingrese la información" required />
                  <Field label="Fecha de registro" type="date" defaultValue={TODAY} required />
                  <SelectField label="Estado" options={['Activo', 'Inactivo']} required />
                </div>
              )}
            {resolveNote(page) && <InfoNote>{resolveNote(page)}</InfoNote>}
            {error && <p className="danger-copy">{error}</p>}
            <footer>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? 'Guardando…'
                  : isEdit
                    ? 'Guardar cambios'
                    : isTrips
                      ? 'Programar viaje'
                      : 'Guardar registro'}
              </Button>
            </footer>
          </form>
        </div>
      </section>
    </div>
  )
}
