import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../app/providers/useAuth'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { KpiCard } from '../../components/ui/KpiCard'
import {
  useReporteGanancias, useReporteRutasDemandadas, useReporteBuses,
  useReporteChoferes, useReporteIngresosBoletos, useReporteIngresosAlquileres,
  useReporteTallerBus, useReporteDepreciacionBuses,
} from '../../hooks/reports'
import type { ResultadoConsulta } from '../../hooks/useConsulta'
import type { FiltroFechas, GrupoReporte, ReporteTabla, ValorTotal } from '../../types/reportTypes'
import { formatQ, hoyIso } from '../../utils/format'
import './dashboard.css'

function filas<F>(grupos: GrupoReporte<F>[]): F[] {
  return grupos.flatMap((grupo) => grupo.subgrupos ? filas(grupo.subgrupos) : (grupo.filas ?? []))
}

function sumar<F>(datos: F[], valor: (fila: F) => string | number): number {
  return datos.reduce((total, fila) => total + Number(valor(fila)), 0)
}

function Reporte<F>({ consulta, children }: {
  consulta: ResultadoConsulta<ReporteTabla<F>>
  children: (datos: F[], totales: Record<string, ValorTotal>) => ReactNode
}) {
  if (consulta.cargando) return <Cargando texto="Consultando reporte..." />
  if (consulta.error) return <AvisoError error={consulta.error} onReintentar={consulta.recargar} />
  if (!consulta.datos) return null
  return children(filas(consulta.datos.grupos), consulta.datos.totales)
}

function Panel({ titulo, detalle, children }: { titulo: string; detalle: string; children: ReactNode }) {
  return <section className="surface dashboard-report-panel">
    <div className="section-title"><div><h2>{titulo}</h2><p>{detalle}</p></div></div>
    {children}
  </section>
}

function Grafica({ datos, series, dinero = true }: {
  datos: { etiqueta: string; valores: number[] }[]
  series: string[]
  dinero?: boolean
}) {
  if (!datos.length || datos.every((fila) => fila.valores.every((valor) => valor === 0))) {
    return <p className="dashboard-empty">Sin movimientos en el período seleccionado.</p>
  }
  const maximo = Math.max(1, ...datos.flatMap((fila) => fila.valores.map(Math.abs)))
  const formato = (valor: number) => dinero ? formatQ(valor) : valor.toLocaleString('es-GT')
  return <div className="dashboard-report-chart">
    <div className="chart-legend">{series.map((serie, indice) => <span key={serie}>
      <i className={indice === 1 ? 'orange' : 'green'} />{serie}
    </span>)}</div>
    <ul className="dashboard-chart-rows">{datos.map((fila) => <li key={fila.etiqueta}>
      <strong>{fila.etiqueta}</strong>
      {fila.valores.map((valor, indice) => <div className="dashboard-chart-value" key={series[indice]}>
        <span className="dashboard-chart-track" aria-hidden="true">
          <i className={indice === 1 ? 'orange' : ''} style={{ width: `${Math.abs(valor) / maximo * 100}%` }} />
        </span>
        <span>{series[indice]}: {formato(valor)}</span>
      </div>)}
    </li>)}</ul>
  </div>
}

function ResumenSistema({ filtro }: { filtro: FiltroFechas }) {
  const ganancias = useReporteGanancias(filtro)
  const rutas = useReporteRutasDemandadas(filtro)
  return <>
    <Reporte consulta={ganancias}>{(datos) => {
      const ingresos = sumar(datos, (fila) => fila.ingresos)
      const gastos = sumar(datos, (fila) => fila.gastos)
      const ganancia = sumar(datos, (fila) => fila.ganancia)
      return <>
        <section className="kpi-grid">
          <KpiCard label="Ingresos" value={formatQ(ingresos)} delta="Período seleccionado" icon="chart" tone="mint" hint="Boletos y alquileres de todas las sucursales" />
          <KpiCard label="Gastos" value={formatQ(gastos)} delta="Período seleccionado" icon="wallet" tone="amber" hint="Costos reportados por las sucursales" />
          <KpiCard label="Ganancia" value={formatQ(ganancia)} delta={ganancia < 0 ? 'Pérdida' : 'Resultado neto'} deltaTone={ganancia < 0 ? 'warning' : 'success'} icon="chart" tone="violet" />
          <KpiCard label="Sucursales en el reporte" value={String(datos.length)} delta="Alcance global" icon="route" tone="blue" />
        </section>
        <Panel titulo="Ingresos y gastos por sucursal" detalle="Montos acumulados en el período seleccionado">
          <Grafica series={['Ingresos', 'Gastos']} datos={datos.map((fila) => ({ etiqueta: fila.sucursal, valores: [Number(fila.ingresos), Number(fila.gastos)] }))} />
          {datos.length > 0 && <DataTable headers={['Sucursal', 'Ingresos', 'Gastos', 'Ganancia']} rows={datos.map((fila) => [fila.sucursal, formatQ(Number(fila.ingresos)), formatQ(Number(fila.gastos)), formatQ(Number(fila.ganancia))])} />}
        </Panel>
      </>
    }}</Reporte>
    <Panel titulo="Rutas más demandadas" detalle="Las cinco rutas con más boletos vendidos en el período">
      <Reporte consulta={rutas}>{(datos) => <Grafica dinero={false} series={['Boletos vendidos']} datos={[...datos].sort((a, b) => b.boletosVendidos - a.boletosVendidos).slice(0, 5).map((fila) => ({ etiqueta: `${fila.origen} → ${fila.destino}${fila.eliminada ? ' (eliminada)' : ''}`, valores: [fila.boletosVendidos] }))} />}</Reporte>
    </Panel>
  </>
}

function ResumenSucursal({ filtro }: { filtro: FiltroFechas }) {
  // La sucursal se obtiene del token; no se permite consultar otra desde este resumen.
  const boletos = useReporteIngresosBoletos(filtro)
  const alquileres = useReporteIngresosAlquileres(filtro)
  const buses = useReporteBuses({})
  const choferes = useReporteChoferes({})
  const taller = useReporteTallerBus(filtro)
  const depreciacion = useReporteDepreciacionBuses(filtro)
  return <>
    <section className="kpi-grid">
      <Reporte consulta={boletos}>{(datos) => <KpiCard label="Ingresos por boletos" value={formatQ(sumar(datos, (fila) => fila.ingreso))} delta={`${sumar(datos, (fila) => fila.boletosVendidos)} boletos`} icon="chart" tone="mint" hint="Período seleccionado" />}</Reporte>
      <Reporte consulta={alquileres}>{(datos) => <KpiCard label="Ingresos por alquileres" value={formatQ(sumar(datos, (fila) => fila.precioTotal))} delta={`${datos.length} alquileres`} icon="wallet" tone="blue" hint="Pagos del período seleccionado" />}</Reporte>
      <Reporte consulta={buses}>{(datos) => {
        const activos = datos.filter((fila) => fila.activo)
        const operativos = activos.filter((fila) => fila.estadoOperativo === 'DISPONIBLE' || fila.estadoOperativo === 'EN_TRANSITO').length
        return <KpiCard label="Flota operativa" value={`${operativos} / ${activos.length}`} delta="Estado actual" icon="bus" tone="amber" progress={activos.length ? operativos / activos.length * 100 : 0} hint="Buses activos disponibles o en tránsito" />
      }}</Reporte>
      <Reporte consulta={choferes}>{(datos) => <KpiCard label="Choferes activos" value={String(datos.filter((fila) => fila.activo).length)} delta={`${datos.filter((fila) => fila.activo && (fila.estadoLicencia === 'VENCIDA' || fila.estadoLicencia === 'POR_VENCER')).length} licencias por revisar`} icon="user" tone="violet" hint="Licencias vencidas o próximas a vencer; estado actual" />}</Reporte>
    </section>
    <div className="dashboard-grid">
      <Panel titulo="Ingresos por ruta" detalle="Las cinco rutas con mayores ingresos por boletos">
        <Reporte consulta={boletos}>{(datos) => {
          const porRuta = new Map<string, number>()
          datos.forEach((fila) => porRuta.set(fila.ruta, (porRuta.get(fila.ruta) ?? 0) + Number(fila.ingreso)))
          return <Grafica series={['Ingresos']} datos={[...porRuta].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([etiqueta, valor]) => ({ etiqueta, valores: [valor] }))} />
        }}</Reporte>
      </Panel>
      <Panel titulo="Estado de la flota" detalle="Estado actual de los buses activos de su sucursal">
        <Reporte consulta={buses}>{(datos) => <Grafica dinero={false} series={['Buses']} datos={[
          ['DISPONIBLE', 'Disponibles'], ['EN_TRANSITO', 'En tránsito'], ['EN_TALLER', 'En taller'], ['FUERA_DE_SERVICIO', 'Fuera de servicio'],
        ].map(([estado, etiqueta]) => ({ etiqueta, valores: [datos.filter((fila) => fila.activo && fila.estadoOperativo === estado).length] })).concat([{ etiqueta: 'Sin estado', valores: [datos.filter((fila) => fila.activo && fila.estadoOperativo == null).length] }])} />}</Reporte>
      </Panel>
    </div>
    <div className="dashboard-grid">
      <Panel titulo="Gastos de taller por bus" detalle="Los cinco buses con mayores gastos en el período">
        <Reporte consulta={taller}>{(datos) => {
          const porBus = new Map<string, number>()
          datos.forEach((fila) => porBus.set(fila.placa, (porBus.get(fila.placa) ?? 0) + Number(fila.monto)))
          return <><p className="dashboard-total">Total: {formatQ(sumar(datos, (fila) => fila.monto))}</p>
            <Grafica series={['Gastos']} datos={[...porBus].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([etiqueta, valor]) => ({ etiqueta, valores: [valor] }))} /></>
        }}</Reporte>
      </Panel>
      <Panel titulo="Depreciación de buses" detalle="Los cinco buses con mayor depreciación en el período">
        <Reporte consulta={depreciacion}>{(datos, totales) => <>
          <p className="dashboard-total">Total: {formatQ(Number(totales.depreciacionAcumulada ?? 0))}</p>
          <Grafica series={['Depreciación']} datos={[...datos].sort((a, b) => Number(b.depreciacionAcumulada) - Number(a.depreciacionAcumulada)).slice(0, 5).map((fila) => ({ etiqueta: fila.placa, valores: [Number(fila.depreciacionAcumulada)] }))} />
        </>}</Reporte>
      </Panel>
    </div>
  </>
}

export function DashboardPage() {
  const { usuario } = useAuth()
  const [filtro, setFiltro] = useState<FiltroFechas>(() => {
    const hasta = hoyIso()
    return { desde: `${hasta.slice(0, 7)}-01`, hasta }
  })
  const [desde, setDesde] = useState(filtro.desde ?? '')
  const [hasta, setHasta] = useState(filtro.hasta ?? '')
  const sistema = usuario?.rol === 'ADMIN_SISTEMA'
  if (!usuario || (!sistema && usuario.rol !== 'ADMIN_SUCURSAL')) return null
  const aplicar = (event: FormEvent) => {
    event.preventDefault()
    if (desde && hasta && desde <= hasta) setFiltro({ desde, hasta })
  }
  return <div className="dashboard-reports">
    <section className="surface dashboard-report-panel">
      <div className="section-title"><div>
        <h2>{sistema ? 'Resumen del sistema' : `Resumen de ${usuario.nombreSucursal ?? 'su sucursal'}`}</h2>
        <p>{sistema ? 'Resultados de todas las sucursales' : 'Resultados de su sucursal y estado actual de la operación'}</p>
      </div><Link className="text-button" to={sistema ? '/reportes-sistema' : '/reportes-sucursal'}>Ver reportes</Link></div>
      <form className="dashboard-period" onSubmit={aplicar}>
        <label>Desde<input type="date" value={desde} max={hasta || undefined} onChange={(event) => setDesde(event.target.value)} required /></label>
        <label>Hasta<input type="date" value={hasta} min={desde || undefined} onChange={(event) => setHasta(event.target.value)} required /></label>
        <button className="text-button" type="submit">Aplicar período</button>
      </form>
      <p className="dashboard-period-note">Período consultado: {filtro.desde} al {filtro.hasta}</p>
    </section>
    {sistema ? <ResumenSistema filtro={filtro} /> : <ResumenSucursal filtro={filtro} />}
  </div>
}
