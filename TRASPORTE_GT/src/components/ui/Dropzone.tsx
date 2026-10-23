import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import { Icon } from './Icon'
import { Lightbox } from './Lightbox'

interface DropzoneItem {
  id: string
  file: File
  url: string
}

interface DropzoneProps {
  label: string
  multiple?: boolean
  max?: number
  accept?: string
  onChange?: (files: File[]) => void
}

let dropzoneSeq = 0

export function Dropzone({
  label,
  multiple = false,
  max = 10,
  accept = 'image/*',
  onChange,
}: DropzoneProps) {
  const [items, setItems] = useState<DropzoneItem[]>([])
  const [current, setCurrent] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const urlsRef = useRef<string[]>([])

  useEffect(() => {
    urlsRef.current = items.map((item) => item.url)
  }, [items])

  useEffect(
    () => () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    },
    [],
  )

  const applyFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const images = Array.from(incoming).filter((file) => file.type.startsWith('image/'))
    if (images.length === 0) return
    const room = multiple ? Math.max(max - items.length, 0) : 1
    const accepted = images.slice(0, room)
    if (accepted.length === 0) return
    const created = accepted.map((file) => ({
      id: `dropzone-${++dropzoneSeq}`,
      file,
      url: URL.createObjectURL(file),
    }))
    const next = multiple ? [...items, ...created] : created
    if (!multiple) {
      items.forEach((item) => URL.revokeObjectURL(item.url))
    }
    setItems(next)
    setCurrent(multiple ? Math.min(items.length, next.length - 1) : 0)
    onChange?.(next.map((item) => item.file))
  }

  const removeItem = (index: number) => {
    const target = items[index]
    if (!target) return
    URL.revokeObjectURL(target.url)
    const next = items.filter((_, i) => i !== index)
    setItems(next)
    setCurrent((prev) => Math.min(prev > index ? prev - 1 : prev, Math.max(next.length - 1, 0)))
    onChange?.(next.map((item) => item.file))
  }

  const goPrev = () => setCurrent((prev) => (prev - 1 + items.length) % items.length)
  const goNext = () => setCurrent((prev) => (prev + 1) % items.length)

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    setDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    applyFiles(event.dataTransfer.files)
  }

  const handleStageKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (items.length < 2) return
    if (event.key === 'ArrowLeft') goPrev()
    if (event.key === 'ArrowRight') goNext()
  }

  const hasImages = items.length > 0
  const active = items[current]

  return (
    <div className="field">
      <span className="field-label">
        <span>{label}</span>
        {hasImages && (
          <small className="dropzone-count">
            {items.length} {items.length === 1 ? 'imagen' : 'imágenes'} de {max}
          </small>
        )}
      </span>
      <div
        className={`dropzone${dragging ? ' is-dragging' : ''}${hasImages ? ' has-preview' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          onChange={(event) => {
            applyFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <Icon name="upload" size={20} />
        <span className="dropzone-title">
          {hasImages
            ? 'Arrastra más imágenes o haz clic para agregar'
            : 'Arrastra imágenes aquí o haz clic para seleccionar'}
        </span>
        <span className="dropzone-hint">
          {multiple ? `PNG, JPG o WEBP · hasta ${max} imágenes` : 'PNG, JPG o WEBP'}
        </span>
      </div>
      {hasImages && active && (
        <div className="dropzone-preview">
          <div
            className="dropzone-stage"
            tabIndex={0}
            onKeyDown={handleStageKeyDown}
            aria-label={`Imagen ${current + 1} de ${items.length}`}
          >
            <img
              src={active.url}
              alt={active.file.name}
              onClick={() => setViewerOpen(true)}
              title="Ver en pantalla completa"
            />
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  className="dropzone-nav prev"
                  onClick={goPrev}
                  aria-label="Imagen anterior"
                >
                  <Icon name="chevron" size={16} />
                </button>
                <button
                  type="button"
                  className="dropzone-nav next"
                  onClick={goNext}
                  aria-label="Imagen siguiente"
                >
                  <Icon name="chevron" size={16} />
                </button>
                <span className="dropzone-counter">
                  {current + 1} / {items.length}
                </span>
              </>
            )}
            <button
              type="button"
              className="dropzone-remove"
              onClick={() => removeItem(current)}
              aria-label="Quitar imagen"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
          {items.length > 1 && (
            <div className="dropzone-thumbs">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={index === current ? 'active' : ''}
                  onClick={() => setCurrent(index)}
                  aria-label={`Ver imagen ${index + 1} de ${items.length}`}
                >
                  <img src={item.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {viewerOpen && active && (
        <Lightbox
          urls={items.map((item) => item.url)}
          index={current}
          onIndexChange={setCurrent}
          onClose={() => setViewerOpen(false)}
          alt={active.file.name}
        />
      )}
    </div>
  )
}
