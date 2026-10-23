import { useEffect, useState } from 'react'
import { errorMessage } from '../../api/client'
import { listarMisAlquileres } from '../../api/rentals'
import type { AlquilerResponse } from '../../api/types'
import { TICKET_HISTORY } from '../../data/mock'
import { estadoAlquilerLabel, estadoAlquilerTone, fechaCorta, fechaHoraCorta } from '../lists/mappers'
import { Badge } from '../../components/ui/Badge'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { FilterToolbar } from '../../components/ui/FilterToolbar'
import { Icon } from '../../components/ui/Icon'
import { useToast } from '../../components/ui/useToast'
import { formatQ } from '../../utils/format'

export function HistoryPage() {
  const [tab, setTab] = useState(0)
  const [alquileres, setAlquileres] = useState<AlquilerResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const pagina = await listarMisAlquileres({ tamano: 50 })
        if (!cancelled) setAlquileres(pagina.contenido)
      } catch (caught) {
        if (cancelled) return
        const message = errorMessage(caught)
        setError(message)
        toast.error(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [toast])

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
        <FilterToolbar />
        {error && <p className="danger-copy">{error}</p>}
        {tab === 0 ? (
          <>
            <div className="info-note" style={{ margin: '0 0 1rem' }}>
              La venta de boletos aún no tiene API en el backend (TicketService pendiente); se
              muestra el historial de demostración.
            </div>
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
          </>
        ) : loading ? (
          <div className="filter-empty">
            <strong>Cargando historial…</strong>
          </div>
        ) : (
          <DataTable
            headers={['Solicitud', 'Trayecto', 'Fechas', 'Pasajeros', 'Monto', 'Estado']}
            rows={alquileres.map((rental) => [
              fechaCorta(rental.creadoEn),
              <strong>
                {rental.origen} <span className="route-arrow">→</span> {rental.destino}
              </strong>,
              rental.idaYVuelta
                ? `${fechaCorta(rental.fechaHoraSalida)} – ${fechaCorta(rental.fechaHoraRetorno)}`
                : fechaHoraCorta(rental.fechaHoraSalida),
              String(rental.numeroPasajeros),
              formatQ(rental.precioFinal ?? rental.precioEstimado),
              <Badge tone={estadoAlquilerTone(rental.estado)}>
                {estadoAlquilerLabel(rental.estado)}
              </Badge>,
            ])}
          />
        )}
        <div className="persistent-note">
          <Icon name="check" />
          <span>
            Las compras y alquileres presenciales hechos con su NIT aparecen aquí, incluso si se hicieron
            antes de crear su cuenta.
          </span>
        </div>
      </section>
    </>
  )
}
