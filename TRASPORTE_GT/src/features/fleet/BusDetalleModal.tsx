import type { ReactNode } from 'react'
import { Badge } from '../../components/ui/Badge'
import { FormModal } from '../../components/ui/FormModal'
import { Icon } from '../../components/ui/Icon'
import type { IconName } from '../../types'
import type { Bus } from '../../types/fleetTypes'
import { ETIQUETAS_ESTADO_OPERATIVO } from '../../types/fleetTypes'
import { formatDateEs } from '../../utils/format'
import { FotoPrivada } from './FotoPrivada'

function DatoBus({ icono, etiqueta, children }: { icono: IconName; etiqueta: string; children: ReactNode }) {
  return (
    <div className="driver-detail-item">
      <span className="driver-detail-label"><Icon name={icono} size={14} /> {etiqueta}</span>
      <strong>{children}</strong>
    </div>
  )
}

export function BusDetalleModal({ bus, sucursal, onClose }: { bus: Bus; sucursal: string; onClose: () => void }) {
  return (
    <FormModal
      eyebrow="Detalle del registro"
      title="Información del bus"
      actionLabel="Cerrar"
      onSubmit={onClose}
      onClose={onClose}
      hideFooter
    >
      <div className="driver-detail-hero">
        <FotoPrivada ruta={bus.fotoUrl} nombre={bus.placa} grande />
        <div>
          <h3>{bus.placa}</h3>
          <p>{bus.marca} {bus.modelo} · Modelo {bus.anioFabricacion}</p>
        </div>
        <Badge tone={bus.activo ? 'success' : 'neutral'}>{bus.activo ? 'Activo' : 'Inactivo'}</Badge>
      </div>
      <div className="detail-grid driver-detail-grid">
        <DatoBus icono="bus" etiqueta="Estado operativo">
          <span className={`driver-chip ${bus.estadoOperativo === 'DISPONIBLE' ? 'success' : 'info'}`}>
            {ETIQUETAS_ESTADO_OPERATIVO[bus.estadoOperativo]}
          </span>
        </DatoBus>
        <DatoBus icono="building" etiqueta="Sucursal">{sucursal}</DatoBus>
        <DatoBus icono="users" etiqueta="Capacidad"><span className="driver-chip info">{bus.capacidadPasajeros} pasajeros</span></DatoBus>
        <DatoBus icono="route" etiqueta="Kilometraje">{bus.kilometrajeActual.toLocaleString('es-GT')} km</DatoBus>
        <DatoBus icono="settings" etiqueta="Marca y modelo">{bus.marca} {bus.modelo}</DatoBus>
        <DatoBus icono="calendar" etiqueta="Año de fabricación">{bus.anioFabricacion}</DatoBus>
        <DatoBus icono="clock" etiqueta="Registrado">{formatDateEs(bus.creadoEn.slice(0, 10))}</DatoBus>
        <DatoBus icono="edit" etiqueta="Última actualización">{formatDateEs(bus.actualizadoEn.slice(0, 10))}</DatoBus>
      </div>
    </FormModal>
  )
}
