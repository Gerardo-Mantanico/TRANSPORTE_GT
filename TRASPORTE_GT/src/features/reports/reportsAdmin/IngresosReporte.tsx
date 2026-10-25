import { DataTable } from '../../../components/ui/DataTable'
import { Badge } from '../../../components/ui/Badge'
import { useReporteIngresos, useSucursalesReportes } from '../../../hooks/reports'
import type { FilaIngreso } from '../../../types/reportTypes'
import { formatDateEs, formatMonto, hoyIso } from '../../../utils/format'
import { ETIQUETA_CANAL, ETIQUETA_TIPO_INGRESO, etiqueta } from '../comun/etiquetas'
import { FiltrosReporte } from '../comun/FiltrosReporte'
import { MarcoReporte } from '../comun/MarcoReporte'
import { SelectorCatalogo } from '../comun/SelectorCatalogo'
import { contarFilas, filasDeGrupos, type ColumnaReporte } from '../comun/tablaReporte'
import { useFiltrosReporte } from '../comun/useFiltrosReporte'

const COLUMNAS: ColumnaReporte<FilaIngreso>[] = [
  { titulo: 'Sucursal', celda: (f) => f.sucursal },
  { titulo: 'Fecha de pago', celda: (f) => formatDateEs(f.fecha) },
  {
    titulo: 'Tipo',
    celda: (f) => (
      <Badge tone={f.tipo === 'ALQUILER' ? 'info' : 'success'}>{etiqueta(ETIQUETA_TIPO_INGRESO, f.tipo)}</Badge>
    ),
    subtotal: 'ingresos',
  },
  { titulo: 'Ruta / trayecto', celda: (f) => f.descripcion },
  {
    titulo: 'Cliente',
    celda: (f) => (
      <>
        <strong>{f.cliente ?? '—'}</strong>
        <small className="cell-note">NIT {f.nit ?? '—'}</small>
      </>
    ),
  },
  { titulo: 'Boletos', celda: (f) => f.cantidadBoletos ?? '—', subtotal: 'boletos' },
  { titulo: 'Canal', celda: (f) => etiqueta(ETIQUETA_CANAL, f.canal) },
  { titulo: 'Monto', celda: (f) => formatMonto(f.monto), subtotal: 'monto', dinero: true },
]

export function IngresosReporte({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  const control = useFiltrosReporte({ idSucursal: '' }, hoyIso())
  const sucursales = useSucursalesReportes()
  const consulta = useReporteIngresos({
    ...control.intervalo,
    idSucursal: control.aplicados.extra.idSucursal || undefined,
  })

  return (
    <MarcoReporte
      titulo={titulo}
      subtitulo={subtitulo}
      consulta={consulta}
      columnas={COLUMNAS}
      filtros={
        <FiltrosReporte control={control}>
          <SelectorCatalogo
            etiqueta="Sucursal"
            valor={control.borrador.extra.idSucursal}
            opciones={sucursales.datos}
            cargando={sucursales.cargando}
            onCambiar={(idSucursal) => control.cambiarExtra({ idSucursal })}
          />
        </FiltrosReporte>
      }
      indicadores={(r) => [
        { etiqueta: 'Ingresos en el periodo', valor: formatMonto(String(r.totales.monto)) },
        { etiqueta: 'Registros · boletos', valor: `${r.totales.ingresos} · ${r.totales.boletos}` },
      ]}
      vacio={(r) => contarFilas(r.grupos) === 0}
      total={(r) => ({ etiqueta: 'TOTAL GLOBAL DE INGRESOS', valor: formatMonto(String(r.totales.monto)) })}
    >
      {(r) => (
        <DataTable headers={COLUMNAS.map((c) => c.titulo)} rows={filasDeGrupos(r.grupos, COLUMNAS)} />
      )}
    </MarcoReporte>
  )
}
