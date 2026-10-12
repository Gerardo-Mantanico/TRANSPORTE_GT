import { Icon } from '../ui/Icon'

interface SeatMapProps {
  selected: string[]
  onToggle: (seat: string, selected: boolean) => void
  count?: number
  occupied?: number[]
}

export function SeatMap({ selected, onToggle, count = 32, occupied = [0, 3, 9, 13, 20, 25] }: SeatMapProps) {
  const seats = Array.from(
    { length: count },
    (_, index) => `${String.fromCharCode(65 + Math.floor(index / 4))}${(index % 4) + 1}`,
  )

  return (
    <div className="seat-map-wrap">
      <div className="seat-legend">
        <span>
          <i /> Disponible
        </span>
        <span>
          <i className="selected" /> Seleccionado
        </span>
        <span>
          <i className="occupied" /> Ocupado
        </span>
      </div>
      <div className="bus-orientation">
        <Icon name="arrow" size={14} />
        <span>Frente del bus</span>
      </div>
      <div className="bus-plan">
        <div className="bus-windshield">
          <i />
          <span>Parabrisas</span>
          <i />
        </div>
        <div className="bus-cockpit">
          <div className="driver-seat">
            <span className="steering-wheel" />
            <div>
              <strong>Conductor</strong>
              <small>Cabina</small>
            </div>
          </div>
          <div className="bus-door">
            <span />
            <small>Puerta</small>
          </div>
        </div>
        <div className="aisle-label">
          <span>Pasillo</span>
        </div>
        <div className="seat-grid">
          {seats.map((seat, index) => {
            const isOccupied = occupied.includes(index)
            const isSelected = selected.includes(seat)
            const status = isSelected ? 'seleccionado' : isOccupied ? 'ocupado' : 'disponible'
            return (
              <button
                key={seat}
                disabled={isOccupied}
                className={isSelected ? 'selected' : isOccupied ? 'occupied' : ''}
                aria-label={`Asiento ${seat}, ${status}`}
                aria-pressed={isSelected}
                title={`Asiento ${seat} · ${status}`}
                onClick={() => onToggle(seat, isSelected)}
              >
                <span>{isSelected ? <Icon name="check" size={14} /> : seat}</span>
              </button>
            )
          })}
        </div>
        <div className="bus-rear">
          <span>Parte trasera</span>
          <i />
          <i />
          <i />
        </div>
        <span className="bus-wheel left-front" />
        <span className="bus-wheel right-front" />
        <span className="bus-wheel left-rear" />
        <span className="bus-wheel right-rear" />
      </div>
      <div className="seat-map-tip">
        <Icon name="check" size={14} />
        <span>Seleccione uno o varios asientos disponibles. Su selección se marcará en azul.</span>
      </div>
    </div>
  )
}
