import { useRef, useState, type DragEvent, type ReactNode } from 'react'
import { Icon } from './Icon'

interface DropzoneProps {
  /** Archivo elegido (clic o arrastre); `null` si se limpió. */
  onArchivo: (archivo: File | null) => void
  /** Valor de `accept` del diálogo de archivos. */
  aceptar?: string
  /** Vista previa u otro contenido que se muestra encima de la zona de carga. */
  children?: ReactNode
  /** Archivo ya elegido, para mostrarlo dentro de la zona de carga. */
  archivo?: File | null
  /** Ayuda bajo la zona de carga. */
  nota?: ReactNode
  /** Error de validación; se muestra bajo la zona de carga. */
  error?: string | null
  disabled?: boolean
}

/** Zona de carga por clic o arrastre, con la previsualización arriba y el control de carga al final. */
export function Dropzone({
  onArchivo,
  aceptar,
  children,
  archivo,
  nota,
  error,
  disabled = false,
}: DropzoneProps) {
  const [sobre, setSobre] = useState(false)
  const entrada = useRef<HTMLInputElement>(null)

  const soltar = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setSobre(false)
    if (disabled) return
    onArchivo(event.dataTransfer.files?.[0] ?? null)
  }

  const notaFinal = error ?? nota

  return (
    <div className="dropzone">
      {/* El input va primero: al estar dentro de un <label>, ese sería su control etiquetado. */}
      <input
        ref={entrada}
        type="file"
        hidden
        accept={aceptar}
        onChange={(event) => {
          onArchivo(event.target.files?.[0] ?? null)
          // Reinicia el valor para poder volver a elegir el mismo archivo.
          event.target.value = ''
        }}
      />
      {children && <div className="dropzone-preview">{children}</div>}
      <button
        type="button"
        className={`dropzone-area${sobre ? ' is-over' : ''}`}
        disabled={disabled}
        onClick={() => entrada.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setSobre(true)
        }}
        onDragLeave={() => setSobre(false)}
        onDrop={soltar}
      >
        <Icon name={archivo ? 'check' : 'upload'} size={22} />
        <strong>{archivo ? archivo.name : 'Arrastra el archivo aquí'}</strong>
        <span>{archivo ? 'Haz clic para cambiarlo' : 'o haz clic para seleccionarlo'}</span>
      </button>
      {notaFinal && <small className={`cell-note${error ? ' dropzone-error' : ''}`}>{notaFinal}</small>}
    </div>
  )
}
