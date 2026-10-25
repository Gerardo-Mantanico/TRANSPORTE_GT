import { useState } from 'react'
import { useAuth } from '../../app/providers/useAuth'
import { AccionFila } from '../../components/ui/AccionFila'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Icon } from '../../components/ui/Icon'
import { Paginacion } from '../../components/ui/Paginacion'
import { useMisAlquileres } from '../../hooks/rentals'
import { ETIQUETAS_CANAL_ALQUILER, type Alquiler } from '../../types/rentalTypes'
import { formatFechaCorta, formatFechaHora, formatQ } from '../../utils/format'
import { DetalleAlquilerModal } from './DetalleAlquilerModal'
import { EstadoAlquilerBadge } from './EstadoAlquilerBadge'
import { PagoEnLineaModal } from './PagoAlquilerModal'

const TAMANO_PAGINA = 10

type ModalMisAlquileres = { tipo: 'pagar'; alquiler: Alquiler } | { tipo: 'detalle'; id: string }

/** Historial de alquileres del usuario: los suyos en línea y los de mostrador hechos con su NIT. */
export function MisAlquileres() {
  const { usuario } = useAuth()
  const [pagina, setPagina] = useState(0)
  const [modal, setModal] = useState<ModalMisAlquileres | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const alquileres = useMisAlquileres({ pagina, tamano: TAMANO_PAGINA })
  const datos = alquileres.datos

  const rows = (datos?.contenido ?? []).map((alquiler) => {
    const puedePagar = alquiler.estado === 'COTIZADO' && alquiler.canal === 'EN_LINEA' && alquiler.idUsuarioCliente === usuario?.id
    return [
      <div className="rental-table-date">
        <Icon name="calendar" size={14} />
        <strong>{formatFechaCorta(alquiler.creadoEn)}</strong>
        <small>Solicitud</small>
      </div>,
      <div className="rental-route-cell">
        <strong>
          {alquiler.origen} <span className="route-arrow">→</span> {alquiler.destino}
        </strong>
        <small className="cell-note">{ETIQUETAS_CANAL_ALQUILER[alquiler.canal]}</small>
      </div>,
      <div className="rental-table-date">
        <Icon name="clock" size={14} />
        <strong>{formatFechaHora(alquiler.fechaHoraSalida)}</strong>
        <small>{alquiler.idaYVuelta ? `Retorno ${formatFechaHora(alquiler.fechaHoraRetorno)}` : 'Solo ida'}</small>
      </div>,
      <span className="rental-passenger-chip"><Icon name="users" size={14} /> {alquiler.numeroPasajeros} pasajeros</span>,
      <div className="rental-table-amount">
        <strong>{formatQ(alquiler.precioFinal ?? alquiler.precioEstimado)}</strong>
        <small className="cell-note">{alquiler.precioFinal !== null ? 'Precio final' : 'Estimado'}</small>
      </div>,
      <EstadoAlquilerBadge estado={alquiler.estado} />,
      <div className="row-actions">
        {puedePagar && (
          <AccionFila icono="wallet" titulo="Pagar" onClick={() => setModal({ tipo: 'pagar', alquiler })} />
        )}
        <AccionFila icono="eye" titulo="Detalle" onClick={() => setModal({ tipo: 'detalle', id: alquiler.id })} />
      </div>,
    ]
  })

  return (
    <>
      {aviso && (
        <div className="success-note" role="status">
          <Icon name="check" />
          <span>{aviso}</span>
        </div>
      )}
      {alquileres.error ? (
        <AvisoError error={alquileres.error} onReintentar={alquileres.recargar} />
      ) : !datos && alquileres.cargando ? (
        <Cargando texto="Cargando sus alquileres..." />
      ) : rows.length ? (
        <DataTable headers={['Solicitud', 'Trayecto', 'Fechas', 'Pasajeros', 'Monto', 'Estado', 'Acciones']} rows={rows} />
      ) : (
        <div className="filter-empty">
          <span>
            <Icon name="route" />
          </span>
          <strong>Sin alquileres</strong>
          <p>Sus solicitudes en línea y las hechas en mostrador con su NIT aparecerán aquí.</p>
        </div>
      )}
      <Paginacion pagina={datos} deshabilitada={alquileres.cargando} onCambiar={setPagina} />
      {modal?.tipo === 'pagar' && (
        <PagoEnLineaModal
          alquiler={modal.alquiler}
          onClose={() => setModal(null)}
          onPagado={() => {
            setModal(null)
            setAviso('Alquiler pagado y confirmado. La sucursal asignará bus y chofer; recibirá la confirmación por correo.')
            alquileres.recargar()
          }}
        />
      )}
      {modal?.tipo === 'detalle' && <DetalleAlquilerModal id={modal.id} onClose={() => setModal(null)} />}
    </>
  )
}
