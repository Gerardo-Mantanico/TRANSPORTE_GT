import { DataTable } from '../../components/ui/DataTable'
import { Icon } from '../../components/ui/Icon'
import { InfoNote } from '../../components/ui/Misc'
import { ETIQUETAS_TIPO_LINEA, type GastoTaller } from '../../types/costsTypes'
import { formatDateEs, formatQ } from '../../utils/format'

export function DetalleGastoModal({ gasto, placa, onClose }: { gasto: GastoTaller; placa: string; onClose: () => void }) {
  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section className="modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span className="eyebrow">Gasto de taller</span>
            <h2>
              {placa} · {formatDateEs(gasto.fechaServicio)}
            </h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">
          <DataTable
            headers={['Categoría', 'Tipo', 'Descripción', 'Monto']}
            rows={gasto.lineas.map((linea) => [
              <strong>{linea.nombreCategoria}</strong>,
              ETIQUETAS_TIPO_LINEA[linea.tipo] ?? linea.tipo,
              linea.descripcion,
              formatQ(linea.monto),
            ])}
          />
          <div className="read-only-row">
            <span>Total</span>
            <strong>{formatQ(gasto.total)}</strong>
          </div>
          {gasto.observaciones && <p className="modal-paragraph">{gasto.observaciones}</p>}
          <InfoNote>Los gastos de taller son inmutables.</InfoNote>
        </div>
      </section>
    </div>
  )
}
