import { useEffect } from 'react'
import { Icon } from './Icon'

interface LightboxProps {
  urls: string[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
  alt?: string
}

export function Lightbox({ urls, index, onIndexChange, onClose, alt = 'Imagen' }: LightboxProps) {
  const total = urls.length
  const current = urls[index]

  useEffect(() => {
    const handleKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      else if (event.key === 'ArrowLeft') onIndexChange((index - 1 + total) % total)
      else if (event.key === 'ArrowRight') onIndexChange((index + 1) % total)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [index, total, onClose, onIndexChange])

  if (!current) return null

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Visor de imágenes: ${index + 1} de ${total}`}
      onClick={onClose}
    >
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Cerrar visor">
        <Icon name="close" size={20} />
      </button>
      {total > 1 && (
        <>
          <button
            type="button"
            className="lightbox-nav prev"
            onClick={(event) => {
              event.stopPropagation()
              onIndexChange((index - 1 + total) % total)
            }}
            aria-label="Imagen anterior"
          >
            <Icon name="chevron" size={22} />
          </button>
          <button
            type="button"
            className="lightbox-nav next"
            onClick={(event) => {
              event.stopPropagation()
              onIndexChange((index + 1) % total)
            }}
            aria-label="Imagen siguiente"
          >
            <Icon name="chevron" size={22} />
          </button>
        </>
      )}
      <img src={current} alt={alt} onClick={(event) => event.stopPropagation()} />
      <span className="lightbox-counter">
        {index + 1} / {total}
      </span>
    </div>
  )
}
