import { useEffect, useEffectEvent, useState } from 'react'
import { ApiError, esCancelacion } from '../api/ApiError'

export interface ResultadoConsulta<T> {
  datos: T | null
  cargando: boolean
  error: ApiError | null
  recargar: () => void
}

interface Respuesta<T> {
  clave: string | null
  datos: T | null
  error: ApiError | null
}

/**
 * Ejecuta `consultar` cada vez que cambia `clave` y cancela la petición anterior.
 * El estado de carga se deriva comparando la clave pedida con la de la última respuesta,
 * así no hay `setState` síncrono dentro del efecto.
 */
export function useConsulta<T>(
  consultar: (signal: AbortSignal) => Promise<T>,
  clave: string,
  habilitada = true,
): ResultadoConsulta<T> {
  const [intento, setIntento] = useState(0)
  const [respuesta, setRespuesta] = useState<Respuesta<T>>({ clave: null, datos: null, error: null })
  const claveActual = `${clave}#${intento}`

  const ejecutar = useEffectEvent((signal: AbortSignal) => consultar(signal))

  useEffect(() => {
    if (!habilitada) return
    const controlador = new AbortController()
    ejecutar(controlador.signal).then(
      (datos) => setRespuesta({ clave: claveActual, datos, error: null }),
      (error: unknown) => {
        if (esCancelacion(error)) return
        setRespuesta((anterior) => ({ clave: claveActual, datos: anterior.datos, error: ApiError.desde(error) }))
      },
    )
    return () => controlador.abort()
  }, [claveActual, habilitada])

  const vigente = respuesta.clave === claveActual

  return {
    datos: habilitada ? respuesta.datos : null,
    cargando: habilitada && !vigente,
    error: habilitada && vigente ? respuesta.error : null,
    recargar: () => setIntento((valor) => valor + 1),
  }
}
