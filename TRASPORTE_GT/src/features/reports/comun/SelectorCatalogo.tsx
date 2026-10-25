import type { OpcionCatalogo } from '../../../types/reportTypes'

interface SelectorCatalogoProps {
  etiqueta: string
  valor: string
  opciones: OpcionCatalogo[] | null
  onCambiar: (valor: string) => void
  /** Texto de la opción vacía; `null` obliga a elegir. */
  todas?: string | null
  cargando?: boolean
}

/** Select de un catálogo de reportes; las opciones inactivas se marcan (rutas eliminadas, buses inactivos). */
export function SelectorCatalogo({
  etiqueta,
  valor,
  opciones,
  onCambiar,
  todas = 'Todas',
  cargando = false,
}: SelectorCatalogoProps) {
  return (
    <label className="field">
      <span className="field-label">
        <span>{etiqueta}</span>
      </span>
      <select value={valor} onChange={(event) => onCambiar(event.target.value)} disabled={cargando}>
        {todas !== null ? <option value="">{todas}</option> : <option value="">Seleccione…</option>}
        {(opciones ?? []).map((opcion) => (
          <option key={opcion.id} value={opcion.id}>
            {opcion.activo ? opcion.nombre : `${opcion.nombre} (inactivo)`}
          </option>
        ))}
      </select>
    </label>
  )
}
