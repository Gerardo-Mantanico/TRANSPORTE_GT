import { useMemo } from 'react'
import { DataTable } from '../../../components/ui/DataTable'
import { LeafletRouteMap, type MapRoute } from '../../../components/domain/LeafletRouteMap'
import { useReporteMapaRutas, useSucursalesReportes } from '../../../hooks/reports'
import type { FilaMapaRuta, ReporteTabla } from '../../../types/reportTypes'
import { formatMonto, hoyIso } from '../../../utils/format'
import { FiltrosReporte } from '../comun/FiltrosReporte'
import { MarcoReporte } from '../comun/MarcoReporte'
import { SelectorCatalogo } from '../comun/SelectorCatalogo'
import { contarFilas, filasDeGrupos, type ColumnaReporte } from '../comun/tablaReporte'
import { useFiltrosReporte } from '../comun/useFiltrosReporte'

function coordenadas(latitud: number | null, longitud: number | null) {
  return latitud == null || longitud == null ? '—' : `${latitud}, ${longitud}`
}

const COLUMNAS: ColumnaReporte<FilaMapaRuta>[] = [
  { titulo: 'Origen', celda: (f) => <strong>{f.origen}</strong> },
  { titulo: 'Coordenadas de origen', celda: (f) => coordenadas(f.latitudOrigen, f.longitudOrigen) },
  { titulo: 'Destino', celda: (f) => <strong>{f.destino}</strong> },
  { titulo: 'Coordenadas de destino', celda: (f) => coordenadas(f.latitudDestino, f.longitudDestino) },
  { titulo: 'Distancia', celda: (f) => (f.distanciaKm == null ? '—' : `${f.distanciaKm} km`) },
  { titulo: 'Precio', celda: (f) => formatMonto(f.precioBoleto) },
]

function MapaYTabla({ reporte }: { reporte: ReporteTabla<FilaMapaRuta> }) {
  const rutas = useMemo<MapRoute[]>(
    () =>
      reporte.grupos.flatMap((grupo) =>
        (grupo.filas ?? []).map((fila) => ({
          origin: fila.origen,
          destination: fila.destino,
          label: `${fila.distanciaKm ?? '—'} km · ${formatMonto(fila.precioBoleto)}`,
          from:
            fila.latitudOrigen != null && fila.longitudOrigen != null
              ? { lat: fila.latitudOrigen, lng: fila.longitudOrigen }
              : undefined,
          to:
            fila.latitudDestino != null && fila.longitudDestino != null
              ? { lat: fila.latitudDestino, lng: fila.longitudDestino }
              : undefined,
        })),
      ),
    [reporte],
  )
  return (
    <>
      <div className="report-map">
        <LeafletRouteMap routes={rutas} />
      </div>
      <DataTable headers={COLUMNAS.map((c) => c.titulo)} rows={filasDeGrupos(reporte.grupos, COLUMNAS)} />
    </>
  )
}

export function MapaRutasReporte({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  const control = useFiltrosReporte({ idSucursal: '' }, hoyIso())
  const sucursales = useSucursalesReportes()
  const idSucursal = control.aplicados.extra.idSucursal
  const consulta = useReporteMapaRutas({ idSucursal: idSucursal || undefined })

  return (
    <MarcoReporte
      titulo={titulo}
      subtitulo={subtitulo}
      consulta={consulta}
      pendiente={idSucursal ? null : 'Seleccione la sucursal de origen'}
      filtros={
        <FiltrosReporte control={control} sinFechas>
          <SelectorCatalogo
            etiqueta="Sucursal de origen"
            todas={null}
            valor={control.borrador.extra.idSucursal}
            opciones={sucursales.datos}
            cargando={sucursales.cargando}
            onCambiar={(valor) => control.cambiarExtra({ idSucursal: valor })}
          />
        </FiltrosReporte>
      }
      indicadores={(r) => [
        { etiqueta: 'Rutas vigentes', valor: String(r.totales.rutas) },
        { etiqueta: 'Sucursal de origen', valor: r.filtros.otros.sucursal ?? '—' },
      ]}
      vacio={(r) => contarFilas(r.grupos) === 0}
    >
      {(r) => <MapaYTabla reporte={r} />}
    </MarcoReporte>
  )
}
