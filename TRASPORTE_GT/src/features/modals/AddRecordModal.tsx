import { useState } from 'react'
import {
  BUSES,
  EXPENSE_CATEGORIES,
  TODAY,
} from '../../data/mock'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { InfoNote } from '../../components/ui/Misc'
import { SelectField } from '../../components/ui/SelectField'
import { formatQ } from '../../utils/format'

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

function resolveNote(page: string) {
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
  const isWorkshop = page === 'taller'
  const isCategories = page === 'categorias'

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
          {isWorkshop && <WorkshopForm />}
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
          {!isWorkshop &&
            !isCategories && (
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
            {isEdit ? 'Guardar cambios' : 'Guardar registro'}
          </Button>
        </footer>
      </section>
    </div>
  )
}
