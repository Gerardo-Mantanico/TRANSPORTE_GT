import type { ReactNode } from 'react'
import { FormModal } from '../../components/ui/FormModal'
import { Icon } from '../../components/ui/Icon'
import type { IconName } from '../../types'
import type { Ruta } from '../../types/tripTypes'
import { formatDateEs, formatQ } from '../../utils/format'

function DatoRuta({ icono, etiqueta, children }: { icono: IconName; etiqueta: string; children: ReactNode }) {
  return (
    <div className="driver-detail-item">
      <span className="driver-detail-label"><Icon name={icono} size={14} /> {etiqueta}</span>
      <strong>{children}</strong>
    </div>
  )
}

export function RutaDetalleModal({ ruta, origen, destino, onClose }: { ruta: Ruta; origen: string; destino: string; onClose: () => void }) {
  return (
    <FormModal
      eyebrow="Detalle del registro"
      title="Información de la ruta"
      actionLabel="Cerrar"
      onSubmit={onClose}
      onClose={onClose}
      hideFooter
    >
      <div className="route-detail-hero">
        <span className="route-detail-icon"><Icon name="route" size={22} /></span>
        <div>
          <h3>{origen} <span>→</span> {destino}</h3>
          <p>Ruta configurada entre sucursales</p>
        </div>
      </div>
      <div className="detail-grid driver-detail-grid">
        <DatoRuta icono="home" etiqueta="Origen"><span className="driver-chip info">{origen}</span></DatoRuta>
        <DatoRuta icono="route" etiqueta="Destino"><span className="driver-chip success">{destino}</span></DatoRuta>
        <DatoRuta icono="route" etiqueta="Distancia">{ruta.distanciaKm.toLocaleString('es-GT')} km</DatoRuta>
        <DatoRuta icono="wallet" etiqueta="Precio del boleto">{formatQ(ruta.precioBoleto)}</DatoRuta>
        <DatoRuta icono="calendar" etiqueta="Creada">{formatDateEs(ruta.creadoEn.slice(0, 10))}</DatoRuta>
        <DatoRuta icono="clock" etiqueta="Última actualización">{formatDateEs(ruta.actualizadoEn.slice(0, 10))}</DatoRuta>
      </div>
    </FormModal>
  )
}
