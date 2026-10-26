import { useState } from 'react'
import { AvisoError } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FormModal } from '../../components/ui/FormModal'
import { useCrearCategoria, useEditarCategoria } from '../../hooks/costs'
import type { Categoria } from '../../types/costsTypes'

/** Crear o editar una categoría de gasto (nombre y descripción). */
export function CategoriaFormModal({
  categoria,
  onClose,
  onGuardada,
}: {
  categoria?: Categoria
  onClose: () => void
  onGuardada: (categoria: Categoria) => void
}) {
  const crear = useCrearCategoria()
  const editar = useEditarCategoria()
  const [nombre, setNombre] = useState(categoria?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(categoria?.descripcion ?? '')
  const mutacion = categoria ? editar : crear

  const guardar = async () => {
    const datos = { nombre: nombre.trim(), descripcion: descripcion.trim() || null }
    const resultado = categoria ? await editar.ejecutar({ id: categoria.id, ...datos }) : await crear.ejecutar(datos)
    if (resultado.ok) onGuardada(resultado.datos)
  }

  return (
    <FormModal
      eyebrow={categoria ? 'Editar categoría' : 'Nueva categoría'}
      title={categoria ? categoria.nombre : 'Categoría de gasto'}
      actionLabel={categoria ? 'Guardar cambios' : 'Crear categoría'}
      enviando={mutacion.cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <div className="form-grid">
        <Field label="Nombre" placeholder="Ej. Eléctrico" value={nombre} onChange={(event) => setNombre(event.target.value)} maxLength={80} required />
        <Field
          label="Descripción"
          placeholder="Para qué se usa"
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
          maxLength={250}
        />
      </div>
      <AvisoError error={mutacion.error} />
    </FormModal>
  )
}
