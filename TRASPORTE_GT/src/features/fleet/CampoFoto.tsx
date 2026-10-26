import { useState } from 'react'
import { Dropzone } from '../../components/ui/Dropzone'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { VisorImagen } from '../../components/ui/VisorImagen'
import { useFotoPrivada } from '../../hooks/fleet'
import { TAMANO_MAXIMO_FOTO, TIPOS_FOTO } from '../../types/fleetTypes'
import { iniciales } from '../../utils/format'

interface CampoFotoProps {
  label: string
  nombre: string
  /** `fotoUrl` actual (al editar). */
  fotoActual?: string | null
  onChange: (archivo: File | null) => void
}

/** Selector de foto con vista previa local y las mismas reglas del backend (JPEG, PNG o WebP; máx. 5 MB). */
export function CampoFoto({ label, nombre, fotoActual, onChange }: CampoFotoProps) {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viendo, setViendo] = useState(false)
  const { datos: urlActual } = useFotoPrivada(fotoActual)
  const fuente = vistaPrevia ?? urlActual

  const elegir = (nuevo: File | null) => {
    setError(null)
    setVistaPrevia(null)
    setArchivo(null)
    if (!nuevo) {
      onChange(null)
      return
    }
    if (!TIPOS_FOTO.includes(nuevo.type)) {
      setError('Formato no permitido: use JPEG, PNG o WebP.')
      onChange(null)
      return
    }
    if (nuevo.size > TAMANO_MAXIMO_FOTO) {
      setError('La imagen supera el tamaño máximo de 5 MB.')
      onChange(null)
      return
    }
    setArchivo(nuevo)
    onChange(nuevo)
    // Data URL: no hay que liberarla como un object URL
    const lector = new FileReader()
    lector.onload = () => setVistaPrevia(typeof lector.result === 'string' ? lector.result : null)
    lector.readAsDataURL(nuevo)
  }

  const quitar = () => {
    setError(null)
    setVistaPrevia(null)
    setArchivo(null)
    onChange(null)
  }

  return (
    <>
      <Field label={label}>
        <Dropzone
          aceptar={TIPOS_FOTO.join(',')}
          archivo={archivo}
          error={error}
          nota="JPEG, PNG o WebP de hasta 5 MB. Opcional."
          onArchivo={elegir}
        >
          {fuente ? (
            <button
              type="button"
              className="foto-vista"
              onClick={() => setViendo(true)}
              title="Ver foto completa"
              aria-label="Ver foto completa"
            >
              <img className="avatar foto-privada foto-grande" src={fuente} alt={label} />
            </button>
          ) : (
            <span className="avatar foto-grande">{iniciales(nombre)}</span>
          )}
          {vistaPrevia && (
            <button type="button" className="icon-button" title="Quitar foto" aria-label="Quitar foto" onClick={quitar}>
              <Icon name="close" />
            </button>
          )}
        </Dropzone>
      </Field>
      {viendo && fuente && <VisorImagen src={fuente} alt={label} onCerrar={() => setViendo(false)} />}
    </>
  )
}
