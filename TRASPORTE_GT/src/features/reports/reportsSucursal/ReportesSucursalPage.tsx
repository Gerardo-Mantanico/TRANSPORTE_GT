import { useState } from 'react'
import { useAuth } from '../../../app/providers/useAuth'
import { Icon } from '../../../components/ui/Icon'
import { useSucursalesReportes } from '../../../hooks/reports'
import { SelectorCatalogo } from '../comun/SelectorCatalogo'
import { BusesReporte } from './BusesReporte'
import { ChoferesReporte } from './ChoferesReporte'
import { DepreciacionReporte } from './DepreciacionReporte'
import { IngresosAlquileresReporte } from './IngresosAlquileresReporte'
import { IngresosBoletosReporte } from './IngresosBoletosReporte'
import { TallerBusReporte } from './TallerBusReporte'
import { REPORTES_SUCURSAL, type ReporteSucursalId } from './definiciones'

const COMPONENTES: Record<ReporteSucursalId, typeof BusesReporte> = {
  buses: BusesReporte,
  choferes: ChoferesReporte,
  boletos: IngresosBoletosReporte,
  alquileres: IngresosAlquileresReporte,
  depreciacion: DepreciacionReporte,
  taller: TallerBusReporte,
}

/**
 * Reportes de sucursal (7 a 12). El ADMIN_SUCURSAL ve siempre la suya (el backend la toma del token);
 * el ADMIN_SISTEMA elige la sucursal.
 */
export function ReportesSucursalPage() {
  const { usuario } = useAuth()
  const esAdminSistema = usuario?.rol === 'ADMIN_SISTEMA'
  const [seleccionado, setSeleccionado] = useState<ReporteSucursalId>('buses')
  const [idSucursal, setIdSucursal] = useState('')
  const sucursales = useSucursalesReportes(esAdminSistema)
  const definicion = REPORTES_SUCURSAL.find((reporte) => reporte.id === seleccionado) ?? REPORTES_SUCURSAL[0]
  const Reporte = COMPONENTES[definicion.id]

  return (
    <>
      {esAdminSistema && (
        <section className="surface report-branch-picker">
          <SelectorCatalogo
            etiqueta="Sucursal del reporte"
            todas={null}
            valor={idSucursal}
            opciones={sucursales.datos}
            cargando={sucursales.cargando}
            onCambiar={setIdSucursal}
          />
        </section>
      )}
      <section className="report-grid">
        {REPORTES_SUCURSAL.map((reporte) => (
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
      {/* key: al cambiar de reporte o de sucursal, los filtros vuelven a su valor inicial */}
      <Reporte
        key={`${definicion.id}-${idSucursal}`}
        titulo={definicion.titulo}
        subtitulo={definicion.subtitulo}
        idSucursal={esAdminSistema ? idSucursal || undefined : undefined}
        habilitado={!esAdminSistema || Boolean(idSucursal)}
      />
    </>
  )
}
