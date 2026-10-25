import { useEffect } from 'react'
import { Icon } from './Icon'

interface VisorImagenProps {
  src: string
  alt?: string
  onCerrar: () => void
}

/** Visor de imagen a pantalla completo: se cierra con Esc, con la ✕ o con el fondo. */
export function VisorImagen({ src, alt = 'Imagen', onCerrar }: VisorImagenProps) {
  useEffect(() => {
    const alTeclar = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alTeclar)
    return () => document.removeEventListener('keydown', alTeclar)
  }, [onCerrar])

  return (
    <div className="visor-layer" role="dialog" aria-modal="true" aria-label={alt}>
      <button className="visor-scrim" onClick={onCerrar} aria-label="Cerrar visor" />
      <img className="visor-imagen" src={src} alt={alt} title="Cerrar" onClick={onCerrar} />
      <button type="button" className="icon-button visor-cerrar" onClick={onCerrar} title="Cerrar" aria-label="Cerrar">
        <Icon name="close" />
      </button>
    </div>
  )
}
