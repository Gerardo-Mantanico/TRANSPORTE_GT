import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { FilterToolbar } from '../../components/ui/FilterToolbar'
import { Icon } from '../../components/ui/Icon'
import { Paginacion } from '../../components/ui/Paginacion'
import { useCambiarEstadoSucursal, useSucursales } from '../../hooks/identity'
import { useDiferido } from '../../hooks/useDiferido'
import type { FiltroSucursales, Sucursal } from '../../types/identityTypes'
import { AdministradoresModal } from './AdministradoresModal'
import { ConfirmarEstadoModal } from './ConfirmarEstadoModal'
import { CrearSucursalModal, EditarSucursalModal } from './SucursalFormModal'

const TAMANO_PAGINA = 10

type ModalSucursales =
  | { tipo: 'crear' }
  | { tipo: 'editar'; id: string }
  | { tipo: 'estado'; sucursal: Sucursal }
  | { tipo: 'administradores'; sucursal: Sucursal }

export function SucursalesPage() {
  const [filtro, setFiltro] = useState<FiltroSucursales>({ page: 0, size: TAMANO_PAGINA, sort: 'nombre,asc' })
  const [nombre, setNombre] = useState('')
  const nombreDiferido = useDiferido(nombre.trim())
  const sucursales = useSucursales({ ...filtro, nombre: nombreDiferido || undefined })
  const cambiarEstado = useCambiarEstadoSucursal()
  const [modal, setModal] = useState<ModalSucursales | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const pagina = sucursales.datos

  const actualizarFiltro = (cambios: Partial<FiltroSucursales>) =>
    setFiltro((actual) => ({ ...actual, ...cambios, page: 0 }))

  const terminar = (mensaje: string) => {
    setModal(null)
    setAviso(mensaje)
    sucursales.recargar()
  }

  const confirmarEstado = async (sucursal: Sucursal) => {
    const resultado = await cambiarEstado.ejecutar({ id: sucursal.id, activa: !sucursal.activa })
    if (resultado.ok) terminar(`La sucursal ${sucursal.nombre} quedó ${sucursal.activa ? 'inactiva' : 'activa'}.`)
  }

  const rows = (pagina?.contenido ?? []).map((sucursal) => [
    <>
      <strong>{sucursal.nombre}</strong>
      <small className="cell-note">{sucursal.direccion}</small>
    </>,
    sucursal.departamento,
    sucursal.telefono || '—',
    `${sucursal.latitud}, ${sucursal.longitud}`,
    <Badge tone={sucursal.activa ? 'success' : 'neutral'}>{sucursal.activa ? 'Activa' : 'Inactiva'}</Badge>,
    <div className="row-actions">
      <Button variant="ghost" onClick={() => setModal({ tipo: 'editar', id: sucursal.id })}>
        Editar
      </Button>
      <Button variant="ghost" onClick={() => setModal({ tipo: 'administradores', sucursal })}>
        Administradores
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          cambiarEstado.reiniciar()
          setModal({ tipo: 'estado', sucursal })
        }}
      >
        {sucursal.activa ? 'Desactivar' : 'Activar'}
      </Button>
    </div>,
  ])

  return (
    <>
      <section className="surface list-surface">
        <FilterToolbar
          searchPlaceholder="Buscar sucursal por nombre..."
          onSearch={(valor) => {
            setNombre(valor)
            actualizarFiltro({})
          }}
          action="Nueva sucursal"
          onAction={() => setModal({ tipo: 'crear' })}
        >
          <label className="field">
            <span className="field-label">
              <span>Estado</span>
            </span>
            <select
              value={filtro.activa === undefined ? '' : String(filtro.activa)}
              onChange={(event) =>
                actualizarFiltro({ activa: event.target.value === '' ? undefined : event.target.value === 'true' })
              }
            >
              <option value="">Todas</option>
              <option value="true">Activas</option>
              <option value="false">Inactivas</option>
            </select>
          </label>
        </FilterToolbar>
        {aviso && (
          <div className="success-note" role="status">
            <Icon name="check" />
            <span>{aviso}</span>
          </div>
        )}
        {sucursales.error ? (
          <AvisoError error={sucursales.error} onReintentar={sucursales.recargar} />
        ) : !pagina && sucursales.cargando ? (
          <Cargando texto="Cargando sucursales..." />
        ) : rows.length ? (
          <DataTable
            headers={['Sucursal', 'Departamento', 'Teléfono', 'Coordenadas', 'Estado', 'Acciones']}
            rows={rows}
          />
        ) : (
          <div className="filter-empty">
            <span>
              <Icon name="search" />
            </span>
            <strong>No encontramos sucursales</strong>
            <p>Pruebe con otro término o restablezca los filtros.</p>
          </div>
        )}
        <Paginacion
          pagina={pagina}
          deshabilitada={sucursales.cargando}
          onCambiar={(page) => setFiltro((actual) => ({ ...actual, page }))}
        />
      </section>
      {modal?.tipo === 'crear' && (
        <CrearSucursalModal
          onClose={() => setModal(null)}
          onGuardado={({ sucursal, administrador }) =>
            terminar(
              `Sucursal ${sucursal.nombre} creada. Se envió un enlace de activación a ${administrador.correo}.`,
            )
          }
        />
      )}
      {modal?.tipo === 'editar' && (
        <EditarSucursalModal
          id={modal.id}
          onClose={() => setModal(null)}
          onGuardado={(editada) => terminar(`La sucursal ${editada.nombre} se actualizó.`)}
        />
      )}
      {modal?.tipo === 'estado' && (
        <ConfirmarEstadoModal
          recurso="sucursal"
          nombre={modal.sucursal.nombre}
          activar={!modal.sucursal.activa}
          nota="Una sucursal inactiva no admite nuevas operaciones. Los datos históricos se conservan."
          cargando={cambiarEstado.cargando}
          error={cambiarEstado.error}
          onConfirmar={() => confirmarEstado(modal.sucursal)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.tipo === 'administradores' && (
        <AdministradoresModal sucursal={modal.sucursal} onClose={() => setModal(null)} />
      )}
    </>
  )
}
