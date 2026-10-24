import { useMemo, useState } from 'react'
import { useAuth } from '../../app/providers/useAuth'
import { Badge } from '../../components/ui/Badge'
import { AccionFila } from '../../components/ui/AccionFila'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { FilterToolbar } from '../../components/ui/FilterToolbar'
import { Icon } from '../../components/ui/Icon'
import { Paginacion } from '../../components/ui/Paginacion'
import { useBuses, useCambiarActivoBus } from '../../hooks/fleet'
import { useSucursales } from '../../hooks/identity'
import { useDiferido } from '../../hooks/useDiferido'
import type { BadgeTone } from '../../types'
import {
  ESTADOS_OPERATIVOS,
  ETIQUETAS_ESTADO_OPERATIVO,
  type Bus,
  type EstadoOperativo,
  type FiltroBuses,
} from '../../types/fleetTypes'
import { ConfirmarEstadoModal } from '../identity/ConfirmarEstadoModal'
import { CrearBusModal, EditarBusModal } from './BusFormModal'
import { EstadoOperativoModal } from './EstadoOperativoModal'
import { FotoPrivada } from './FotoPrivada'

const TAMANO_PAGINA = 10

const TONOS: Record<EstadoOperativo, BadgeTone> = {
  DISPONIBLE: 'success',
  EN_TRANSITO: 'info',
  EN_TALLER: 'warning',
  FUERA_DE_SERVICIO: 'danger',
}

type ModalBuses =
  | { tipo: 'crear' }
  | { tipo: 'editar'; id: string }
  | { tipo: 'estado'; bus: Bus }
  | { tipo: 'activo'; bus: Bus }

/** ADMIN_SUCURSAL gestiona los buses de su sucursal; ADMIN_SISTEMA los consulta todos (solo lectura). */
export function BusesPage() {
  const { usuario } = useAuth()
  const puedeGestionar = usuario?.rol === 'ADMIN_SUCURSAL'
  const esSistema = usuario?.rol === 'ADMIN_SISTEMA'
  const [filtro, setFiltro] = useState<FiltroBuses>({ page: 0, size: TAMANO_PAGINA, sort: 'placa,asc' })
  const [texto, setTexto] = useState('')
  const textoDiferido = useDiferido(texto.trim())
  const buses = useBuses({ ...filtro, texto: textoDiferido || undefined })
  const sucursales = useSucursales({ size: 100, sort: 'nombre,asc' }, esSistema)
  const cambiarActivo = useCambiarActivoBus()
  const [modal, setModal] = useState<ModalBuses | null>(null)
  const [aviso, setAviso] = useState<{ mensaje: string; error?: boolean } | null>(null)
  const pagina = buses.datos

  const nombresSucursal = useMemo(
    () => new Map((sucursales.datos?.contenido ?? []).map((sucursal) => [sucursal.id, sucursal.nombre])),
    [sucursales.datos],
  )

  const actualizarFiltro = (cambios: Partial<FiltroBuses>) =>
    setFiltro((actual) => ({ ...actual, ...cambios, page: 0 }))

  const terminar = (mensaje: string, error = false) => {
    setModal(null)
    setAviso({ mensaje, error })
    buses.recargar()
  }

  const confirmarActivo = async (bus: Bus) => {
    const resultado = await cambiarActivo.ejecutar({ id: bus.id, activo: !bus.activo, version: bus.version })
    if (resultado.ok) terminar(`El bus ${bus.placa} quedó ${bus.activo ? 'inactivo' : 'activo'}.`)
  }

  const headers = [
    'Bus',
    'Capacidad',
    'Kilometraje',
    ...(esSistema ? ['Sucursal'] : []),
    'Estado operativo',
    'Estado',
    ...(puedeGestionar ? ['Acciones'] : []),
  ]

  const rows = (pagina?.contenido ?? []).map((bus) => [
    <div className="person">
      <FotoPrivada ruta={bus.fotoUrl} nombre={bus.placa} />
      <span>
        <strong>{bus.placa}</strong>
        <small className="cell-note">
          {bus.marca} {bus.modelo} · {bus.anioFabricacion}
        </small>
      </span>
    </div>,
    `${bus.capacidadPasajeros} pas.`,
    `${bus.kilometrajeActual.toLocaleString('es-GT')} km`,
    ...(esSistema ? [nombresSucursal.get(bus.idSucursal) ?? '—'] : []),
    <Badge tone={TONOS[bus.estadoOperativo]}>{ETIQUETAS_ESTADO_OPERATIVO[bus.estadoOperativo]}</Badge>,
    <Badge tone={bus.activo ? 'success' : 'neutral'}>{bus.activo ? 'Activo' : 'Inactivo'}</Badge>,
    ...(puedeGestionar
      ? [
          <div className="row-actions">
            <AccionFila icono="edit" titulo="Editar" onClick={() => setModal({ tipo: 'editar', id: bus.id })} />
            <AccionFila
              icono="settings"
              titulo={
                bus.estadoOperativo === 'EN_TRANSITO'
                  ? 'Estado · cambia al registrar la llegada del viaje'
                  : 'Estado operativo'
              }
              disabled={bus.estadoOperativo === 'EN_TRANSITO' || !bus.activo}
              onClick={() => setModal({ tipo: 'estado', bus })}
            />
            <AccionFila
              icono="power"
              titulo={bus.activo ? 'Desactivar' : 'Activar'}
              onClick={() => {
                cambiarActivo.reiniciar()
                setModal({ tipo: 'activo', bus })
              }}
            />
          </div>,
        ]
      : []),
  ])

  return (
    <>
      <section className="surface list-surface">
        <FilterToolbar
          searchPlaceholder="Buscar por placa, marca o modelo..."
          onSearch={(valor) => {
            setTexto(valor)
            actualizarFiltro({})
          }}
          action={puedeGestionar ? 'Registrar bus' : undefined}
          onAction={puedeGestionar ? () => setModal({ tipo: 'crear' }) : undefined}
        >
          <label className="field">
            <span className="field-label">
              <span>Estado operativo</span>
            </span>
            <select
              value={filtro.estadoOperativo ?? ''}
              onChange={(event) =>
                actualizarFiltro({ estadoOperativo: (event.target.value || undefined) as EstadoOperativo | undefined })
              }
            >
              <option value="">Todos los estados</option>
              {ESTADOS_OPERATIVOS.map((estado) => (
                <option key={estado} value={estado}>
                  {ETIQUETAS_ESTADO_OPERATIVO[estado]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">
              <span>Activos</span>
            </span>
            <select
              value={filtro.activo === undefined ? '' : String(filtro.activo)}
              onChange={(event) =>
                actualizarFiltro({ activo: event.target.value === '' ? undefined : event.target.value === 'true' })
              }
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </label>
          {esSistema && (
            <label className="field">
              <span className="field-label">
                <span>Sucursal</span>
              </span>
              <select
                value={filtro.idSucursal ?? ''}
                onChange={(event) => actualizarFiltro({ idSucursal: event.target.value || undefined })}
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
        </FilterToolbar>
        {aviso && (
          <div className={aviso.error ? 'persistent-note' : 'success-note'} role="status">
            <Icon name="check" />
            <span>{aviso.mensaje}</span>
          </div>
        )}
        {buses.error ? (
          <AvisoError error={buses.error} onReintentar={buses.recargar} />
        ) : !pagina && buses.cargando ? (
          <Cargando texto="Cargando buses..." />
        ) : rows.length ? (
          <DataTable headers={headers} rows={rows} />
        ) : (
          <div className="filter-empty">
            <span>
              <Icon name="bus" />
            </span>
            <strong>No encontramos buses</strong>
            <p>Pruebe con otro término o restablezca los filtros.</p>
          </div>
        )}
        <Paginacion
          pagina={pagina}
          deshabilitada={buses.cargando}
          onCambiar={(page) => setFiltro((actual) => ({ ...actual, page }))}
        />
      </section>
      {modal?.tipo === 'crear' && <CrearBusModal onClose={() => setModal(null)} onGuardado={terminar} />}
      {modal?.tipo === 'editar' && <EditarBusModal id={modal.id} onClose={() => setModal(null)} onGuardado={terminar} />}
      {modal?.tipo === 'estado' && (
        <EstadoOperativoModal
          bus={modal.bus}
          onClose={() => setModal(null)}
          onGuardado={(bus) =>
            terminar(`El bus ${bus.placa} quedó ${ETIQUETAS_ESTADO_OPERATIVO[bus.estadoOperativo].toLowerCase()}.`)
          }
        />
      )}
      {modal?.tipo === 'activo' && (
        <ConfirmarEstadoModal
          recurso="bus"
          nombre={modal.bus.placa}
          activar={!modal.bus.activo}
          nota="Para desactivarlo no debe tener viajes programados ni en tránsito. Los datos históricos se conservan."
          cargando={cambiarActivo.cargando}
          error={cambiarActivo.error}
          onConfirmar={() => confirmarActivo(modal.bus)}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
