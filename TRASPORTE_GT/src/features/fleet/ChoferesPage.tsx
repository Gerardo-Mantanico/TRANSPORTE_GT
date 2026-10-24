import { useMemo, useState } from 'react'
import { useAuth } from '../../app/providers/useAuth'
import { Badge } from '../../components/ui/Badge'
import { AccionFila } from '../../components/ui/AccionFila'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { FilterToolbar } from '../../components/ui/FilterToolbar'
import { Icon } from '../../components/ui/Icon'
import { Paginacion } from '../../components/ui/Paginacion'
import { useCambiarActivoChofer, useChoferes } from '../../hooks/fleet'
import { useSucursales } from '../../hooks/identity'
import { useDiferido } from '../../hooks/useDiferido'
import type { Chofer, FiltroChoferes } from '../../types/fleetTypes'
import { formatDateEs, formatQ } from '../../utils/format'
import { ConfirmarEstadoModal } from '../identity/ConfirmarEstadoModal'
import { CrearChoferModal, EditarChoferModal } from './ChoferFormModal'
import { EstadoLicencia } from './EstadoLicencia'
import { FotoPrivada } from './FotoPrivada'

const TAMANO_PAGINA = 10

type ModalChoferes = { tipo: 'crear' } | { tipo: 'editar'; id: string } | { tipo: 'activo'; chofer: Chofer }

/** ADMIN_SUCURSAL gestiona los choferes de su sucursal; ADMIN_SISTEMA los consulta todos (solo lectura). */
export function ChoferesPage() {
  const { usuario } = useAuth()
  const puedeGestionar = usuario?.rol === 'ADMIN_SUCURSAL'
  const esSistema = usuario?.rol === 'ADMIN_SISTEMA'
  const [filtro, setFiltro] = useState<FiltroChoferes>({ page: 0, size: TAMANO_PAGINA, sort: 'nombreCompleto,asc' })
  const [texto, setTexto] = useState('')
  const textoDiferido = useDiferido(texto.trim())
  const choferes = useChoferes({ ...filtro, texto: textoDiferido || undefined })
  const sucursales = useSucursales({ size: 100, sort: 'nombre,asc' }, esSistema)
  const cambiarActivo = useCambiarActivoChofer()
  const [modal, setModal] = useState<ModalChoferes | null>(null)
  const [aviso, setAviso] = useState<{ mensaje: string; error?: boolean } | null>(null)
  const pagina = choferes.datos

  const nombresSucursal = useMemo(
    () => new Map((sucursales.datos?.contenido ?? []).map((sucursal) => [sucursal.id, sucursal.nombre])),
    [sucursales.datos],
  )

  const actualizarFiltro = (cambios: Partial<FiltroChoferes>) =>
    setFiltro((actual) => ({ ...actual, ...cambios, page: 0 }))

  const terminar = (mensaje: string, error = false) => {
    setModal(null)
    setAviso({ mensaje, error })
    choferes.recargar()
  }

  const confirmarActivo = async (chofer: Chofer) => {
    const resultado = await cambiarActivo.ejecutar({ id: chofer.id, activo: !chofer.activo, version: chofer.version })
    if (resultado.ok) terminar(`${chofer.nombreCompleto} quedó ${chofer.activo ? 'inactivo' : 'activo'}.`)
  }

  const headers = [
    'Chofer',
    'Licencia',
    'Vencimiento',
    'Teléfono',
    'Salario base',
    ...(esSistema ? ['Sucursal'] : []),
    'Acceso',
    'Estado',
    ...(puedeGestionar ? ['Acciones'] : []),
  ]

  const rows = (pagina?.contenido ?? []).map((chofer) => [
    <div className="person">
      <FotoPrivada ruta={chofer.fotoUrl} nombre={chofer.nombreCompleto} />
      <span>
        <strong>{chofer.nombreCompleto}</strong>
        <small className="cell-note">{chofer.correo}</small>
      </span>
    </div>,
    <>
      <strong>{chofer.numeroLicencia}</strong>
      <small className="cell-note">Tipo {chofer.tipoLicencia}</small>
    </>,
    <div className="cell-stack">
      <strong>{formatDateEs(chofer.fechaVencimientoLicencia)}</strong>
      <small className="cell-note">
        <EstadoLicencia fechaVencimiento={chofer.fechaVencimientoLicencia} />
      </small>
    </div>,
    chofer.telefono,
    formatQ(chofer.salarioBaseViaje),
    ...(esSistema ? [nombresSucursal.get(chofer.idSucursal) ?? '—'] : []),
    chofer.idUsuario ? 'Con usuario' : 'Sin usuario',
    <Badge tone={chofer.activo ? 'success' : 'neutral'}>{chofer.activo ? 'Activo' : 'Inactivo'}</Badge>,
    ...(puedeGestionar
      ? [
          <div className="row-actions">
            <AccionFila
              icono="edit"
              titulo="Editar"
              onClick={() => setModal({ tipo: 'editar', id: chofer.id })}
            />
            <AccionFila
              icono="power"
              titulo={chofer.activo ? 'Desactivar' : 'Activar'}
              onClick={() => {
                cambiarActivo.reiniciar()
                setModal({ tipo: 'activo', chofer })
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
          searchPlaceholder="Buscar por nombre, correo o licencia..."
          onSearch={(valor) => {
            setTexto(valor)
            actualizarFiltro({})
          }}
          action={puedeGestionar ? 'Registrar chofer' : undefined}
          onAction={puedeGestionar ? () => setModal({ tipo: 'crear' }) : undefined}
        >
          <label className="field">
            <span className="field-label">
              <span>Estado</span>
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
        {choferes.error ? (
          <AvisoError error={choferes.error} onReintentar={choferes.recargar} />
        ) : !pagina && choferes.cargando ? (
          <Cargando texto="Cargando choferes..." />
        ) : rows.length ? (
          <DataTable headers={headers} rows={rows} />
        ) : (
          <div className="filter-empty">
            <span>
              <Icon name="users" />
            </span>
            <strong>No encontramos choferes</strong>
            <p>Pruebe con otro término o restablezca los filtros.</p>
          </div>
        )}
        <Paginacion
          pagina={pagina}
          deshabilitada={choferes.cargando}
          onCambiar={(page) => setFiltro((actual) => ({ ...actual, page }))}
        />
      </section>
      {modal?.tipo === 'crear' && <CrearChoferModal onClose={() => setModal(null)} onGuardado={terminar} />}
      {modal?.tipo === 'editar' && (
        <EditarChoferModal id={modal.id} onClose={() => setModal(null)} onGuardado={terminar} />
      )}
      {modal?.tipo === 'activo' && (
        <ConfirmarEstadoModal
          recurso="chofer"
          nombre={modal.chofer.nombreCompleto}
          activar={!modal.chofer.activo}
          nota="Los choferes no se eliminan; solo se desactivan. Un chofer inactivo no puede asignarse a viajes."
          cargando={cambiarActivo.cargando}
          error={cambiarActivo.error}
          onConfirmar={() => confirmarActivo(modal.chofer)}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
