import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Icon } from '../../components/ui/Icon'
import { Avatar, InfoNote } from '../../components/ui/Misc'
import { useAdministradoresSucursal } from '../../hooks/identity'
import type { Sucursal } from '../../types/identityTypes'

export function AdministradoresModal({ sucursal, onClose }: { sucursal: Sucursal; onClose: () => void }) {
  const { datos, cargando, error, recargar } = useAdministradoresSucursal(sucursal.id)

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section className="modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span className="eyebrow">Sucursal · {sucursal.nombre}</span>
            <h2>Administradores</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">
          {cargando && <Cargando />}
          <AvisoError error={error} onReintentar={recargar} />
          {datos?.length === 0 && (
            <div className="empty-inline">
              <Icon name="users" />
              <div>
                <strong>Sin administradores</strong>
                <p>Agregue uno desde el módulo de usuarios.</p>
              </div>
            </div>
          )}
          {datos?.map((admin) => (
            <div className="person-card" key={admin.id}>
              <Avatar name={admin.nombreCompleto} small />
              <div>
                <strong>{admin.nombreCompleto}</strong>
                <small>{admin.correo}</small>
              </div>
              <Badge tone={admin.activo ? (admin.activacionPendiente ? 'warning' : 'success') : 'neutral'}>
                {admin.activo ? (admin.activacionPendiente ? 'Activación pendiente' : 'Activo') : 'Inactivo'}
              </Badge>
            </div>
          ))}
          <InfoNote>Cada sucursal debe mantener al menos un administrador activo.</InfoNote>
        </div>
        <footer>
          <Button onClick={onClose}>Cerrar</Button>
        </footer>
      </section>
    </div>
  )
}
