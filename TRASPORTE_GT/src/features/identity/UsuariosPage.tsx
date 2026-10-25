import { useState } from 'react'
import { useAuth } from '../../app/providers/useAuth'
import { Badge } from '../../components/ui/Badge'
import { AccionFila } from '../../components/ui/AccionFila'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { FilterToolbar } from '../../components/ui/FilterToolbar'
import { Icon } from '../../components/ui/Icon'
import { Avatar } from '../../components/ui/Misc'
import { Paginacion } from '../../components/ui/Paginacion'
import { useCambiarEstadoUsuario, useReenviarActivacion, useSucursales, useUsuarios } from '../../hooks/identity'
import { useDiferido } from '../../hooks/useDiferido'
import { ETIQUETAS_ROL, ROLES, type FiltroUsuarios, type Rol, type Usuario } from '../../types/identityTypes'
import { formatFechaLarga } from '../../utils/format'
import { ConfirmarEstadoModal } from './ConfirmarEstadoModal'
import { CrearUsuarioModal, EditarUsuarioModal } from './UsuarioFormModal'

const TAMANO_PAGINA = 10

const ROLES_VISIBLES: Partial<Record<Rol, Rol[]>> = {
  ADMIN_SISTEMA: [...ROLES],
  ADMIN_SUCURSAL: ['ADMIN_SUCURSAL', 'CAJERO', 'CHOFER'],
}

type ModalUsuarios = { tipo: 'crear' } | { tipo: 'editar'; id: string } | { tipo: 'estado'; usuario: Usuario }

export function UsuariosPage() {
  const { usuario: yo } = useAuth()
  const esSistema = yo?.rol === 'ADMIN_SISTEMA'
  const [filtro, setFiltro] = useState<FiltroUsuarios>({ page: 0, size: TAMANO_PAGINA, sort: 'nombreCompleto,asc' })
  const [texto, setTexto] = useState('')
  const textoDiferido = useDiferido(texto.trim())
  const usuarios = useUsuarios({ ...filtro, texto: textoDiferido || undefined })
  const sucursales = useSucursales({ size: 100, sort: 'nombre,asc' }, esSistema)
  const cambiarEstado = useCambiarEstadoUsuario()
  const reenviar = useReenviarActivacion()
  const [modal, setModal] = useState<ModalUsuarios | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  if (!yo) return null

  const rolesFiltro = ROLES_VISIBLES[yo.rol] ?? []
  const pagina = usuarios.datos

  const actualizarFiltro = (cambios: Partial<FiltroUsuarios>) =>
    setFiltro((actual) => ({ ...actual, ...cambios, page: 0 }))

  const terminar = (mensaje: string) => {
    setModal(null)
    setAviso(mensaje)
    usuarios.recargar()
  }

  const confirmarEstado = async (usuario: Usuario) => {
    const resultado = await cambiarEstado.ejecutar({ id: usuario.id, activo: !usuario.activo })
    if (resultado.ok) terminar(`${usuario.nombreCompleto} quedó ${usuario.activo ? 'inactivo' : 'activo'}.`)
  }

  const reenviarActivacion = async (usuario: Usuario) => {
    setAviso(null)
    const resultado = await reenviar.ejecutar(usuario.id)
    if (resultado.ok) setAviso(`Se envió un nuevo enlace de activación a ${usuario.correo}.`)
  }

  const rows = (pagina?.contenido ?? []).map((usuario) => [
    <div className="person">
      <Avatar name={usuario.nombreCompleto} small />
      <span>
        <strong>{usuario.nombreCompleto}</strong>
        <small className="cell-note">{usuario.correo}</small>
      </span>
    </div>,
    ETIQUETAS_ROL[usuario.rol],
    usuario.nombreSucursal ?? '—',
    formatFechaLarga(usuario.creadoEn),
    <div className="cell-stack">
      <Badge tone={usuario.activo ? 'success' : 'neutral'}>{usuario.activo ? 'Activo' : 'Inactivo'}</Badge>
      {usuario.activacionPendiente && (
        <small className="cell-note">
          <Badge tone="warning">Activación pendiente</Badge>
        </small>
      )}
    </div>,
    usuario.id === yo.id ? (
      <span className="guard-label">Su cuenta</span>
    ) : (
      <div className="row-actions">
        <AccionFila
          icono="edit"
          titulo="Editar"
          onClick={() => setModal({ tipo: 'editar', id: usuario.id })}
        />
        {usuario.activacionPendiente && usuario.activo && (
          <AccionFila
            icono="mail"
            titulo="Reenviar activación"
            onClick={() => reenviarActivacion(usuario)}
            disabled={reenviar.cargando}
          />
        )}
        <AccionFila
          icono="power"
          titulo={usuario.activo ? 'Desactivar' : 'Activar'}
          onClick={() => {
            cambiarEstado.reiniciar()
            setModal({ tipo: 'estado', usuario })
          }}
        />
      </div>
    ),
  ])

  return (
    <>
      <section className="surface list-surface">
        <FilterToolbar
          searchPlaceholder="Buscar por nombre o correo..."
          onSearch={(valor) => {
            setTexto(valor)
            actualizarFiltro({})
          }}
          action="Nuevo usuario"
          onAction={() => setModal({ tipo: 'crear' })}
        >
          <label className="field">
            <span className="field-label">
              <span>Rol</span>
            </span>
            <select
              value={filtro.rol ?? ''}
              onChange={(event) => actualizarFiltro({ rol: (event.target.value || undefined) as Rol | undefined })}
            >
              <option value="">Todos los roles</option>
              {rolesFiltro.map((rol) => (
                <option key={rol} value={rol}>
                  {ETIQUETAS_ROL[rol]}
                </option>
              ))}
            </select>
          </label>
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
          <div className="success-note" role="status">
            <Icon name="check" />
            <span>{aviso}</span>
          </div>
        )}
        <AvisoError error={reenviar.error} />
        {usuarios.error ? (
          <AvisoError error={usuarios.error} onReintentar={usuarios.recargar} />
        ) : !pagina && usuarios.cargando ? (
          <Cargando texto="Cargando usuarios..." />
        ) : rows.length ? (
          <DataTable headers={['Usuario', 'Rol', 'Sucursal', 'Alta', 'Estado', 'Acciones']} rows={rows} />
        ) : (
          <div className="filter-empty">
            <span>
              <Icon name="search" />
            </span>
            <strong>No encontramos usuarios</strong>
            <p>Pruebe con otro término o restablezca los filtros.</p>
          </div>
        )}
        <Paginacion
          pagina={pagina}
          deshabilitada={usuarios.cargando}
          onCambiar={(page) => setFiltro((actual) => ({ ...actual, page }))}
        />
      </section>
      {modal?.tipo === 'crear' && (
        <CrearUsuarioModal
          rolCreador={yo.rol}
          sucursales={sucursales.datos?.contenido ?? []}
          onClose={() => setModal(null)}
          onGuardado={(creado) => terminar(`Usuario creado. Se envió un enlace de activación a ${creado.correo}.`)}
        />
      )}
      {modal?.tipo === 'editar' && (
        <EditarUsuarioModal
          id={modal.id}
          onClose={() => setModal(null)}
          onGuardado={(editado) => terminar(`Los datos de ${editado.nombreCompleto} se actualizaron.`)}
        />
      )}
      {modal?.tipo === 'estado' && (
        <ConfirmarEstadoModal
          recurso="usuario"
          nombre={modal.usuario.nombreCompleto}
          activar={!modal.usuario.activo}
          nota="Los usuarios no se eliminan; solo se desactivan. Debe existir al menos un administrador de sistema activo y uno por sucursal."
          cargando={cambiarEstado.cargando}
          error={cambiarEstado.error}
          onConfirmar={() => confirmarEstado(modal.usuario)}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
