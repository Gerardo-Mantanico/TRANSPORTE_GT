import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, esCancelacion } from '../api/ApiError'

export type ResultadoMutacion<R> = { ok: true; datos: R } | { ok: false; error: ApiError }

export interface Mutacion<P, R> {
  ejecutar: (parametros: P) => Promise<ResultadoMutacion<R>>
  cargando: boolean
  error: ApiError | null
  reiniciar: () => void
}

/**
 * Envuelve una operación que modifica datos. Cancela la petición en curso si se vuelve a
 * ejecutar o si el componente se desmonta.
 */
export function useMutacion<P, R>(operacion: (parametros: P, signal: AbortSignal) => Promise<R>): Mutacion<P, R> {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const controladorRef = useRef<AbortController | null>(null)

  useEffect(() => () => controladorRef.current?.abort(), [])

  const ejecutar = useCallback(
    async (parametros: P): Promise<ResultadoMutacion<R>> => {
      controladorRef.current?.abort()
      const controlador = new AbortController()
      controladorRef.current = controlador
      setCargando(true)
      setError(null)
      try {
        const datos = await operacion(parametros, controlador.signal)
        if (!controlador.signal.aborted) setCargando(false)
        return { ok: true, datos }
      } catch (causa) {
        const apiError = ApiError.desde(causa)
        if (!esCancelacion(causa) && !controlador.signal.aborted) {
          setError(apiError)
          setCargando(false)
        }
        return { ok: false, error: apiError }
      }
    },
    [operacion],
  )

  const reiniciar = useCallback(() => setError(null), [])

  return { ejecutar, cargando, error, reiniciar }
}
