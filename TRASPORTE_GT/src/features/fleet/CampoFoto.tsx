import { useState } from 'react'
import { Field } from '../../components/ui/Field'
import { TAMANO_MAXIMO_FOTO, TIPOS_FOTO } from '../../types/fleetTypes'
import { FotoPrivada } from './FotoPrivada'

interface CampoFotoProps {
  label: string
  nombre: string
  /** `fotoUrl` actual (al editar). */
  fotoActual?: string | null
  onChange: (archivo: File | null) => void
}

/** Selector de foto con vista previa local y las mismas reglas del backend (JPEG, PNG o WebP; máx. 5 MB). */
export function CampoFoto({ label, nombre, fotoActual, onChange }: CampoFotoProps) {
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const elegir = (archivo: File | undefined) => {
    setError(null)
    setVistaPrevia(null)
    if (!archivo) {
      onChange(null)
      return
    }
    if (!TIPOS_FOTO.includes(archivo.type)) {
      setError('Formato no permitido: use JPEG, PNG o WebP.')
      onChange(null)
      return
    }
    if (archivo.size > TAMANO_MAXIMO_FOTO) {
      setError('La imagen supera el tamaño máximo de 5 MB.')
      onChange(null)
      return
    }
    onChange(archivo)
    // Data URL: no hay que liberarla como un object URL
    const lector = new FileReader()
    lector.onload = () => setVistaPrevia(typeof lector.result === 'string' ? lector.result : null)
    lector.readAsDataURL(archivo)
  }

  return (
    <Field label={label}>
      <div className="campo-foto">
        {vistaPrevia ? (
          <img className="avatar foto-privada foto-grande" src={vistaPrevia} alt="Vista previa" />
        ) : (
          <FotoPrivada ruta={fotoActual} nombre={nombre || '?'} grande />
        )}
        <div>
          <input
            className="file-input"
            type="file"
            accept={TIPOS_FOTO.join(',')}
            onChange={(event) => elegir(event.target.files?.[0])}
          />
          <small className="cell-note">{error ?? 'JPEG, PNG o WebP de hasta 5 MB. Opcional.'}</small>
        </div>
      </div>
    </Field>
  )
}
