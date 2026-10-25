import { Badge } from '../../../components/ui/Badge'
import { DataTable } from '../../../components/ui/DataTable'
import { useReporteRutasDemandadas } from '../../../hooks/reports'
import type { FilaRutaDemandada } from '../../../types/reportTypes'
import { formatMonto, hoyIso } from '../../../utils/format'
import { FiltrosReporte } from '../comun/FiltrosReporte'
import { MarcoReporte } from '../comun/MarcoReporte'
import { contarFilas, filasDeGrupos, type ColumnaReporte } from '../comun/tablaReporte'
import { useFiltrosReporte } from '../comun/useFiltrosReporte'

const COLUMNAS: ColumnaReporte<FilaRutaDemandada>[] = [
  {
    titulo: 'Ruta',
    celda: (f) => (
      <>
        <strong>
          {f.origen} → {f.destino}
        </strong>
        {f.eliminada && <Badge tone="danger">Eliminada</Badge>}
      </>
    ),
  },
  { titulo: 'Distancia', celda: (f) => (f.distanciaKm == null ? '—' : `${f.distanciaKm} km`) },
  { titulo: 'Precio actual', celda: (f) => formatMonto(f.precioBoleto) },
  { titulo: 'Boletos vendidos', celda: (f) => <strong>{f.boletosVendidos}</strong> },
  { titulo: 'Viajes con ventas', celda: (f) => f.viajesConVentas },
  { titulo: 'Ingreso', celda: (f) => formatMonto(f.ingreso) },
]

export function RutasDemandadasReporte({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  const control = useFiltrosReporte({}, hoyIso())
  const consulta = useReporteRutasDemandadas(control.intervalo)

  return (
    <MarcoReporte
      titulo={titulo}
      subtitulo={subtitulo}
      consulta={consulta}
      filtros={<FiltrosReporte control={control} />}
      indicadores={(r) => [
        { etiqueta: 'Boletos vendidos', valor: String(r.totales.boletosVendidos) },
        { etiqueta: 'Ingreso por boletos', valor: formatMonto(String(r.totales.ingreso)) },
      ]}
      vacio={(r) => contarFilas(r.grupos) === 0}
      total={(r) => ({ etiqueta: 'TOTAL DE BOLETOS VENDIDOS', valor: String(r.totales.boletosVendidos) })}
    >
      {(r) => <DataTable headers={COLUMNAS.map((c) => c.titulo)} rows={filasDeGrupos(r.grupos, COLUMNAS)} />}
    </MarcoReporte>
  )
}
