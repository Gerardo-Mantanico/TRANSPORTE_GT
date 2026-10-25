import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'
import { useEffect, useEffectEvent, useRef, useState } from 'react'

/** Un mismo código leído dentro de esta ventana se ignora: la cámara lo detecta varias veces por segundo. */
const PAUSA_MISMO_CODIGO_MS = 3000

interface EscanerQrProps {
  onCodigo: (codigo: string) => void
  /** Pausa la lectura (por ejemplo, mientras se registra un abordaje). */
  pausado?: boolean
}

/**
 * Lee códigos QR con la cámara trasera. `getUserMedia` solo existe en un contexto seguro (HTTPS o localhost):
 * desde otro equipo de la red use `npm run dev:movil`.
 */
export function EscanerQr({ onCodigo, pausado = false }: EscanerQrProps) {
  const video = useRef<HTMLVideoElement>(null)
  const ultimo = useRef<{ codigo: string; en: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const disponible = window.isSecureContext && Boolean(navigator.mediaDevices?.getUserMedia)

  const leido = useEffectEvent((texto: string) => {
    if (pausado) return
    const codigo = texto.trim()
    const ahora = Date.now()
    if (ultimo.current?.codigo === codigo && ahora - ultimo.current.en < PAUSA_MISMO_CODIGO_MS) return
    ultimo.current = { codigo, en: ahora }
    onCodigo(codigo)
  })

  useEffect(() => {
    if (!disponible || !video.current) return
    let controles: IScannerControls | null = null
    let cancelado = false
    new BrowserQRCodeReader()
      .decodeFromConstraints({ video: { facingMode: 'environment' } }, video.current, (resultado) => {
        if (resultado) leido(resultado.getText())
      })
      .then(
        (iniciados) => {
          if (cancelado) iniciados.stop()
          else controles = iniciados
        },
        (causa: unknown) => {
          if (cancelado) return
          const nombre = causa instanceof DOMException ? causa.name : ''
          setError(
            nombre === 'NotAllowedError'
              ? 'El navegador no tiene permiso para usar la cámara. Permítalo en la barra de direcciones.'
              : nombre === 'NotFoundError'
                ? 'No se encontró ninguna cámara en este equipo.'
                : 'No se pudo iniciar la cámara.',
          )
        },
      )
    return () => {
      cancelado = true
      controles?.stop()
    }
  }, [disponible])

  if (!disponible) {
    return (
      <div className="form-error" role="alert">
        <div>
          <strong>La cámara necesita HTTPS</strong>
          <small>
            El navegador solo permite la cámara en https:// o en localhost. Abra la aplicación con{' '}
            <code>npm run dev:movil</code> (https) o escriba el código a mano.
          </small>
        </div>
      </div>
    )
  }

  return (
    <div className="qr-scanner">
      <video ref={video} muted playsInline aria-label="Vista de la cámara" />
      <span className="qr-scanner-marco" aria-hidden="true" />
      {error && (
        <div className="form-error" role="alert">
          <div>
            <strong>{error}</strong>
          </div>
        </div>
      )}
    </div>
  )
}
