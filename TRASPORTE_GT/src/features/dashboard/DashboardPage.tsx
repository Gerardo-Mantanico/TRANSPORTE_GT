import { useNavigate } from 'react-router-dom'
import { RECENT_ACTIVITY, REVENUE_CHART, TODAY_TRIPS } from '../../data/mock'
import type { IconName } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { DataTable } from '../../components/ui/DataTable'
import { Icon } from '../../components/ui/Icon'
import { KpiCard } from '../../components/ui/KpiCard'

export function DashboardPage() {
  const navigate = useNavigate()

  return (
    <>
      <section className="kpi-grid">
        <KpiCard
          label="Ingresos este mes"
          value="Q 128,450"
          delta="+12.4%"
          icon="chart"
          tone="mint"
          hint="vs. Q 114,270 en mayo"
        />
        <KpiCard
          label="Viajes de hoy"
          value="24"
          delta="8 pendientes"
          icon="route"
          tone="blue"
          deltaTone="warning"
          hint="16 completados · 8 por salir"
        />
        <KpiCard
          label="Flota operativa"
          value="18 / 21"
          delta="86%"
          icon="bus"
          tone="amber"
          progress={86}
          hint="3 buses en taller"
        />
        <KpiCard
          label="Gastos este mes"
          value="Q 36,280"
          delta="-3.8%"
          icon="wallet"
          tone="violet"
          deltaTone="success"
          hint="vs. Q 37,712 en mayo"
        />
      </section>
      <section className="dashboard-grid">
        <div className="surface chart-card">
          <div className="section-title">
            <div>
              <h2>Ingresos y gastos</h2>
              <p>Comportamiento de los últimos 6 meses</p>
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
            <p>Salidas programadas para hoy</p>
          </div>
          <button className="text-button" onClick={() => navigate('/viajes')}>
            Ver todos <Icon name="arrow" size={15} />
          </button>
        </div>
        <DataTable
          headers={['Ruta', 'Salida', 'Bus', 'Chofer', 'Estado', '']}
          rows={TODAY_TRIPS.map((trip) => [
            <strong>{trip.route}</strong>,
            trip.time,
            trip.bus,
            trip.driver,
            <Badge tone={trip.tone}>{trip.state}</Badge>,
            <button className="icon-button" aria-label="Más acciones">
              <Icon name="more" />
            </button>,
          ])}
        />
      </section>
    </>
  )
}
