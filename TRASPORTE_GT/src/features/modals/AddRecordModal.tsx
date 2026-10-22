import { useState } from 'react'
import {
  BUSES,
  BRANCH_NAMES,
  DRIVERS,
  EXPENSE_CATEGORIES,
  ROUTES,
  TODAY,
} from '../../data/mock'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { InfoNote } from '../../components/ui/Misc'
import { SelectField } from '../../components/ui/SelectField'
import { formatQ } from '../../utils/format'

const TITLES: Record<string, string> = {
  viajes: 'Programar viaje',
  taller: 'Registrar gasto de taller',
  alquileres: 'Registrar solicitud de alquiler',
  categorias: 'Nueva categoría',
  rutas: 'Nueva ruta',
}

const EDIT_TITLES: Record<string, string> = {
  viajes: 'Editar viaje',
  taller: 'Editar gasto de taller',
  alquileres: 'Editar alquiler',
  categorias: 'Editar categoría',
  rutas: 'Editar ruta',
}

function resolveTitle(page: string, edit: boolean) {
  if (edit) return EDIT_TITLES[page] ?? `Editar registro de ${page}`
  return TITLES[page] ?? `Nuevo registro de ${page}`
}

function resolveNote(page: string) {
  if (page === 'viajes') return 'El tipo de viaje no podrá modificarse después de guardar.'
  if (page === 'taller') return 'La categoría es obligatoria en todas las líneas del gasto.'
  return 'Los cambios quedarán registrados en el historial de la plataforma.'
}

interface ExpenseLine {
  id: number
  category: string
  kind: string
  description: string
  amount: string
}

function WorkshopForm() {
  const [bus, setBus] = useState('')
  const [date, setDate] = useState(TODAY)
  const [lines, setLines] = useState<ExpenseLine[]>([
    { id: 1, category: '', kind: 'Mano de obra', description: '', amount: '' },
  ])

  const categoryOptions = EXPENSE_CATEGORIES.map((category) => category.name)

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

  return (
    <>
      <div className="form-grid two">
        <Field label="Bus" required>
          <select value={bus} onChange={(event) => setBus(event.target.value)}>
            <option value="" disabled>
              Seleccione una opción
            </option>
            {BUSES.map((item) => (
              <option key={item.plate}>{`${item.plate} · ${item.branch}`}</option>
            ))}
          </select>
        </Field>
        <Field label="Fecha del servicio" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
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
                    <option key={option}>{option}</option>
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
    </>
  )
}

export interface AddRecordModalProps {
  page: string
  onClose: () => void
  initial?: Record<string, string | number>
}

export function AddRecordModal({ page, onClose, initial }: AddRecordModalProps) {
  const isEdit = Boolean(initial)
  const record = initial ?? {}
  const isTrips = page === 'viajes'
  const isWorkshop = page === 'taller'
  const isRoutes = page === 'rutas'
  const isCategories = page === 'categorias'
  const isRentals = page === 'alquileres'
  const routeOptions = ROUTES.map((route) => `${route.origin} → ${route.destination}`)
  const busOptions = BUSES.map((bus) => `${bus.plate} · ${bus.capacity} pasajeros`)
  const driverOptions = DRIVERS.map((driver) => `${driver.name} · Licencia ${driver.expiryState}`)

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
          {isTrips && (
            <div className="form-grid two">
              <SelectField
                label="Ruta"
                options={routeOptions}
                defaultValue={typeof record.route === 'string' ? record.route : undefined}
                required
              />
              <SelectField
                label="Tipo de viaje"
                options={['Regular', 'Alquiler privado']}
                defaultValue={typeof record.type === 'string' ? record.type : undefined}
                required
              />
              <SelectField
                label="Bus asignado"
                options={busOptions}
                defaultValue={typeof record.bus === 'string' ? record.bus : undefined}
                required
              />
              <SelectField
                label="Chofer asignado"
                options={driverOptions}
                defaultValue={typeof record.driver === 'string' ? record.driver : undefined}
                required
              />
              <Field
                label="Fecha y hora de salida"
                type="datetime-local"
                defaultValue={typeof record.depart === 'string' ? record.depart : `${TODAY}T08:00`}
                required
              />
              <Field
                label="Llegada estimada"
                type="datetime-local"
                defaultValue={typeof record.arrive === 'string' ? record.arrive : `${TODAY}T10:30`}
                required
              />
            </div>
          )}
          {isWorkshop && <WorkshopForm />}
          {isRoutes && (
            <div className="form-grid two">
              <SelectField
                label="Sucursal de origen"
                options={BRANCH_NAMES}
                defaultValue={typeof record.origin === 'string' ? record.origin : undefined}
                required
              />
              <SelectField
                label="Sucursal de destino"
                options={BRANCH_NAMES.filter((name) => name !== record.origin)}
                defaultValue={typeof record.destination === 'string' ? record.destination : undefined}
                required
              />
              <Field
                label="Distancia aproximada (km)"
                type="number"
                placeholder="42"
                defaultValue={
                  typeof record.distance === 'string' ? record.distance.replace(/[^\d]/g, '') : undefined
                }
                required
              />
              <Field
                label="Precio del boleto (Q)"
                type="number"
                placeholder="125.00"
                defaultValue={
                  typeof record.price === 'string' ? record.price.replace(/[^\d.]/g, '') : undefined
                }
                required
              />
            </div>
          )}
          {isCategories && (
            <div className="form-grid">
              <Field
                label="Nombre de la categoría"
                placeholder="Ej. Eléctrico"
                defaultValue={typeof record.name === 'string' ? record.name : undefined}
                required
              />
              <SelectField
                label="Estado"
                options={['Activa', 'Inactiva']}
                defaultValue={typeof record.state === 'string' ? record.state : undefined}
                required
              />
            </div>
          )}
          {isRentals && (
            <div className="form-grid two">
              <Field
                label="Cliente"
                placeholder="Nombre o empresa"
                defaultValue={typeof record.client === 'string' ? record.client : undefined}
                required
              />
              <Field
                label="Sucursal de origen"
                placeholder="Ej. Guatemala Centro"
                defaultValue={typeof record.origin === 'string' ? record.origin : undefined}
                required
              />
              <Field
                label="Destino"
                placeholder="Ej. Monterrico"
                defaultValue={typeof record.destination === 'string' ? record.destination : undefined}
                required
              />
              <Field label="Fecha de salida" type="date" defaultValue={TODAY} required />
              <Field
                label="Número de pasajeros"
                type="number"
                placeholder="32"
                defaultValue={typeof record.passengers === 'number' ? record.passengers : undefined}
                required
              />
              <Field
                label="Precio estimado (Q)"
                type="number"
                placeholder="3850.00"
                defaultValue={
                  typeof record.price === 'string' ? record.price.replace(/[^\d.]/g, '') : undefined
                }
                required
              />
            </div>
          )}
          {!isTrips &&
            !isWorkshop &&
            !isRoutes &&
            !isCategories &&
            !isRentals && (
              <div className="form-grid">
                <Field label="Nombre o referencia" placeholder="Ingrese la información" required />
                <Field label="Fecha de registro" type="date" defaultValue={TODAY} required />
                <SelectField label="Estado" options={['Activo', 'Inactivo']} required />
              </div>
            )}
          <InfoNote>{resolveNote(page)}</InfoNote>
        </div>
        <footer>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onClose}>
            {isEdit ? 'Guardar cambios' : isTrips ? 'Programar viaje' : 'Guardar registro'}
          </Button>
        </footer>
      </section>
    </div>
  )
}
