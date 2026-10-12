import { useState } from 'react'
import { TODAY } from '../../data/mock'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { InfoNote, SectionTitle } from '../../components/ui/Misc'

const PERMANENT_RULES = [
  'Los usuarios no se eliminan; solo se desactivan.',
  'Debe existir al menos un administrador de sistema activo.',
  'Cada sucursal mantiene un administrador enlazado.',
  'Los registros de salida y llegada son inmutables.',
]

export function SettingsPage() {
  const [rate, setRate] = useState('0.75')
  const [saved, setSaved] = useState(false)

  return (
    <>
      <div className="settings-grid">
        <section className="surface form-card">
          <SectionTitle
            title="Depreciación por kilometraje"
            subtitle="Monto aplicado a nuevos cierres de viaje"
          />
          <Field
            label="Costo de depreciación por kilómetro"
            type="number"
            value={rate}
            onChange={(event) => {
              setRate(event.target.value)
              setSaved(false)
            }}
            required
          />
          <Field label="Fecha de vigencia" type="date" defaultValue={TODAY} required />
          <InfoNote>
            El cambio no altera registros ya hechos. Cada viaje conserva el monto vigente al momento
            de registrarse.
          </InfoNote>
          <Button onClick={() => setSaved(true)}>Guardar configuración</Button>
          {saved && (
            <div className="success-note">
              <Icon name="check" />
              <span>
                Configuración guardada. La nueva depreciación es Q {rate || '0.00'} por kilómetro
                desde {TODAY}.
              </span>
            </div>
          )}
        </section>
        <section className="surface rules-card">
          <h2>Reglas permanentes</h2>
          {PERMANENT_RULES.map((rule) => (
            <div key={rule}>
              <Icon name="check" />
              <span>{rule}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}
