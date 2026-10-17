import axios from 'axios'
import type { RespuestaError } from '../types/respuestaError'

const MENSAJES_POR_ESTADO: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Revise su conexión.',
  400: 'La solicitud no es válida.',
  401: 'Su sesión expiró. Inicie sesión de nuevo.',
  403: 'No tiene permisos para realizar esta acción.',
  404: 'El recurso no existe.',
  409: 'El registro fue modificado por otra persona. Recargue e intente de nuevo.',
  410: 'El recurso ya no está disponible.',
  429: 'Demasiadas solicitudes. Intente más tarde.',
  503: 'El servicio no está disponible en este momento.',
}

function esRespuestaError(datos: unknown): datos is RespuestaError {
  return (
    typeof datos === 'object' &&
    datos !== null &&
    typeof (datos as RespuestaError).error === 'string' &&
    typeof (datos as RespuestaError).codigo === 'string'
  )
}

/** Error de la API con el formato `RespuestaError` del backend ya parseado. */
export class ApiError extends Error {
  readonly status: number
  readonly codigo: string
  readonly ruta?: string

  constructor(status: number, codigo: string, mensaje: string, ruta?: string) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.codigo = codigo
    this.ruta = ruta
  }

  static desde(error: unknown): ApiError {
    if (error instanceof ApiError) return error
    if (axios.isAxiosError(error)) {
      if (error.code === 'ERR_CANCELED') return new ApiError(0, 'CANCELADA', 'Solicitud cancelada')
      const respuesta = error.response
      if (!respuesta) return new ApiError(0, 'SIN_CONEXION', MENSAJES_POR_ESTADO[0])
      const datos: unknown = respuesta.data
      if (esRespuestaError(datos)) {
        return new ApiError(respuesta.status, datos.codigo, datos.error, datos.ruta)
      }
      return new ApiError(
        respuesta.status,
        `HTTP_${respuesta.status}`,
        MENSAJES_POR_ESTADO[respuesta.status] ?? 'Ocurrió un error inesperado.',
      )
    }
    return new ApiError(0, 'DESCONOCIDO', error instanceof Error ? error.message : 'Ocurrió un error inesperado.')
  }
}

/** true si el error viene de una petición cancelada con AbortController. */
export function esCancelacion(error: unknown): boolean {
  return axios.isCancel(error) || (error instanceof ApiError && error.codigo === 'CANCELADA')
}
