import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { errorMessage } from '../../api/client'
import { listarBuses } from '../../api/fleet'
import { listarViajes } from '../../api/trips'
import type { BusResponse, ViajeResponse } from '../../api/types'
import { RECENT_ACTIVITY, REVENUE_CHART } from '../../data/mock'
import type { IconName } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { DataTable } from '../../components/ui/DataTable'
import { Icon } from '../../components/ui/Icon'
import { KpiCard } from '../../components/ui/KpiCard'
import { useToast } from '../../components/ui/useToast'
import { estadoViajeLabel, estadoViajeTone, fechaHoraCorta, horaDe } from '../lists/mappers'

export function DashboardPage() {
  const navigate = useNavigate()
  const [buses, setBuses] = useState<BusResponse[]>([])
  const [viajes, setViajes] = useState<ViajeResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [busesPagina, viajesData] = await Promise.all([
          listarBuses({ size: 100 }),
          listarViajes().catch(() => [] as ViajeResponse[]),
        ])
        if (cancelled) return
        setBuses(busesPagina.contenido)
        setViajes(viajesData)
      } catch (caught) {
        if (cancelled) return
        const message = errorMessage(caught)
        setError(message)
        toast.error(message)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [toast])

  const hoy = new Date().toISOString().slice(0, 10)
  const viajesHoy = viajes.filter((viaje) => viaje.fechaHoraSalida.slice(0, 10) === hoy)
  const programados = viajesHoy.filter(
    (viaje) => viaje.estado === 'PROGRAMADO' || viaje.estado === 'PENDIENTE_ASIGNACION',
  ).length
  const completados = viajesHoy.filter((viaje) => viaje.estado === 'FINALIZADO').length
  const operativos = buses.filter((bus) => bus.activo && bus.estadoOperativo !== 'EN_TALLER').length
  const enTaller = buses.filter((bus) => bus.estadoOperativo === 'EN_TALLER').length
  const totalBuses = buses.length
  const porcentaje = totalBuses > 0 ? Math.round((operativos / totalBuses) * 100) : 0

  return (
    <>
      {error && (
        <div className="info-note danger-copy" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <section className="kpi-grid">
        <KpiCard
          label="Ingresos este mes"
          value="—"
          delta="Reportes pendientes"
          icon="chart"
          tone="mint"
          hint="ReportingService sin API"
        />
        <KpiCard
          label="Viajes de hoy"
          value={String(viajesHoy.length)}
          delta={`${programados} pendientes`}
          icon="route"
          tone="blue"
          deltaTone="warning"
          hint={`${completados} completados`}
        />
        <KpiCard
          label="Flota operativa"
          value={`${operativos} / ${totalBuses}`}
          delta={`${porcentaje}%`}
          icon="bus"
          tone="amber"
          progress={porcentaje}
          hint={`${enTaller} buses en taller`}
        />
        <KpiCard
          label="Gastos este mes"
          value="—"
          delta="Reportes pendientes"
          icon="wallet"
          tone="violet"
          hint="ReportingService sin API"
        />
      </section>
      <section className="dashboard-grid">
        <div className="surface chart-card">
          <div className="section-title">
            <div>
              <h2>Ingresos y gastos</h2>
              <p>Comportamiento de los últimos 6 meses (demostración)</p>
            </div>
            <select defaultValue="Últimos 6 meses">
              <option>Últimos 6 meses</option>
            </select>
          </div>
          <div className="chart-legend">
            <span>
              <i className="green" /> Ingresos
            </span>
            <span>
              <i className="orange" /> Gastos
            </span>
          </div>
          <div className="bar-chart">
            {REVENUE_CHART.map(([month, revenue, expense]) => (
              <div key={month} className="bar-set">
                <div>
                  <i style={{ height: `${revenue}%` }} />
                  <i style={{ height: `${expense}%` }} />
                </div>
                <span>{month}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="surface activity-card">
          <div className="section-title">
            <div>
              <h2>Actividad reciente</h2>
              <p>Actualizaciones de la operación</p>
            </div>
          </div>
          <div className="activity-list">
            {RECENT_ACTIVITY.map(([icon, title, note, tone]) => (
              <div key={title} className="activity">
                <span className={tone}>
                  <Icon name={icon as IconName} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <small>{note}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="surface">
        <div className="section-title">
          <div>
            <h2>Próximos viajes</h2>
            <p>Salidas registradas en TripService</p>
          </div>
          <button className="text-button" onClick={() => navigate('/viajes')}>
            Ver todos <Icon name="arrow" size={15} />
          </button>
        </div>
        <DataTable
          headers={['Ruta', 'Salida', 'Bus', 'Chofer', 'Estado', '']}
          rows={viajes.slice(0, 8).map((trip) => [
            <strong>
              {trip.nombreOrigen} <span className="route-arrow">→</span> {trip.nombreDestino}
            </strong>,
            fechaHoraCorta(trip.fechaHoraSalida),
            trip.bus?.placa ?? '—',
            trip.chofer?.nombreCompleto ?? '—',
            <Badge tone={estadoViajeTone(trip.estado)}>{estadoViajeLabel(trip.estado)}</Badge>,
            <button className="icon-button" aria-label="Más acciones" title={horaDe(trip.fechaHoraSalida)}>
              <Icon name="more" />
            </button>,
          ])}
        />
      </section>
    </>
  )
}
