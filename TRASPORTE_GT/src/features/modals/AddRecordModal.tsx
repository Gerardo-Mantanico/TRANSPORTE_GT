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
  viajes: 'Programar viaje',
  taller: 'Registrar gasto de taller',
  usuarios: 'Crear usuario administrador',
  alquileres: 'Registrar solicitud de alquiler',
  categorias: 'Nueva categoría',
  buses: 'Registrar bus',
  choferes: 'Registrar chofer',
  rutas: 'Nueva ruta',
  sucursales: 'Nueva sucursal',
}

const EDIT_TITLES: Record<string, string> = {
  viajes: 'Editar viaje',
  taller: 'Editar gasto de taller',
  usuarios: 'Editar usuario',
  alquileres: 'Editar alquiler',
  categorias: 'Editar categoría',
  buses: 'Editar bus',
  choferes: 'Editar chofer',
  rutas: 'Editar ruta',
  sucursales: 'Editar sucursal',
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
  const isTrips = page === 'viajes'
  const isWorkshop = page === 'taller'
  const isUsers = page === 'usuarios'
  const isBuses = page === 'buses'
  const isDrivers = page === 'choferes'
  const isRoutes = page === 'rutas'
  const isBranches = page === 'sucursales'
  const isCategories = page === 'categorias'
  const isRentals = page === 'alquileres'
  const { role, user } = useAuth()
  const canCreateSystemAdmin = role === 'Administrador del sistema'
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fotos, setFotos] = useState<File[]>([])
  const toast = useToast()

  const branchOptions = sucursales.map((sucursal) => ({ value: sucursal.id, label: sucursal.nombre }))
  const driverBranchOptions = user?.idSucursal
    ? branchOptions.filter((option) => option.value === user.idSucursal)
    : branchOptions
  const busOptions = buses.map((bus) => ({ value: bus.id, label: `${bus.placa} · ${bus.capacidadPasajeros} pas.` }))
  const driverOptions = choferes.map((chofer) => ({
    value: chofer.id,
    label: `${chofer.nombreCompleto} · ${chofer.numeroLicencia}`,
  }))
  const routeOptions = rutas.map((ruta) => ({
    value: ruta.id,
    label: `${sucursales.find((s) => s.id === ruta.idSucursalOrigen)?.nombre ?? 'Origen'} → ${
      sucursales.find((s) => s.id === ruta.idSucursalDestino)?.nombre ?? 'Destino'
    }`,
  }))
  const roleOptions = canCreateSystemAdmin
    ? [
        { value: 'ADMIN_SUCURSAL', label: 'Administrador de sucursal' },
        { value: 'ADMIN_SISTEMA', label: 'Administrador del sistema' },
        { value: 'CAJERO', label: 'Cajero' },
      ]
    : [
        { value: 'CAJERO', label: 'Cajero' },
        { value: 'CHOFER', label: 'Chofer' },
      ]

  const [form, setForm] = useState(() => ({
    name: typeof record.name === 'string' ? record.name : '',
    correo: typeof record.correo === 'string' ? record.correo : typeof record.email === 'string' ? record.email : '',
    contrasena: '',
    rol: typeof record.role === 'string' && record.role.includes(' ') ? '' : typeof record.role === 'string' ? record.role : 'CAJERO',
    plate: typeof record.plate === 'string' ? record.plate : '',
    brand: typeof record.brand === 'string' ? record.brand : '',
    model: typeof record.model === 'string' ? record.model : '',
    year: typeof record.year === 'number' ? String(record.year) : '',
    capacity: typeof record.capacity === 'number' ? String(record.capacity) : '',
    mileage: typeof record.mileage === 'string' ? record.mileage.replace(/[^\d]/g, '') : typeof record.mileage === 'number' ? String(record.mileage) : '',
    license: typeof record.license === 'string' ? record.license : '',
    licenseType: typeof record.licenseType === 'string' ? mapearTipoLicenciaFrontend(record.licenseType) : 'B',
    expiry: typeof record.expiry === 'string' ? record.expiry : TODAY,
    phone: typeof record.phone === 'string' ? record.phone : '',
    salary: typeof record.salary === 'string' ? record.salary.replace(/[^\d.]/g, '') : typeof record.salary === 'number' ? String(record.salary) : '',
    idSucursal:
      typeof record.idSucursal === 'string'
        ? record.idSucursal
        : typeof record.idSucursalOrigen === 'string'
          ? record.idSucursalOrigen
          : (page === 'choferes' && user?.idSucursal) || sucursales[0]?.id || '',
    idRuta: typeof record.idRuta === 'string' ? record.idRuta : rutas[0]?.id ?? '',
    idBus: typeof record.idBus === 'string' ? record.idBus : buses[0]?.id ?? '',
    idChofer: typeof record.idChofer === 'string' ? record.idChofer : choferes[0]?.id ?? '',
    depart: typeof record.fechaHoraSalida === 'string' ? record.fechaHoraSalida.slice(0, 16) : `${TODAY}T08:00`,
    arrive:
      typeof record.fechaHoraLlegadaEstimada === 'string' && record.fechaHoraLlegadaEstimada
        ? record.fechaHoraLlegadaEstimada.slice(0, 16)
        : `${TODAY}T10:30`,
    destination: '',
    originName: typeof record.name === 'string' ? record.name : '',
    department: typeof record.location === 'string' ? record.location : '',
    address: '',
    telefono: '',
    adminNombre: typeof record.admin === 'string' ? record.admin : '',
    adminCorreo: '',
    categoryName: typeof record.name === 'string' ? record.name : '',
    categoryDescription: '',
    distance: typeof record.distance === 'number' ? String(record.distance) : typeof record.distance === 'string' ? record.distance.replace(/[^\d.]/g, '') : '',
    price: typeof record.price === 'number' ? String(record.price) : typeof record.price === 'string' ? record.price.replace(/[^\d.]/g, '') : '',
    clientName: typeof record.client === 'string' ? record.client : '',
    passengers: typeof record.passengers === 'number' ? String(record.passengers) : '12',
    departureDate: TODAY,
    nit: '',
    distanceKm: '',
    activo: typeof record.activo === 'boolean' ? record.activo : true,
    fotoUrl: typeof record.fotoUrl === 'string' ? record.fotoUrl : '',
  }))

  const update = (patch: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...patch }))

  const editId = typeof record.id === 'string' ? record.id : null
  const editVersion = typeof record.version === 'number' ? record.version : undefined

  const guardarFotoEn = async (id: string) => {
    const foto = fotos[0]
    if (!foto) return
    try {
      if (isBuses) await subirFotoBus(id, foto)
      else await subirFotoChofer(id, foto)
    } catch (caught) {
      throw new Error(
        `El registro se guardó, pero no se pudo subir la foto: ${errorMessage(caught)}`,
        { cause: caught },
      )
    }
  }

  const cambiarActivoSeguro = async (activo: boolean) => {
    try {
      if (isBuses) await cambiarActivoBus(editId ?? '', activo)
      else await cambiarActivoChofer(editId ?? '', activo)
    } catch (caught) {
      throw new Error(
        `No se pudo ${activo ? 'activar' : 'desactivar'} ${isBuses ? 'el bus' : 'el chofer'}: ${errorMessage(caught)}`,
        { cause: caught },
      )
    }
  }

  const validateMain = () => {
    if (isBuses) {
      const plate = form.plate.trim()
      if (!plate) throw new Error('La placa es obligatoria.')
      const plateLen = maxLen(plate, 15, 'La placa')
      if (plateLen) throw new Error(plateLen)
      const brand = required(form.brand, 'La marca')
      if (brand) throw new Error(brand)
      const brandLen = maxLen(form.brand, 50, 'La marca')
      if (brandLen) throw new Error(brandLen)
      const model = required(form.model, 'El modelo')
      if (model) throw new Error(model)
      const modelLen = maxLen(form.model, 50, 'El modelo')
      if (modelLen) throw new Error(modelLen)
      const year = toIntInRange(form.year, YEAR_MIN, YEAR_MAX)
      if (!year.ok) throw new Error(`Año de fabricación: ${year.error}`)
      const capacity = toIntInRange(form.capacity, 1, 600)
      if (!capacity.ok) throw new Error(`Capacidad de pasajeros: ${capacity.error}`)
      if (form.mileage !== '') {
        const mileage = toNumberInRange(form.mileage, 0, 9999999.9, 'El kilometraje')
        if (!mileage.ok) throw new Error(mileage.error)
      }
    }

    if (isDrivers) {
      const name = required(form.name, 'El nombre completo')
      if (name) throw new Error(name)
      const nameLen = maxLen(form.name, 150, 'El nombre completo')
      if (nameLen) throw new Error(nameLen)
      if (!isValidEmail(form.correo)) throw new Error('Ingresa un correo electrónico válido.')
      const mailLen = maxLen(form.correo, 150, 'El correo')
      if (mailLen) throw new Error(mailLen)
      const phone = required(form.phone, 'El teléfono')
      if (phone) throw new Error(phone)
      if (!isValidPhone(form.phone)) {
        throw new Error('El teléfono solo puede contener dígitos, espacios, "+" y "-" (máx. 20 caracteres).')
      }
      const license = required(form.license, 'El número de licencia')
      if (license) throw new Error(license)
      const licenseLen = maxLen(form.license, 30, 'El número de licencia')
      if (licenseLen) throw new Error(licenseLen)
      if (!form.expiry) throw new Error('La fecha de vencimiento de la licencia es obligatoria.')
      if (!isEdit && form.expiry < TODAY) {
        throw new Error('La fecha de vencimiento de la licencia no puede estar en el pasado.')
      }
      const salaryReq = required(form.salary, 'El salario base')
      if (salaryReq) throw new Error(salaryReq)
      const salary = toNumberInRange(form.salary, 0, 99999999, 'El salario base')
      if (!salary.ok) throw new Error(salary.error)
      if (!isEdit && !form.idSucursal) throw new Error('Selecciona la sucursal del chofer.')
    }

    if (isRoutes) {
      const distance = toNumberInRange(form.distance, 0.01, 100000, 'La distancia (km)')
      if (!distance.ok) throw new Error(distance.error)
      const price = toNumberInRange(form.price, 0, 1000000, 'El precio del boleto')
      if (!price.ok) throw new Error(price.error)
      if (!form.idSucursal) throw new Error('Selecciona la sucursal de origen.')
    }

    if (isTrips) {
      if (!form.idRuta) throw new Error('Selecciona la ruta del viaje.')
      if (!form.idBus) throw new Error('Selecciona el bus asignado.')
      if (!form.idChofer) throw new Error('Selecciona el chofer asignado.')
      if (!form.depart) throw new Error('La fecha y hora de salida son obligatorias.')
      if (!form.arrive) throw new Error('La fecha y hora de llegada estimada son obligatorias.')
      const arrival = afterDate(form.depart, form.arrive, 'la salida', 'la llegada estimada')
      if (arrival) throw new Error(arrival)
    }

    if (isCategories) {
      const name = (form.categoryName || form.name).trim()
      if (!name) throw new Error('El nombre de la categoría es obligatorio.')
      const nameLen = maxLen(name, 100, 'El nombre de la categoría')
      if (nameLen) throw new Error(nameLen)
    }

    if (isBranches) {
      const name = (form.originName || form.name).trim()
      if (!name) throw new Error('El nombre de la sucursal es obligatorio.')
      const nameLen = maxLen(name, 150, 'El nombre de la sucursal')
      if (nameLen) throw new Error(nameLen)
      if (!isValidEmail(form.adminCorreo)) {
        throw new Error('Ingresa un correo electrónico válido para el administrador.')
      }
      if (form.telefono && !isValidPhone(form.telefono)) {
        throw new Error('El teléfono de la sucursal solo puede contener dígitos, espacios, "+" y "-".')
      }
    }

    if (isUsers) {
      const name = required(form.name, 'El nombre completo')
      if (name) throw new Error(name)
      const nameLen = maxLen(form.name, 150, 'El nombre completo')
      if (nameLen) throw new Error(nameLen)
      if (!isValidEmail(form.correo)) throw new Error('Ingresa un correo electrónico válido.')
      if (!form.rol) throw new Error('Selecciona el rol del usuario.')
      if (form.rol !== 'ADMIN_SISTEMA' && form.rol !== 'CLIENTE' && !form.idSucursal) {
        throw new Error('Selecciona la sucursal a la que pertenece el usuario.')
      }
    }

    if (isRentals) {
      if (!form.idSucursal) throw new Error('Selecciona la sucursal de origen.')
      const destination = required(form.destination, 'El destino')
      if (destination) throw new Error(destination)
      const destinationLen = maxLen(form.destination, 150, 'El destino')
      if (destinationLen) throw new Error(destinationLen)
      if (!form.departureDate) throw new Error('La fecha de salida es obligatoria.')
      const passengers = toIntInRange(form.passengers, 1, 300)
      if (!passengers.ok) throw new Error(`Número de pasajeros: ${passengers.error}`)
      const distance = toNumberInRange(form.distanceKm, 0.01, 100000, 'La distancia estimada (km)')
      if (!distance.ok) throw new Error(distance.error)
    }
  }

  const submitMain = async (): Promise<void> => {
    if (isWorkshop) return

    validateMain()

    if (isBuses) {
      const yearNum = Number(form.year)
      const capacityNum = Number(form.capacity)
      const mileageNum = form.mileage === '' ? 0 : Number(form.mileage)
      const payload = {
        placa: form.plate,
        marca: form.brand,
        modelo: form.model,
        anioFabricacion: yearNum,
        capacidadPasajeros: capacityNum,
        kilometrajeActual: mileageNum,
      }
      if (isEdit && editId) {
        await actualizarBus(editId, { ...payload, version: editVersion })
        if (typeof record.activo === 'boolean' && form.activo !== record.activo) {
          await cambiarActivoSeguro(form.activo)
        }
        await guardarFotoEn(editId)
      } else {
        const created = await crearBus(payload)
        await guardarFotoEn(created.id)
      }
      return
    }

    if (isDrivers) {
      const payload = {
        nombreCompleto: form.name,
        correo: form.correo,
        telefono: form.phone,
        numeroLicencia: form.license,
        tipoLicencia: form.licenseType as 'A' | 'B' | 'C' | 'M' | 'E',
        fechaVencimientoLicencia: form.expiry,
        salarioBaseViaje: Number(form.salary) || 0,
      }
      if (isEdit && editId) {
        await actualizarChofer(editId, { ...payload, version: editVersion })
        if (typeof record.activo === 'boolean' && form.activo !== record.activo) {
          await cambiarActivoSeguro(form.activo)
        }
        await guardarFotoEn(editId)
      } else {
        const created = await crearChofer({ ...payload, idSucursal: form.idSucursal })
        await guardarFotoEn(created.id)
      }
      return
    }

    if (isRoutes) {
      const idOrigen = form.idSucursal
      const idDestino =
        typeof record.idSucursalDestino === 'string' && record.idSucursalDestino
          ? record.idSucursalDestino
          : (sucursales.find((sucursal) => sucursal.id !== idOrigen)?.id ?? idOrigen)
      const payload = {
        idSucursalOrigen: idOrigen,
        idSucursalDestino: idDestino,
        distanciaKm: Number(form.distance) || 0,
        precioBoleto: Number(form.price) || 0,
      }
      if (isEdit && editId) {
        await actualizarRuta(editId, payload)
      } else {
        await crearRuta(payload)
      }
      return
    }

    if (isTrips) {
      await crearViaje({
        idRuta: form.idRuta,
        idBus: form.idBus,
        idChofer: form.idChofer,
        fechaHoraSalida: toIsoOffset(form.depart),
        fechaHoraLlegadaEstimada: toIsoOffset(form.arrive),
      })
      return
    }

    if (isCategories) {
      await crearCategoria({ nombre: form.categoryName || form.name, descripcion: form.categoryDescription || null })
      return
    }

    if (isBranches) {
      await crearSucursal({
        sucursal: {
          nombre: form.originName || form.name,
          departamento: form.department || undefined,
          direccion: form.address || undefined,
          telefono: form.telefono || undefined,
        },
        administrador: {
          nombreCompleto: form.adminNombre || 'Administrador',
          correo: form.adminCorreo,
        },
      })
      return
    }

    if (isUsers) {
      const sucursalId = form.idSucursal
      await crearUsuario({
        nombreCompleto: form.name,
        correo: form.correo,
        rol: form.rol as 'ADMIN_SISTEMA' | 'ADMIN_SUCURSAL' | 'CAJERO' | 'CHOFER' | 'CLIENTE',
        idSucursal: form.rol === 'ADMIN_SISTEMA' || form.rol === 'CLIENTE' ? null : sucursalId || null,
      })
      return
    }

    if (isRentals) {
      const idSucursalOrigen = form.idSucursal
      const sucursal = sucursales.find((s) => s.id === idSucursalOrigen)
      await solicitarAlquiler({
        idSucursalOrigen,
        origen: sucursal?.nombre ?? 'Origen',
        destino: form.destination || 'Destino',
        fechaHoraSalida: toIsoOffset(`${form.departureDate}T08:00`),
        numeroPasajeros: Number(form.passengers) || 1,
        distanciaEstimadaKm: Number(form.distanceKm) || 50,
      })
      return
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (isWorkshop) return
    setError(null)
    setSaving(true)
    try {
      await submitMain()
      toast.success(isEdit ? 'Los cambios se guardaron correctamente.' : 'Registro guardado correctamente.')
      onClose()
    } catch (caught) {
      const message = errorMessage(caught)
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleWorkshopSubmit = async (payload: {
    idBus: string
    fechaServicio: string
    lineas: Array<{ idCategoria: string; descripcion: string; tipo: 'MANO_DE_OBRA' | 'REPUESTO'; monto: number }>
  }) => {
    await registrarGastoTaller(payload)
    toast.success('Gasto de taller registrado correctamente.')
    onClose()
  }

  if (isWorkshop) {
    return (
      <div className="modal-layer">
        <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
        <section className="modal" role="dialog" aria-modal="true">
          <header>
            <div>
              <span className="eyebrow">Nuevo registro</span>
              <h2>{resolveTitle(page, false)}</h2>
            </div>
            <button className="icon-button" onClick={onClose} aria-label="Cerrar">
              <Icon name="close" />
            </button>
          </header>
          <div className="modal-body">
            <WorkshopForm buses={buses} categorias={categorias} onSubmit={handleWorkshopSubmit} />
            {resolveNote(page) && <InfoNote>{resolveNote(page)}</InfoNote>}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section className="modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span className="eyebrow">{isEdit ? 'Editar registro' : 'Nuevo registro'}</span>
            <h2>{resolveTitle(page, isEdit)}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">
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
