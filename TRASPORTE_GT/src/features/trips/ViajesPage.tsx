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
import { useRutas, useViajes } from '../../hooks/trips'
import type { IconName } from '../../types'
import {
  ESTADOS_VIAJE,
  ETIQUETAS_ESTADO_VIAJE,
  ETIQUETAS_TIPO_VIAJE,
  type EstadoViaje,
  type FiltroListadoViajes,
  type TipoViaje,
  type Viaje,
} from '../../types/tripTypes'
import { cellText } from '../../utils/cellText'
import { finDiaGuatemala, inicioDiaGuatemala } from '../../utils/fechaHora'
import { formatFechaHora, formatHora } from '../../utils/format'
import { DetalleViajeModal, EliminarViajeModal } from './DetalleViajeModal'
import { EstadoViajeBadge } from './EstadoViajeBadge'
import { LlegadaModal, SalidaModal } from './RegistrosModal'
import { AsignacionModal, CrearViajeModal, EditarViajeModal } from './ViajeFormModal'

const TAMANO_PAGINA = 10

type ModalViajes =
  | { tipo: 'crear' }
  | { tipo: 'editar'; id: string }
  | { tipo: 'asignar' | 'salida' | 'llegada' | 'eliminar'; viaje: Viaje }
  | { tipo: 'detalle'; id: string }

interface FiltroPantalla {
  estado?: EstadoViaje
  tipoViaje?: TipoViaje
  idSucursal?: string
  desde: string
  hasta: string
  sinAsignar: boolean
}

/**
 * Viajes de la sucursal. ADMIN_SUCURSAL programa y gestiona; CHOFER ve los suyos y registra salida y llegada;
 * CAJERO y ADMIN_SISTEMA (todas las sucursales) solo consultan.
 */
export function ViajesPage() {
  const { usuario } = useAuth()
  const rol = usuario?.rol
  const esAdminSucursal = rol === 'ADMIN_SUCURSAL'
  const esChofer = rol === 'CHOFER'
  const esSistema = rol === 'ADMIN_SISTEMA'
  const [filtro, setFiltro] = useState<FiltroPantalla>({ desde: '', hasta: '', sinAsignar: false })
  const [pagina, setPagina] = useState(0)
  const [texto, setTexto] = useState('')
  const [modal, setModal] = useState<ModalViajes | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const filtroApi: FiltroListadoViajes = {
    estado: filtro.sinAsignar ? undefined : filtro.estado,
    tipoViaje: filtro.tipoViaje,
    idSucursal: filtro.idSucursal,
    desde: filtro.desde ? inicioDiaGuatemala(filtro.desde) : undefined,
    hasta: filtro.hasta ? finDiaGuatemala(filtro.hasta) : undefined,
    sinAsignar: filtro.sinAsignar || undefined,
    pagina,
    tamano: TAMANO_PAGINA,
  }
  const viajes = useViajes(filtroApi)
  const sucursales = useSucursales({ size: 100, sort: 'nombre,asc' }, esSistema || esAdminSucursal)
  const rutas = useRutas({ idSucursalOrigen: usuario?.idSucursal ?? undefined }, esAdminSucursal)

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
    viajes.recargar()
  }

  const acciones = (viaje: Viaje) => {
    const botones: { etiqueta: string; icono: IconName; abrir: () => void; peligro?: boolean }[] = []
    if (esAdminSucursal || esChofer) {
      if (viaje.estado === 'PROGRAMADO')
        botones.push({ etiqueta: 'Registrar salida', icono: 'arrow', abrir: () => setModal({ tipo: 'salida', viaje }) })
      if (viaje.estado === 'EN_TRANSITO')
        botones.push({ etiqueta: 'Registrar llegada', icono: 'check', abrir: () => setModal({ tipo: 'llegada', viaje }) })
    }
    if (esAdminSucursal) {
      if (viaje.estado === 'PENDIENTE_ASIGNACION')
        botones.push({ etiqueta: 'Asignar bus y chofer', icono: 'bus', abrir: () => setModal({ tipo: 'asignar', viaje }) })
      if (viaje.estado === 'PROGRAMADO')
        botones.push({ etiqueta: 'Editar', icono: 'edit', abrir: () => setModal({ tipo: 'editar', id: viaje.id }) })
      if (viaje.estado === 'PROGRAMADO' || viaje.estado === 'PENDIENTE_ASIGNACION')
        botones.push({
          etiqueta: 'Eliminar',
          icono: 'trash',
          peligro: true,
          abrir: () => setModal({ tipo: 'eliminar', viaje }),
        })
    }
    botones.push({ etiqueta: 'Detalle', icono: 'eye', abrir: () => setModal({ tipo: 'detalle', id: viaje.id }) })
    return (
      <div className="row-actions">
        {botones.map((boton) => (
          <AccionFila
            key={boton.etiqueta}
            icono={boton.icono}
            titulo={boton.etiqueta}
            variante={boton.peligro ? 'danger' : 'ghost'}
            onClick={boton.abrir}
          />
        ))}
      </div>
    )
  }

  const headers = ['Viaje', 'Tipo', 'Salida', 'Bus / Chofer', ...(esSistema ? ['Sucursal'] : []), 'Estado', 'Acciones']
  const paginaActual = viajes.datos
  const todas = (paginaActual?.contenido ?? []).map((viaje) => [
    <>
      <strong>
        {viaje.nombreOrigen} <span className="route-arrow">→</span> {viaje.nombreDestino}
      </strong>
      <small className="cell-note">Llegada estimada {formatHora(viaje.fechaHoraLlegadaEstimada)}</small>
    </>,
    ETIQUETAS_TIPO_VIAJE[viaje.tipoViaje],
    formatFechaHora(viaje.fechaHoraSalida),
    <>
      <strong>{viaje.bus?.placa ?? 'Sin bus'}</strong>
      <small className="cell-note">{viaje.chofer?.nombreCompleto ?? 'Sin chofer'}</small>
    </>,
    ...(esSistema ? [nombres.get(viaje.idSucursalOrigen) ?? '—'] : []),
    <EstadoViajeBadge estado={viaje.estado} />,
    acciones(viaje),
  ])
  // La búsqueda de texto es local a la página; los filtros y la paginación los resuelve el servidor
  const busqueda = texto.trim().toLocaleLowerCase('es')
  const filtradas = busqueda ? todas.filter((row) => cellText(row).toLocaleLowerCase('es').includes(busqueda)) : todas

  return (
    <>
      <section className="surface list-surface">
        <FilterToolbar
          searchPlaceholder="Buscar en esta página por ruta, bus o chofer..."
          onSearch={setTexto}
          action={esAdminSucursal ? 'Programar viaje' : undefined}
          onAction={esAdminSucursal ? () => setModal({ tipo: 'crear' }) : undefined}
        >
          <label className="field">
            <span className="field-label">
              <span>Estado</span>
            </span>
            <select
              value={filtro.estado ?? ''}
              disabled={filtro.sinAsignar}
              onChange={(event) => cambiarFiltro({ estado: (event.target.value || undefined) as EstadoViaje | undefined })}
            >
              <option value="">Todos los estados</option>
              {ESTADOS_VIAJE.map((estado) => (
                <option key={estado} value={estado}>
                  {ETIQUETAS_ESTADO_VIAJE[estado]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">
              <span>Tipo</span>
            </span>
            <select
              value={filtro.tipoViaje ?? ''}
              onChange={(event) => cambiarFiltro({ tipoViaje: (event.target.value || undefined) as TipoViaje | undefined })}
            >
              <option value="">Todos los tipos</option>
              <option value="REGULAR">Regular</option>
              <option value="ALQUILER_PRIVADO">Alquiler privado</option>
            </select>
          </label>
          <Field label="Salida desde" type="date" value={filtro.desde} onChange={(event) => cambiarFiltro({ desde: event.target.value })} />
          <Field label="Salida hasta" type="date" value={filtro.hasta} onChange={(event) => cambiarFiltro({ hasta: event.target.value })} />
          {esSistema && (
            <label className="field">
              <span className="field-label">
                <span>Sucursal</span>
              </span>
              <select
                value={filtro.idSucursal ?? ''}
                onChange={(event) => cambiarFiltro({ idSucursal: event.target.value || undefined })}
              >
                <option value="">Todas las sucursales</option>
                {(sucursales.datos?.contenido ?? []).map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}
          {esAdminSucursal && (
            <label className="check-row">
              <input
                type="checkbox"
                checked={filtro.sinAsignar}
                onChange={(event) => cambiarFiltro({ sinAsignar: event.target.checked })}
              />
              <span>
                <strong>Pendientes de asignación</strong>
                <small>Alquileres confirmados sin bus ni chofer.</small>
              </span>
            </label>
          )}
        </FilterToolbar>
        {aviso && (
          <div className="success-note" role="status">
            <Icon name="check" />
            <span>{aviso}</span>
          </div>
        )}
        {filtro.desde && filtro.hasta && filtro.desde > filtro.hasta ? (
          <div className="empty-inline">
            <Icon name="calendar" />
            <div>
              <strong>Rango de fechas inválido</strong>
              <p>La fecha inicial no puede ser posterior a la final.</p>
            </div>
          </div>
        ) : viajes.error ? (
          <AvisoError error={viajes.error} onReintentar={viajes.recargar} />
        ) : !paginaActual && viajes.cargando ? (
          <Cargando texto="Cargando viajes..." />
        ) : filtradas.length ? (
          <DataTable headers={headers} rows={filtradas} />
        ) : (
          <div className="filter-empty">
            <span>
              <Icon name="route" />
            </span>
            <strong>{esChofer ? 'No tiene viajes asignados' : 'No hay viajes'}</strong>
            <p>Pruebe con otros filtros{esAdminSucursal ? ' o programe un viaje nuevo' : ''}.</p>
          </div>
        )}
        <Paginacion pagina={paginaActual} deshabilitada={viajes.cargando} onCambiar={setPagina} />
      </section>
      {modal?.tipo === 'crear' && (
        <CrearViajeModal
          rutas={rutas.datos ?? []}
          nombreSucursal={(id) => nombres.get(id) ?? '—'}
          onClose={() => setModal(null)}
          onGuardado={(viaje) => terminar(`Viaje ${viaje.nombreOrigen} → ${viaje.nombreDestino} programado.`)}
        />
      )}
      {modal?.tipo === 'editar' && (
        <EditarViajeModal
          id={modal.id}
          rutas={rutas.datos ?? []}
          nombreSucursal={(id) => nombres.get(id) ?? '—'}
          onClose={() => setModal(null)}
          onGuardado={() => terminar('El viaje se actualizó.')}
        />
      )}
      {modal?.tipo === 'asignar' && (
        <AsignacionModal
          viaje={modal.viaje}
          onClose={() => setModal(null)}
          onGuardado={(viaje) => terminar(`Bus ${viaje.bus?.placa ?? ''} y chofer asignados; el viaje quedó programado.`)}
        />
      )}
      {modal?.tipo === 'salida' && (
        <SalidaModal
          viaje={modal.viaje}
          onClose={() => setModal(null)}
          onGuardado={() => terminar('Salida registrada. El viaje está en tránsito.')}
        />
      )}
      {modal?.tipo === 'llegada' && (
        <LlegadaModal
          viaje={modal.viaje}
          onClose={() => setModal(null)}
          onGuardado={() => terminar('Llegada registrada. El viaje quedó finalizado.')}
        />
      )}
      {modal?.tipo === 'eliminar' && (
        <EliminarViajeModal
          viaje={modal.viaje}
          onClose={() => setModal(null)}
          onEliminado={() => terminar('El viaje se eliminó; los boletos y el alquiler se anulan automáticamente.')}
        />
      )}
      {modal?.tipo === 'detalle' && <DetalleViajeModal id={modal.id} onClose={() => setModal(null)} />}
    </>
  )
}
