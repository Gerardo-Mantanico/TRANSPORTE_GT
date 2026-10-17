import { useState } from 'react'
import { TODAY } from '../../data/mock'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { InfoNote } from '../../components/ui/Misc'
import { useCartera, usePerfilCliente } from '../../hooks/customerWallet'
import { puedeOperarEnLinea } from '../../utils/perfilCliente'
import { AvisoPerfilCliente } from '../customerWallet/AvisoPerfilCliente'
import { formatQ } from '../../utils/format'

export function RentalRequestPage() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [passengers, setPassengers] = useState('12')
  const [tripType, setTripType] = useState('Solo ida')
  const [estimate, setEstimate] = useState<number | null>(null)
  const [paid, setPaid] = useState(false)
  const cartera = useCartera()
  const perfil = usePerfilCliente()
  const saldo = cartera.datos ? Number(cartera.datos.saldo) : null

  const passengerCount = Math.max(Number(passengers) || 0, 0)
  const canPay = estimate !== null && saldo !== null && estimate <= saldo && puedeOperarEnLinea(perfil.datos)
  const remaining = saldo !== null && estimate !== null ? saldo - estimate : (saldo ?? 0)

  const calculate = () => {
    const base = 1800
    const perPassenger = 95
    const roundTrip = tripType === 'Ida y vuelta' ? 1.6 : 1
    setEstimate(Math.round(base * roundTrip + passengerCount * perPassenger))
    setPaid(false)
  }

  return (
    <>
      <div className="form-page">
        <section className="surface form-card">
          <h2>Detalles del viaje</h2>
          <div className="form-grid two">
            <Field
              label="Origen"
              placeholder="Ciudad o dirección"
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              required
            />
            <Field
              label="Destino"
              placeholder="Ciudad o dirección"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              required
            />
            <Field label="Fecha de salida" type="date" defaultValue={TODAY} required />
            <Field label="Fecha de retorno" type="date" defaultValue={TODAY} />
            <Field
              label="Número de pasajeros"
              type="number"
              value={passengers}
              onChange={(event) => setPassengers(event.target.value)}
              required
            />
            <Field label="Tipo de viaje" required>
              <select value={tripType} onChange={(event) => setTripType(event.target.value)}>
                <option>Solo ida</option>
                <option>Ida y vuelta</option>
              </select>
            </Field>
          </div>
          <InfoNote>
            El administrador confirmará o podrá modificar el precio estimado antes del pago. Una vez
            confirmado, pague con su cartera digital para que el alquiler quede efectuado.
          </InfoNote>
          <Button icon="chart" onClick={calculate}>
            Calcular estimación
          </Button>
        </section>
        <aside className="estimate-card">
          <span className="eyebrow light">Estimación</span>
          <h3>Precio estimado</h3>
          <strong>{estimate !== null ? formatQ(estimate) : '—'}</strong>
          <Badge tone={paid ? 'success' : 'warning'}>
            {paid ? 'Pagado con cartera' : 'Pendiente de confirmación'}
          </Badge>
          <p>Este monto considera la distancia, capacidad y disponibilidad estimada.</p>
          {estimate !== null && !paid && (
            <div className="estimate-pay">
              <div className="payment-balance">
                <div>
                  <span>Saldo actual</span>
                  <strong>{saldo !== null ? formatQ(saldo) : cartera.cargando ? '...' : '—'}</strong>
                </div>
                <Icon name="arrow" />
                <div>
                  <span>Saldo restante</span>
                  <strong>{formatQ(Math.max(remaining, 0))}</strong>
                </div>
              </div>
              <Field label="Fecha de pago" type="date" defaultValue={TODAY} required />
              {saldo === null && !cartera.cargando && (
                <p className="estimate-warn">No pudimos consultar su saldo. Intente de nuevo más tarde.</p>
              )}
              <AvisoPerfilCliente cliente={perfil.datos} accion="alquilar buses" />
              {saldo !== null && estimate !== null && estimate > saldo && (
                <p className="estimate-warn">
                  Su saldo no cubre el monto estimado. Recargue su cartera antes de pagar.
                </p>
              )}
              <Button icon="wallet" disabled={!canPay} onClick={() => setPaid(true)}>
                Pagar con cartera · {formatQ(estimate)}
              </Button>
            </div>
          )}
          {paid && (
            <div className="success-note">
              <Icon name="check" />
              <span>
                Alquiler efectuado. El administrador de la sucursal asignará bus y chofer, y
                recibirá la confirmación en su correo.
              </span>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
