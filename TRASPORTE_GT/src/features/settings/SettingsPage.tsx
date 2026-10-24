import { Icon } from '../../components/ui/Icon'
import { TarifaDepreciacionCard } from '../costs/TarifaDepreciacionCard'
import { TarifasCard } from '../rentals/TarifasCard'

const PERMANENT_RULES = [
  'Los usuarios no se eliminan; solo se desactivan.',
  'Debe existir al menos un administrador de sistema activo.',
  'Cada sucursal mantiene un administrador enlazado.',
  'Los registros de salida y llegada son inmutables.',
]

export function SettingsPage() {
  return (
    <>
      <div className="settings-grid">
        <TarifaDepreciacionCard />
        <TarifasCard />
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
