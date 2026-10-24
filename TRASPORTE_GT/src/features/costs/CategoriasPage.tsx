import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { FilterToolbar } from '../../components/ui/FilterToolbar'
import { FormModal } from '../../components/ui/FormModal'
import { Icon } from '../../components/ui/Icon'
import { InfoNote } from '../../components/ui/Misc'
import { useCambiarActivaCategoria, useCategorias, useEliminarCategoria } from '../../hooks/costs'
import type { Categoria } from '../../types/costsTypes'
import { cellText } from '../../utils/cellText'
import { formatFechaCorta } from '../../utils/format'
import { CategoriaFormModal } from './CategoriaFormModal'

type ModalCategorias = { tipo: 'crear' } | { tipo: 'editar' | 'eliminar'; categoria: Categoria }

/** Catálogo dinámico de categorías de gasto (SIS y SUC). Una categoría con gastos no se elimina: se desactiva. */
export function CategoriasPage() {
  const [activa, setActiva] = useState<boolean | undefined>(undefined)
  const [texto, setTexto] = useState('')
  const [modal, setModal] = useState<ModalCategorias | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const categorias = useCategorias(activa === undefined ? {} : { activa })
  const cambiarActiva = useCambiarActivaCategoria()
  const eliminar = useEliminarCategoria()

  const terminar = (mensaje: string) => {
    setModal(null)
    setAviso(mensaje)
    categorias.recargar()
  }

  const alternar = async (categoria: Categoria) => {
    const resultado = await cambiarActiva.ejecutar({ id: categoria.id, activa: !categoria.activa })
    if (resultado.ok) terminar(`La categoría ${categoria.nombre} se ${categoria.activa ? 'desactivó' : 'activó'}.`)
  }

  const confirmarEliminar = async (categoria: Categoria) => {
    const resultado = await eliminar.ejecutar(categoria.id)
    if (resultado.ok) terminar(`La categoría ${categoria.nombre} se eliminó.`)
  }

  const todas = (categorias.datos ?? []).map((categoria) => [
    <>
      <strong>{categoria.nombre}</strong>
      {categoria.descripcion && <small className="cell-note">{categoria.descripcion}</small>}
    </>,
    formatFechaCorta(categoria.creadoEn),
    <Badge tone={categoria.activa ? 'success' : 'neutral'}>{categoria.activa ? 'Activa' : 'Inactiva'}</Badge>,
    <div className="row-actions">
      <Button variant="ghost" onClick={() => setModal({ tipo: 'editar', categoria })}>
        Editar
      </Button>
      <Button variant="ghost" disabled={cambiarActiva.cargando} onClick={() => alternar(categoria)}>
        {categoria.activa ? 'Desactivar' : 'Activar'}
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          eliminar.reiniciar()
          setModal({ tipo: 'eliminar', categoria })
        }}
      >
        Eliminar
      </Button>
    </div>,
  ])
  const busqueda = texto.trim().toLocaleLowerCase('es')
  const rows = busqueda ? todas.filter((row) => cellText(row).toLocaleLowerCase('es').includes(busqueda)) : todas

  return (
    <>
      <section className="surface list-surface">
        <FilterToolbar
          searchPlaceholder="Buscar categoría..."
          onSearch={setTexto}
          action="Nueva categoría"
          onAction={() => setModal({ tipo: 'crear' })}
        >
          <label className="field">
            <span className="field-label">
              <span>Estado</span>
            </span>
            <select
              value={activa === undefined ? '' : String(activa)}
              onChange={(event) => setActiva(event.target.value === '' ? undefined : event.target.value === 'true')}
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
        <AvisoError error={cambiarActiva.error} />
        {categorias.error ? (
          <AvisoError error={categorias.error} onReintentar={categorias.recargar} />
        ) : !categorias.datos && categorias.cargando ? (
          <Cargando texto="Cargando categorías..." />
        ) : rows.length ? (
          <DataTable headers={['Categoría', 'Creada', 'Estado', 'Acciones']} rows={rows} />
        ) : (
          <div className="filter-empty">
            <span>
              <Icon name="grid" />
            </span>
            <strong>No hay categorías</strong>
            <p>Cree la primera categoría para clasificar los gastos de taller.</p>
          </div>
        )}
      </section>
      {(modal?.tipo === 'crear' || modal?.tipo === 'editar') && (
        <CategoriaFormModal
          categoria={modal.tipo === 'editar' ? modal.categoria : undefined}
          onClose={() => setModal(null)}
          onGuardada={(categoria) => terminar(`Categoría ${categoria.nombre} ${modal.tipo === 'editar' ? 'actualizada' : 'creada'}.`)}
        />
      )}
      {modal?.tipo === 'eliminar' && (
        <FormModal
          eyebrow="Acción destructiva"
          title="Eliminar categoría"
          actionLabel="Eliminar"
          danger
          enviando={eliminar.cargando}
          onSubmit={() => confirmarEliminar(modal.categoria)}
          onClose={() => setModal(null)}
        >
          <p className="modal-paragraph">
            ¿Desea eliminar la categoría <strong>{modal.categoria.nombre}</strong>?
          </p>
          <InfoNote>Solo se elimina una categoría sin gastos asociados; si ya se usó, desactívela.</InfoNote>
          <AvisoError error={eliminar.error}>
            {eliminar.error?.status === 409 && <small>La categoría tiene gastos registrados: use Desactivar.</small>}
          </AvisoError>
        </FormModal>
      )}
    </>
  )
}
