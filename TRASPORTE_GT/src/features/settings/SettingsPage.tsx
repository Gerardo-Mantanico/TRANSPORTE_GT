import { useEffect, useState, type FormEvent } from 'react'
import { errorMessage } from '../../api/client'
import { crearTarifaDepreciacion, obtenerTarifaDepreciacion } from '../../api/costs'
import { TODAY } from '../../types'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { InfoNote, SectionTitle } from '../../components/ui/Misc'
import { useToast } from '../../components/ui/useToast'
import { required, toNumberInRange } from '../../utils/validators'

const PERMANENT_RULES = [
  'Los usuarios no se eliminan; solo se desactivan.',
  'Debe existir al menos un administrador de sistema activo.',
  'Cada sucursal mantiene un administrador enlazado.',
  'Los registros de salida y llegada son inmutables.',
]

export function SettingsPage() {
  const [rate, setRate] = useState('')
  const [vigencia, setVigencia] = useState(TODAY)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const tarifa = await obtenerTarifaDepreciacion()
        if (!cancelled && tarifa) {
          setRate(String(tarifa.montoPorKm))
          setVigencia(tarifa.vigenteDesde)
        }
      } catch {
        // sin tarifa vigente todavía
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const save = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const rateValue = toNumberInRange(rate, 0, 100000, 'el costo de depreciación')
    if (!rateValue.ok) {
      setError(rateValue.error)
      toast.error(rateValue.error)
      return
    }
    const dateError = required(vigencia, 'La fecha de vigencia')
    if (dateError) {
      setError(dateError)
      toast.error(dateError)
      return
    }

    setSaving(true)
    try {
      await crearTarifaDepreciacion({ montoPorKm: rateValue.value, vigenteDesde: vigencia })
      setSaved(true)
      toast.success('Configuración de depreciación guardada.')
    } catch (caught) {
      const message = errorMessage(caught)
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="settings-grid">
        <section className="surface form-card">
          <SectionTitle
            title="Depreciación por kilometraje"
            subtitle="Monto aplicado a nuevos cierres de viaje"
          />
          {loading ? (
            <p className="muted">Cargando tarifa vigente…</p>
          ) : (
            <form onSubmit={save}>
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
              <Field
                label="Fecha de vigencia"
                type="date"
                value={vigencia}
                onChange={(event) => setVigencia(event.target.value)}
                required
              />
              <InfoNote>
                El cambio no altera registros ya hechos. Cada viaje conserva el monto vigente al
                momento de registrarse.
              </InfoNote>
              {error && <p className="danger-copy">{error}</p>}
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar configuración'}
              </Button>
            </form>
          )}
          {saved && (
            <div className="success-note">
              <Icon name="check" />
              <span>
                Configuración guardada. La nueva depreciación es Q {rate || '0.00'} por kilómetro
                desde {vigencia}.
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
