import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { GananciasReporte } from './GananciasReporte'
import { GastosReporte } from './GastosReporte'
import { IngresosReporte } from './IngresosReporte'
import { MapaRutasReporte } from './MapaRutasReporte'
import { RutasDemandadasReporte } from './RutasDemandadasReporte'
import { TallerCategoriaReporte } from './TallerCategoriaReporte'
import { REPORTES_ADMIN, type ReporteAdminId } from './definiciones'

const COMPONENTES: Record<ReporteAdminId, typeof IngresosReporte> = {
  ingresos: IngresosReporte,
  gastos: GastosReporte,
  ganancias: GananciasReporte,
  rutas: RutasDemandadasReporte,
  taller: TallerCategoriaReporte,
  mapa: MapaRutasReporte,
}

/** Reportes globales del administrador del sistema (1 a 6). */
export function ReportesAdminPage() {
  const [seleccionado, setSeleccionado] = useState<ReporteAdminId>('ingresos')
  const definicion = REPORTES_ADMIN.find((reporte) => reporte.id === seleccionado) ?? REPORTES_ADMIN[0]
  const Reporte = COMPONENTES[definicion.id]

  return (
    <>
      <section className="report-grid">
        {REPORTES_ADMIN.map((reporte) => (
          <button
            key={reporte.id}
            className={reporte.id === seleccionado ? 'active' : ''}
            onClick={() => setSeleccionado(reporte.id)}
          >
            <span>
              <Icon name={reporte.icono} />
            </span>
            <div>
              <strong>{reporte.titulo}</strong>
              <small>{reporte.subtitulo}</small>
            </div>
            <Icon name="chevron" size={16} />
          </button>
        ))}
      </section>
      {/* key: cada reporte arranca con sus filtros por omisión */}
      <Reporte key={definicion.id} titulo={definicion.titulo} subtitulo={definicion.subtitulo} />
    </>
  )
}
