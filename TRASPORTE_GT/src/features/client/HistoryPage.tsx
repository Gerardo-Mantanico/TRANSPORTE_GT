import { useState } from 'react'
import { PRIVATE_HISTORY, TICKET_HISTORY } from '../../data/mock'
import { Badge } from '../../components/ui/Badge'
import { DataTable } from '../../components/ui/DataTable'
import { FilterToolbar } from '../../components/ui/FilterToolbar'
import { Icon } from '../../components/ui/Icon'

export function HistoryPage() {
  const [tab, setTab] = useState(0)

  return (
    <>
      <div className="tabs">
        <button className={tab === 0 ? 'active' : ''} onClick={() => setTab(0)}>
          Boletos comprados
        </button>
        <button className={tab === 1 ? 'active' : ''} onClick={() => setTab(1)}>
          Viajes privados
        </button>
      </div>
      <section className="surface list-surface">
        <FilterToolbar searchPlaceholder="Buscar en mi historial...">
          <select defaultValue="Todo el historial">
            <option>Todo el historial</option>
          </select>
        </FilterToolbar>
        {tab === 0 ? (
          <DataTable
            headers={['Fecha', 'Viaje', 'Asientos', 'Origen', 'Monto', 'Estado']}
            rows={TICKET_HISTORY.map((ticket) => [
              ticket.date,
              <>
                <strong>{ticket.trip}</strong>
                <small className="cell-note">{ticket.tripNote}</small>
              </>,
              <span className="chip">{ticket.seats}</span>,
              ticket.channel,
              ticket.amount,
              <Badge tone="success">{ticket.state}</Badge>,
            ])}
          />
        ) : (
          <DataTable
            headers={['Solicitud', 'Trayecto', 'Fechas', 'Pasajeros', 'Monto', 'Estado']}
            rows={PRIVATE_HISTORY.map((rental) => [
              rental.request,
              <strong>{rental.route}</strong>,
              rental.dates,
              rental.passengers,
              rental.amount,
              <Badge tone="warning">{rental.state}</Badge>,
            ])}
          />
        )}
        <div className="persistent-note">
          <Icon name="check" />
          <span>
            Las ventas presenciales realizadas con su NIT aparecen aquí, incluso si se hicieron
            antes de crear su cuenta.
          </span>
        </div>
      </section>
    </>
  )
}
