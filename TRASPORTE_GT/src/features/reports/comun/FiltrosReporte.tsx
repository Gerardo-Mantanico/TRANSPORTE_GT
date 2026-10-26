import type { ReactNode } from 'react'
import { Button } from '../../../components/ui/Button'
import { Field } from '../../../components/ui/Field'
import { Icon } from '../../../components/ui/Icon'
import type { FiltrosReporteControl } from './useFiltrosReporte'

interface FiltrosReporteProps<T extends object> {
  control: FiltrosReporteControl<T>
  /** Filtros propios del reporte (sucursal, bus, ruta, estado...). */
  children?: ReactNode
  /** El mapa de rutas no filtra por fechas. */
  sinFechas?: boolean
}

export function FiltrosReporte<T extends object>({ control, children, sinFechas = false }: FiltrosReporteProps<T>) {
  const { borrador, cambiar, aplicar, restablecer, rangoInvalido } = control

  return (
    <div className="filter-shell report-filters">
      <div className="filter-panel">
        <div className="filters">
          {!sinFechas && (
            <>
              <label className="check-row report-all-records">
                <input
                  type="checkbox"
                  checked={borrador.todo}
                  onChange={(event) => cambiar({ todo: event.target.checked })}
                />
                <span>
                  <strong>Todo el historial</strong>
                  <small>Si se desmarca, se filtra por la fecha de negocio del intervalo.</small>
                </span>
              </label>
              <Field
                label="Desde"
                type="date"
                value={borrador.desde}
                disabled={borrador.todo}
                onChange={(event) => cambiar({ desde: event.target.value })}
              />
              <Field
                label="Hasta"
                type="date"
                value={borrador.hasta}
                disabled={borrador.todo}
                onChange={(event) => cambiar({ hasta: event.target.value })}
              />
            </>
          )}
          {children}
        </div>
        {rangoInvalido && (
          <div className="form-error" role="alert">
            <Icon name="close" size={15} />
            <div>
              <strong>Intervalo inválido</strong>
              <small>La fecha «desde» no puede ser posterior a «hasta».</small>
            </div>
          </div>
        )}
        <div className="filter-actions">
          <button onClick={restablecer}>Restablecer</button>
          <Button variant="secondary" onClick={aplicar} disabled={rangoInvalido}>
            Aplicar filtros
          </Button>
        </div>
      </div>
    </div>
  )
}
