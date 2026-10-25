import type { ReactNode } from 'react'
import { Badge } from '../../components/ui/Badge'
import { FormModal } from '../../components/ui/FormModal'
import { Icon } from '../../components/ui/Icon'
import { SelectorUbicacionMapa } from '../../components/domain/SelectorUbicacionMapa'
import type { IconName } from '../../types'
import type { Sucursal } from '../../types/identityTypes'
import { formatDateEs } from '../../utils/format'

function DatoSucursal({ icono, etiqueta, children }: { icono: IconName; etiqueta: string; children: ReactNode }) {
  return (
    <div className="driver-detail-item">
      <span className="driver-detail-label"><Icon name={icono} size={14} /> {etiqueta}</span>
      <strong>{children}</strong>
    </div>
  )
}

export function SucursalDetalleModal({ sucursal, onClose }: { sucursal: Sucursal; onClose: () => void }) {
  return (
    <FormModal
      eyebrow="Detalle del registro"
      title="Información de la sucursal"
      actionLabel="Cerrar"
      onSubmit={onClose}
      onClose={onClose}
      hideFooter
    >
      <div className="driver-detail-hero">
        <span className="modal-icon"><Icon name="building" size={24} /></span>
        <div>
          <h3>{sucursal.nombre}</h3>
          <p>{sucursal.departamento} · Sucursal de transporte</p>
        </div>
        <Badge tone={sucursal.activa ? 'success' : 'neutral'}>{sucursal.activa ? 'Activa' : 'Inactiva'}</Badge>
      </div>
      <div className="detail-grid driver-detail-grid">
        <DatoSucursal icono="building" etiqueta="Departamento">{sucursal.departamento}</DatoSucursal>
        <DatoSucursal icono="phone" etiqueta="Teléfono">{sucursal.telefono || 'No registrado'}</DatoSucursal>
        <DatoSucursal icono="route" etiqueta="Dirección">{sucursal.direccion}</DatoSucursal>
        <DatoSucursal icono="route" etiqueta="Coordenadas">{sucursal.latitud}, {sucursal.longitud}</DatoSucursal>
        <DatoSucursal icono="calendar" etiqueta="Registrada">{formatDateEs(sucursal.creadoEn.slice(0, 10))}</DatoSucursal>
        <DatoSucursal icono="edit" etiqueta="Última actualización">{formatDateEs(sucursal.actualizadoEn.slice(0, 10))}</DatoSucursal>
      </div>
      <div className="branch-detail-map">
        <strong>Ubicación en el mapa</strong>
        <SelectorUbicacionMapa
          punto={[sucursal.latitud, sucursal.longitud]}
          direccion={sucursal.direccion}
          onCambiar={() => undefined}
          onDireccion={() => undefined}
          onDepartamento={() => undefined}
          soloLectura
          height={240}
        />
      </div>
    </FormModal>
  )
}
