import type { ReactNode } from 'react'
import { FormModal } from '../../components/ui/FormModal'
import { Badge } from '../../components/ui/Badge'
import { Icon } from '../../components/ui/Icon'
import type { Chofer } from '../../types/fleetTypes'
import type { IconName } from '../../types'
import { formatDateEs, formatQ } from '../../utils/format'
import { EstadoLicencia } from './EstadoLicencia'
import { FotoPrivada } from './FotoPrivada'

function DatoChofer({ icono, etiqueta, children }: { icono: IconName; etiqueta: string; children: ReactNode }) {
  return (
    <div className="driver-detail-item">
      <span className="driver-detail-label"><Icon name={icono} size={14} /> {etiqueta}</span>
      <strong>{children}</strong>
    </div>
  )
}

export function ChoferDetalleModal({ chofer, sucursal, onClose }: { chofer: Chofer; sucursal: string; onClose: () => void }) {
  return (
    <FormModal
      eyebrow="Detalle del registro"
      title="Información del chofer"
      actionLabel="Cerrar"
      onSubmit={onClose}
      onClose={onClose}
      hideFooter
    >
      <div className="driver-detail-hero">
        <FotoPrivada ruta={chofer.fotoUrl} nombre={chofer.nombreCompleto} grande />
        <div>
          <h3>{chofer.nombreCompleto}</h3>
          <p>{chofer.correo}</p>
        </div>
        <Badge tone={chofer.activo ? 'success' : 'neutral'}>{chofer.activo ? 'Activo' : 'Inactivo'}</Badge>
      </div>
      <div className="detail-grid driver-detail-grid">
        <DatoChofer icono="phone" etiqueta="Teléfono">{chofer.telefono || '—'}</DatoChofer>
        <DatoChofer icono="building" etiqueta="Sucursal">{sucursal}</DatoChofer>
        <DatoChofer icono="doc" etiqueta="Licencia"><span className="driver-chip info">{chofer.numeroLicencia}</span></DatoChofer>
        <DatoChofer icono="settings" etiqueta="Tipo de licencia"><span className="driver-chip">Tipo {chofer.tipoLicencia}</span></DatoChofer>
        <DatoChofer icono="calendar" etiqueta="Vencimiento">
          {formatDateEs(chofer.fechaVencimientoLicencia)}
          <small><EstadoLicencia fechaVencimiento={chofer.fechaVencimientoLicencia} /></small>
        </DatoChofer>
        <DatoChofer icono="wallet" etiqueta="Salario base por viaje">{formatQ(chofer.salarioBaseViaje)}</DatoChofer>
        <DatoChofer icono="user" etiqueta="Acceso al sistema">
          <span className={`driver-chip ${chofer.idUsuario ? 'success' : 'muted'}`}>{chofer.idUsuario ? 'Con usuario' : 'Sin usuario'}</span>
        </DatoChofer>
        <DatoChofer icono="clock" etiqueta="Registrado">{formatDateEs(chofer.creadoEn.slice(0, 10))}</DatoChofer>
      </div>
    </FormModal>
  )
}
