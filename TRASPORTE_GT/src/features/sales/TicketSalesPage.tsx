import { useState } from 'react'
import { BUSES, TODAY, TODAY_TRIPS } from '../../data/mock'
import { SeatMap } from '../../components/domain/SeatMap'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { SectionTitle } from '../../components/ui/Misc'
import { SelectField } from '../../components/ui/SelectField'
import { formatQ } from '../../utils/format'

const STEPS = ['Viaje', 'Asientos', 'Cliente y pago', 'Confirmación'] as const
const TICKET_PRICE = 125

function toggleSeat(seats: string[], seat: string) {
  return seats.includes(seat) ? seats.filter((item) => item !== seat) : [...seats, seat]
}

function capacityFor(busPlate: string): number {
  return BUSES.find((bus) => bus.plate === busPlate)?.capacity ?? 32
}

function occupiedFor(busPlate: string): number[] {
  const capacity = capacityFor(busPlate)
  return [0, 3, 9, 13].filter((index) => index < capacity)
}

export function TicketSalesPage() {
  const [step, setStep] = useState(1)
  const [selectedSeats, setSelectedSeats] = useState(['A2', 'A3'])
  const [tripIndex, setTripIndex] = useState(0)
  const trips = TODAY_TRIPS.filter((trip) => trip.type === 'Regular').slice(0, 3)
  const selectedTrip = trips[tripIndex] ?? trips[0]
  const capacity = selectedTrip ? capacityFor(selectedTrip.bus) : 32
  const freeSeats = capacity - occupiedFor(selectedTrip?.bus ?? '').length
  const ticketCode = 'BP-10482'

  return (
    <>
      <div className="stepper">
        {STEPS.map((label, index) => (
          <button
            key={label}
            className={step >= index + 1 ? 'active' : ''}
            onClick={() => index + 1 <= step && setStep(index + 1)}
          >
            <span>{step > index + 1 ? <Icon name="check" size={15} /> : index + 1}</span>
            <strong>{label}</strong>
            {index < STEPS.length - 1 && <i />}
          </button>
        ))}
      </div>
      <div className="sale-layout">
        <div className="surface sale-main">
          {step === 1 && (
            <>
              <SectionTitle title="Seleccione un viaje" subtitle="Salidas regulares con disponibilidad" />
              <div className="form-grid two">
                <Field label="Fecha del viaje" type="date" defaultValue={TODAY} />
                <SelectField
                  label="Ruta"
                  options={['Todas las rutas', 'Guatemala → Antigua', 'Guatemala → Escuintla']}
                />
              </div>
              <div className="trip-options">
                {trips.map((trip, index) => (
                  <button
                    key={trip.route}
                    className={index === tripIndex ? 'selected' : ''}
                    onClick={() => setTripIndex(index)}
                  >
                    <span className="radio-dot" />
                    <div>
                      <strong>{trip.route}</strong>
                      <small>
                        {TODAY} · {trip.time} · {trip.bus}
                      </small>
                    </div>
                    <span>
                      <strong>{capacityFor(trip.bus) - 33 > 0 ? capacityFor(trip.bus) - 33 : 12} libres</strong>
                      <small>Q {TICKET_PRICE}.00</small>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <SectionTitle
                title="Seleccione los asientos"
                subtitle={`Capacidad del bus ${selectedTrip?.bus ?? ''}: ${capacity} asientos · ocupados actualizados en tiempo real`}
              />
              <SeatMap
                selected={selectedSeats}
                onToggle={(seat) => setSelectedSeats((seats) => toggleSeat(seats, seat))}
                count={capacity}
                occupied={occupiedFor(selectedTrip?.bus ?? '')}
              />
            </>
          )}
          {step === 3 && (
            <>
              <SectionTitle
                title="Cliente y confirmación"
                subtitle="Enlace la venta por NIT o utilice el cliente genérico"
              />
              <div className="form-grid two">
                <Field label="NIT del cliente" placeholder="CF / 1234567-8" />
                <Field label="Fecha de venta" type="date" defaultValue={TODAY} />
                <SelectField
                  label="Método de pago"
                  options={['Efectivo', 'Tarjeta', 'Cartera digital']}
                  required
                />
              </div>
              <label className="check-row">
                <input type="checkbox" defaultChecked />
                <span>
                  <strong>Cliente genérico del mostrador</strong>
                  <small>Use esta opción si el cliente no proporciona NIT.</small>
                </span>
              </label>
              <div className="success-note">
                <Icon name="check" />
                <span>Los asientos se bloquearán al confirmar la venta.</span>
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <SectionTitle
                title="Venta registrada"
                subtitle="Boleto emitido y asientos bloqueados"
              />
              <div className="success-note">
                <Icon name="check" />
                <span>
                  Venta registrada en mostrador. Si el cliente proporcionó NIT, el boleto quedará en
                  su historial aunque cree una cuenta en el futuro.
                </span>
              </div>
              <div className="detail-grid">
                <div>
                  <span>Boleto</span>
                  <strong>{ticketCode}</strong>
                </div>
                <div>
                  <span>Viaje</span>
                  <strong>{selectedTrip?.route}</strong>
                </div>
                <div>
                  <span>Salida</span>
                  <strong>
                    {TODAY} · {selectedTrip?.time}
                  </strong>
                </div>
                <div>
                  <span>Asientos</span>
                  <strong>{selectedSeats.join(', ') || '—'}</strong>
                </div>
              </div>
            </>
          )}
          <div className="sale-actions">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>
              Anterior
            </Button>
            {step < 4 && (
              <Button onClick={() => setStep(Math.min(4, step + 1))}>
                {step === 3 ? 'Registrar venta' : 'Continuar'}
              </Button>
            )}
            {step === 4 && (
              <Button onClick={() => setStep(1)}>Nueva venta</Button>
            )}
          </div>
        </div>
        <aside className="surface order-summary">
          <span className="eyebrow">Resumen</span>
          <h3>{selectedTrip?.route ?? '—'}</h3>
          <p>
            {TODAY} · {selectedTrip?.time ?? '—'}
          </p>
          <dl>
            <div>
              <dt>Asientos</dt>
              <dd>{selectedSeats.join(', ') || '—'}</dd>
            </div>
            <div>
              <dt>Cantidad</dt>
              <dd>{selectedSeats.length}</dd>
            </div>
            <div>
              <dt>Disponibles</dt>
              <dd>{Math.max(freeSeats, 0)}</dd>
            </div>
            <div>
              <dt>Precio unitario</dt>
              <dd>{formatQ(TICKET_PRICE)}</dd>
            </div>
          </dl>
          <div className="summary-total">
            <span>Total</span>
            <strong>{formatQ(selectedSeats.length * TICKET_PRICE)}</strong>
          </div>
        </aside>
      </div>
    </>
  )
}
