import { useMemo, useState } from 'react'
import { useAuth } from '../../app/providers/useAuth'
import { AccionFila } from '../../components/ui/AccionFila'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FilterToolbar } from '../../components/ui/FilterToolbar'
import { Icon } from '../../components/ui/Icon'
import { Paginacion } from '../../components/ui/Paginacion'
import { useSucursales } from '../../hooks/identity'
import { useAlquileres } from '../../hooks/rentals'
import type { IconName } from '../../types'
import {
  ESTADOS_ALQUILER,
  ETIQUETAS_CANAL_ALQUILER,
  ETIQUETAS_ESTADO_ALQUILER,
  type Alquiler,
  type EstadoAlquiler,
  type FiltroAlquileres,
} from '../../types/rentalTypes'
import { cellText } from '../../utils/cellText'
import { formatFechaHora, formatQ } from '../../utils/format'
import { AsignarAlquilerModal } from './AsignarAlquilerModal'
import { CotizarModal } from './CotizarModal'
import { DetalleAlquilerModal } from './DetalleAlquilerModal'
import { EstadoAlquilerBadge } from './EstadoAlquilerBadge'
import { MostradorModal } from './MostradorModal'
import { CobrarMostradorModal } from './PagoAlquilerModal'

const TAMANO_PAGINA = 10

type ModalAlquileres =
  | { tipo: 'mostrador' }
  | { tipo: 'cotizar' | 'cobrar' | 'asignar'; alquiler: Alquiler }
  | { tipo: 'detalle'; id: string }

interface FiltroPantalla {
  estado?: EstadoAlquiler
  desde: string
  hasta: string
  sinAsignar: boolean
}

/**
 * Alquileres de la sucursal. ADMIN_SUCURSAL cotiza, registra y cobra en mostrador y asigna bus y chofer (en Viajes);
 * CAJERO registra y cobra en mostrador; ADMIN_SISTEMA consulta todas las sucursales.
 */
export function AlquileresPage() {
  const { usuario } = useAuth()
  const rol = usuario?.rol
  const esAdminSucursal = rol === 'ADMIN_SUCURSAL'
  const esMostrador = esAdminSucursal || rol === 'CAJERO'
  const esSistema = rol === 'ADMIN_SISTEMA'
  const [filtro, setFiltro] = useState<FiltroPantalla>({ desde: '', hasta: '', sinAsignar: false })
  const [pagina, setPagina] = useState(0)
  const [texto, setTexto] = useState('')
  const [modal, setModal] = useState<ModalAlquileres | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const filtroApi: FiltroAlquileres = {
    estado: filtro.sinAsignar ? undefined : filtro.estado,
    desde: filtro.desde || undefined,
    hasta: filtro.hasta || undefined,
    sinAsignar: filtro.sinAsignar || undefined,
    pagina,
    tamano: TAMANO_PAGINA,
  }
  const rangoInvalido = Boolean(filtro.desde && filtro.hasta && filtro.desde > filtro.hasta)
  const alquileres = useAlquileres(filtroApi)
  const sucursales = useSucursales({ size: 100, sort: 'nombre,asc' }, esSistema)
  const nombres = useMemo(
    () => new Map((sucursales.datos?.contenido ?? []).map((sucursal) => [sucursal.id, sucursal.nombre])),
    [sucursales.datos],
  )

  const cambiarFiltro = (cambios: Partial<FiltroPantalla>) => {
    setFiltro((actual) => ({ ...actual, ...cambios }))
    setPagina(0)
  }

  const terminar = (mensaje: string) => {
    setModal(null)
    setAviso(mensaje)
    alquileres.recargar()
  }

  const acciones = (alquiler: Alquiler) => {
    const botones: { etiqueta: string; icono: IconName; abrir: () => void }[] = []
    if (esAdminSucursal && (alquiler.estado === 'SOLICITADO' || alquiler.estado === 'COTIZADO'))
      botones.push({
        etiqueta: alquiler.estado === 'SOLICITADO' ? 'Cotizar' : 'Reajustar',
        icono: alquiler.estado === 'SOLICITADO' ? 'chart' : 'sync',
        abrir: () => setModal({ tipo: 'cotizar', alquiler }),
      })
    if (esMostrador && alquiler.canal === 'MOSTRADOR' && alquiler.estado === 'COTIZADO')
      botones.push({ etiqueta: 'Cobrar', icono: 'wallet', abrir: () => setModal({ tipo: 'cobrar', alquiler }) })
    if (esAdminSucursal && alquiler.estado === 'CONFIRMADO' && !alquiler.idBus)
      botones.push({ etiqueta: 'Asignar bus y chofer', icono: 'bus', abrir: () => setModal({ tipo: 'asignar', alquiler }) })
    botones.push({ etiqueta: 'Detalle', icono: 'eye', abrir: () => setModal({ tipo: 'detalle', id: alquiler.id }) })
    return (
      <div className="row-actions">
        {botones.map((boton) => (
          <AccionFila key={boton.etiqueta} icono={boton.icono} titulo={boton.etiqueta} onClick={boton.abrir} />
        ))}
      </div>
    )
  }

  const headers = ['Cliente / Trayecto', 'Salida', 'Pasajeros', 'Precio', 'Asignación', ...(esSistema ? ['Sucursal'] : []), 'Estado', 'Acciones']
  const datos = alquileres.datos
  const todas = (datos?.contenido ?? []).map((alquiler) => [
    <>
      <strong>{alquiler.nombreCliente}</strong>
      <small className="cell-note">
        {alquiler.origen} → {alquiler.destino} · {ETIQUETAS_CANAL_ALQUILER[alquiler.canal]}
      </small>
    </>,
    <>
      {formatFechaHora(alquiler.fechaHoraSalida)}
      {alquiler.idaYVuelta && <small className="cell-note">Retorno {formatFechaHora(alquiler.fechaHoraRetorno)}</small>}
    </>,
    String(alquiler.numeroPasajeros),
    <>
      <strong>{formatQ(alquiler.precioFinal ?? alquiler.precioEstimado)}</strong>
      <small className="cell-note">{alquiler.precioFinal !== null ? 'Final' : 'Estimado'}</small>
    </>,
    <>
      <strong>{alquiler.placaBus ?? 'Sin bus'}</strong>
      <small className="cell-note">{alquiler.nombreChofer ?? 'Sin chofer'}</small>
    </>,
    ...(esSistema ? [nombres.get(alquiler.idSucursalOrigen) ?? '—'] : []),
    <EstadoAlquilerBadge estado={alquiler.estado} />,
    acciones(alquiler),
  ])
  // La búsqueda de texto es local a la página; los filtros y la paginación los resuelve el servidor
  const busqueda = texto.trim().toLocaleLowerCase('es')
  const filtradas = busqueda ? todas.filter((row) => cellText(row).toLocaleLowerCase('es').includes(busqueda)) : todas

  return (
    <>
      <section className="surface list-surface">
        <FilterToolbar
          searchPlaceholder="Buscar en esta página por cliente o trayecto..."
          onSearch={setTexto}
          action={esMostrador ? 'Nueva solicitud' : undefined}
          onAction={esMostrador ? () => setModal({ tipo: 'mostrador' }) : undefined}
        >
          <label className="field">
            <span className="field-label">
              <span>Estado</span>
            </span>
            <select
              value={filtro.estado ?? ''}
              disabled={filtro.sinAsignar}
              onChange={(event) => cambiarFiltro({ estado: (event.target.value || undefined) as EstadoAlquiler | undefined })}
            >
              <option value="">Todos los estados</option>
              {ESTADOS_ALQUILER.map((estado) => (
                <option key={estado} value={estado}>
                  {ETIQUETAS_ESTADO_ALQUILER[estado]}
                </option>
              ))}
            </select>
          </label>
          <Field label="Salida desde" type="date" value={filtro.desde} onChange={(event) => cambiarFiltro({ desde: event.target.value })} />
          <Field label="Salida hasta" type="date" value={filtro.hasta} onChange={(event) => cambiarFiltro({ hasta: event.target.value })} />
          <label className="check-row">
            <input type="checkbox" checked={filtro.sinAsignar} onChange={(event) => cambiarFiltro({ sinAsignar: event.target.checked })} />
            <span>
              <strong>Por asignar</strong>
              <small>Confirmados que aún no tienen bus.</small>
            </span>
          </label>
        </FilterToolbar>
        {aviso && (
          <div className="success-note" role="status">
            <Icon name="check" />
            <span>{aviso}</span>
          </div>
        )}
        {rangoInvalido ? (
          <div className="empty-inline">
            <Icon name="calendar" />
            <div>
              <strong>Rango de fechas inválido</strong>
              <p>La fecha inicial no puede ser posterior a la final.</p>
            </div>
          </div>
        ) : alquileres.error ? (
          <AvisoError error={alquileres.error} onReintentar={alquileres.recargar} />
        ) : !datos && alquileres.cargando ? (
          <Cargando texto="Cargando alquileres..." />
        ) : filtradas.length ? (
          <DataTable headers={headers} rows={filtradas} />
        ) : (
          <div className="filter-empty">
            <span>
              <Icon name="calendar" />
            </span>
            <strong>No hay alquileres</strong>
            <p>Pruebe con otros filtros{esMostrador ? ' o registre una solicitud en mostrador' : ''}.</p>
          </div>
        )}
        <Paginacion pagina={datos} deshabilitada={alquileres.cargando} onCambiar={setPagina} />
      </section>
      {modal?.tipo === 'mostrador' && (
        <MostradorModal
          onClose={() => setModal(null)}
          onRegistrado={(alquiler) =>
            terminar(`Solicitud de ${alquiler.nombreCliente} registrada con un estimado de ${formatQ(alquiler.precioEstimado)}.`)
          }
        />
      )}
      {modal?.tipo === 'cotizar' && (
        <CotizarModal
          alquiler={modal.alquiler}
          onClose={() => setModal(null)}
          onCotizado={(alquiler) => terminar(`Alquiler cotizado en ${formatQ(alquiler.precioFinal ?? 0)}; el cliente ya puede pagarlo.`)}
        />
      )}
      {modal?.tipo === 'cobrar' && (
        <CobrarMostradorModal
          alquiler={modal.alquiler}
          onClose={() => setModal(null)}
          onPagado={() => terminar('Pago registrado. El alquiler quedó confirmado.')}
        />
      )}
      {modal?.tipo === 'asignar' && (
        <AsignarAlquilerModal
          alquiler={modal.alquiler}
          onClose={() => setModal(null)}
          onAsignado={(viaje) =>
            terminar(`Bus ${viaje.bus?.placa ?? ''} y chofer asignados. El alquiler se actualiza en unos segundos.`)
          }
        />
      )}
      {modal?.tipo === 'detalle' && <DetalleAlquilerModal id={modal.id} onClose={() => setModal(null)} />}
    </>
  )
}
