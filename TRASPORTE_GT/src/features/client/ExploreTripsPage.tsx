import { useMemo, useState } from 'react'
import { CLIENT_TRIPS, TODAY, resolveRoutePoint, type ClientTrip } from '../../data/mock'
import { RouteMap } from '../../components/domain/RouteMap'
import { SeatMap } from '../../components/domain/SeatMap'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { InfoNote } from '../../components/ui/Misc'
import { useCartera, usePerfilCliente } from '../../hooks/customerWallet'
import { puedeOperarEnLinea } from '../../utils/perfilCliente'
import { AvisoPerfilCliente } from '../customerWallet/AvisoPerfilCliente'
import { formatMonto, formatQ } from '../../utils/format'

function toggleSeat(seats: string[], seat: string) {
  return seats.includes(seat) ? seats.filter((item) => item !== seat) : [...seats, seat]
}

function occupiedSeatsFor(trip: ClientTrip): number[] {
  const free = Number(trip.seats)
  const occupiedCount = Math.max(trip.capacity - free, 0)
  const occupied: number[] = []
  for (let index = 0; index < occupiedCount; index += 1) {
    occupied.push((index * 3) % trip.capacity)
  }
  return [...new Set(occupied)]
}

function PurchaseConfirmationModal({
  trip,
  seats,
  total,
  onClose,
}: {
  trip: ClientTrip
  seats: string[]
  total: number
  onClose: () => void
}) {
  const code = `VT-${trip.bus.replace(/\D/g, '')}-${String(seats.length * 17 + trip.capacity)}`
  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section className="modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span className="eyebrow">Compra confirmada</span>
            <h2>Boletos emitidos</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">
          <div className="success-note">
            <Icon name="check" />
            <span>
              Su compra fue registrada y los asientos <strong>{seats.join(', ')}</strong> quedaron
              bloqueados. Enviamos la confirmación a su correo electrónico.
            </span>
          </div>
          <div className="detail-grid">
            <div>
              <span>Comprobante</span>
              <strong>{code}</strong>
            </div>
            <div>
              <span>Viaje</span>
              <strong>
                {trip.origin} → {trip.destination}
              </strong>
            </div>
            <div>
              <span>Fecha y salida</span>
              <strong>
                {TODAY} · {trip.departTime}
              </strong>
            </div>
            <div>
              <span>Bus</span>
              <strong>{trip.bus}</strong>
            </div>
            <div>
              <span>Asientos</span>
              <strong>{seats.join(', ')}</strong>
            </div>
            <div>
              <span>Total pagado</span>
              <strong>{formatQ(total)}</strong>
            </div>
          </div>
          <InfoNote>
            El comprobante quedó guardado en <strong>Mi historial</strong> junto con sus boletos.
          </InfoNote>
        </div>
        <footer>
          <Button onClick={onClose}>Entendido</Button>
        </footer>
      </section>
    </div>
  )
}

function RouteModal({ trip, onClose, onSelect }: { trip: ClientTrip; onClose: () => void; onSelect: () => void }) {
  const point = resolveRoutePoint(trip.destination)

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section className="modal route-map-modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span className="eyebrow">Vista de la ruta</span>
            <h2>
              {trip.origin} → {trip.destination}
            </h2>
            <p>
              {TODAY} · Salida {trip.departTime} · Bus {trip.bus}
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">
          <RouteMap origin={trip.origin} destination={trip.destination} compact />
          <div className="route-modal-summary">
            <div>
              <span>
                <Icon name="route" size={16} />
              </span>
              <p>
                Distancia estimada<strong>{point.distance}</strong>
              </p>
            </div>
            <div>
              <span>
                <Icon name="clock" size={16} />
              </span>
              <p>
                Duración estimada<strong>{point.duration}</strong>
              </p>
            </div>
            <div>
              <span>
                <Icon name="ticket" size={16} />
              </span>
              <p>
                Precio por persona
                <strong>{trip.price}.00</strong>
              </p>
            </div>
            <div>
              <span>
                <Icon name="bus" size={16} />
              </span>
              <p>
                Disponibilidad
                <strong>{trip.seats} asientos</strong>
              </p>
            </div>
          </div>
          <div className="route-modal-note">
            <Icon name="check" size={14} />
            <span>
              El recorrido es referencial y puede variar según el tránsito y las condiciones de la
              carretera.
            </span>
          </div>
        </div>
        <footer>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          <Button icon="ticket" onClick={onSelect}>
            Seleccionar asientos
          </Button>
        </footer>
      </section>
    </div>
  )
}

function SeatSelectionModal({ trip, onClose }: { trip: ClientTrip; onClose: () => void }) {
  const [seats, setSeats] = useState<string[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const cartera = useCartera()
  const perfil = usePerfilCliente()
  const puedePagar = puedeOperarEnLinea(perfil.datos)
  const unitPrice = Number(trip.price.replace(/\D/g, ''))
  const total = seats.length * unitPrice
  const freeSeats = Number(trip.seats)

  if (confirmed) {
    return (
      <PurchaseConfirmationModal trip={trip} seats={seats} total={total} onClose={onClose} />
    )
  }

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section className="modal seat-modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span className="eyebrow">Selección de asientos</span>
            <h2>
              {trip.origin} → {trip.destination}
            </h2>
            <p>
              {TODAY} · Salida {trip.departTime} · Bus {trip.bus} · {trip.capacity} asientos
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body seat-modal-body">
          <SeatMap
            selected={seats}
            onToggle={(seat) => {
              if (!seats.includes(seat) && seats.length >= freeSeats) return
              setSeats((current) => toggleSeat(current, seat))
            }}
            count={trip.capacity}
            occupied={occupiedSeatsFor(trip)}
          />
          <aside className="booking-summary">
            <div className="booking-summary-head">
              <span className="summary-icon">
                <Icon name="ticket" />
              </span>
              <div>
                <span className="eyebrow">Resumen de compra</span>
                <h3>Sus asientos</h3>
              </div>
            </div>
            <div className="wallet-balance">
              <span>
                <Icon name="wallet" size={16} /> Saldo disponible
              </span>
              <strong>
                {cartera.datos ? formatMonto(cartera.datos.saldo) : cartera.cargando ? '...' : 'No disponible'}
              </strong>
            </div>
            <AvisoPerfilCliente cliente={perfil.datos} accion="comprar boletos" />
            <div className="summary-label">Asientos seleccionados</div>
            <div className={`selected-chips ${seats.length ? '' : 'empty'}`.trim()}>
              {seats.length ? (
                seats.map((seat) => (
                  <span key={seat}>
                    {seat}
                    <Icon name="check" size={11} />
                  </span>
                ))
              ) : (
                <small>Seleccione un asiento en el plano</small>
              )}
            </div>
            <dl>
              <div>
                <dt>Cantidad</dt>
                <dd>{seats.length} asiento(s)</dd>
              </div>
              <div>
                <dt>Precio unitario</dt>
                <dd>{trip.price}.00</dd>
              </div>
            </dl>
            <div className="booking-total">
              <span>Total a pagar</span>
              <strong>{formatQ(total)}</strong>
            </div>
            <div className="booking-security">
              <Icon name="check" size={15} />
              <span>
                Al confirmar, los asientos se bloquearán de inmediato y recibirá la confirmación por
                correo electrónico.
              </span>
            </div>
          </aside>
        </div>
        <footer>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button icon="wallet" disabled={!seats.length || !puedePagar} onClick={() => setConfirmed(true)}>
            Confirmar y pagar · {formatQ(total)}
          </Button>
        </footer>
      </section>
    </div>
  )
}

export function ExploreTripsPage() {
  const [seatTrip, setSeatTrip] = useState<ClientTrip | null>(null)
  const [mapTrip, setMapTrip] = useState<ClientTrip | null>(null)
  const [origin, setOrigin] = useState('Guatemala')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState(TODAY)
  const [appliedQuery, setAppliedQuery] = useState({ origin: '', destination: '' })
  const [mapHidden, setMapHidden] = useState(false)

  const showPreview = origin.trim().length > 2 && destination.trim().length > 2 && !mapHidden

  const filteredTrips = useMemo(() => {
    return CLIENT_TRIPS.filter((trip) => {
      const matchOrigin =
        !appliedQuery.origin || trip.origin.toLocaleLowerCase('es').includes(appliedQuery.origin.toLocaleLowerCase('es'))
      const matchDestination =
        !appliedQuery.destination ||
        trip.destination.toLocaleLowerCase('es').includes(appliedQuery.destination.toLocaleLowerCase('es'))
      return matchOrigin && matchDestination
    })
  }, [appliedQuery])

  const handleDestinationChange = (value: string) => {
    setDestination(value)
    setMapHidden(false)
  }

  const handleSwap = () => {
    setOrigin(destination)
    handleDestinationChange(origin)
  }

  const handleSearch = () => {
    setAppliedQuery({ origin: origin.trim(), destination: destination.trim() })
  }

  return (
    <>
      {showPreview && (
        <RouteMap origin={origin} destination={destination} onHide={() => setMapHidden(true)} />
      )}
      <div className="journey-search">
        <Field label="Origen">
          <input
            list="origin-options"
            value={origin}
            onChange={(event) => {
              setOrigin(event.target.value)
              setMapHidden(false)
            }}
            placeholder="Seleccione el origen"
          />
          <datalist id="origin-options">
            <option value="Guatemala" />
            <option value="Antigua" />
            <option value="Quetzaltenango" />
          </datalist>
        </Field>
        <button className="swap-route" onClick={handleSwap} aria-label="Intercambiar origen y destino">
          <Icon name="arrow" />
        </button>
        <Field label="Destino">
          <input
            list="destination-options"
            value={destination}
            onChange={(event) => handleDestinationChange(event.target.value)}
            placeholder="¿A dónde viaja?"
          />
          <datalist id="destination-options">
            <option value="Antigua" />
            <option value="Quetzaltenango" />
            <option value="Escuintla" />
            <option value="Panajachel" />
          </datalist>
        </Field>
        <Field label="Fecha" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <Button icon="search" onClick={handleSearch}>
          Buscar viajes
        </Button>
      </div>
      <div className="results-head">
        <div>
          <h2>Viajes disponibles</h2>
          <p>
            {filteredTrips.length} resultado{filteredTrips.length === 1 ? '' : 's'} para {date === TODAY ? 'hoy' : date}
          </p>
        </div>
        <select defaultValue="Salida más próxima">
          <option>Salida más próxima</option>
        </select>
      </div>
      <section className="trip-grid">
        {filteredTrips.map((trip) => (
          <article key={trip.destination} className="trip-card">
            <div className="trip-card-top">
              <span className="bus-icon">
                <Icon name="bus" />
              </span>
              <button className="route-card-action" onClick={() => setMapTrip(trip)}>
                <Icon name="route" size={14} />
                <span>Ver ruta</span>
              </button>
              <Badge tone={Number(trip.seats) < 8 ? 'warning' : 'success'}>{trip.seats} asientos libres</Badge>
            </div>
            <div className="route-visual">
              <div>
                <strong>{trip.departTime}</strong>
                <span>{trip.origin}</span>
              </div>
              <div>
                <i />
                <span>
                  <Icon name="bus" size={15} />
                </span>
                <i />
              </div>
              <div>
                <strong>{trip.arriveTime}</strong>
                <span>{trip.destination}</span>
              </div>
            </div>
            <div className="trip-meta">
              <span>
                <Icon name="calendar" size={16} /> {date}
              </span>
              <span>
                <Icon name="bus" size={16} /> {trip.bus} · {trip.capacity} asientos
              </span>
            </div>
            <div className="trip-price">
              <div>
                <small>Por persona</small>
                <strong>
                  {trip.price}
                  <em>.00</em>
                </strong>
              </div>
              <Button onClick={() => setSeatTrip(trip)}>Seleccionar asientos</Button>
            </div>
          </article>
        ))}
      </section>
      {seatTrip && <SeatSelectionModal trip={seatTrip} onClose={() => setSeatTrip(null)} />}
      {mapTrip && (
        <RouteModal
          trip={mapTrip}
          onClose={() => setMapTrip(null)}
          onSelect={() => {
            setSeatTrip(mapTrip)
            setMapTrip(null)
          }}
        />
      )}
    </>
  )
}
