import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { ApiError } from './ApiError'
import { leerToken } from './sesion'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Endpoint público: no se envía el token (login, registro, enlaces de contraseña). */
    publica?: boolean
  }
}

let alSesionInvalida: () => void = () => {}

/** Registra qué hacer cuando una petición autenticada recibe 401 (cerrar la sesión). */
export function alRecibirNoAutorizado(manejador: () => void): () => void {
  alSesionInvalida = manejador
  return () => {
    if (alSesionInvalida === manejador) alSesionInvalida = () => {}
  }
}

/** Crea un cliente para un microservicio con el token, el parseo de `ApiError` y el cierre de sesión por 401. */
export function crearClienteHttp(baseURL: string): AxiosInstance {
  const cliente = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  })

  cliente.interceptors.request.use((config) => {
    const token = leerToken()
    if (token && !config.publica) config.headers.set('Authorization', `Bearer ${token}`)
    return config
  })

  cliente.interceptors.response.use(
    (respuesta) => respuesta,
    (error: unknown) => {
      const apiError = ApiError.desde(error)
      // Un 401 con token significa sesión vencida o revocada. El 401 del login sin token
      // (credenciales malas) es solo un error del formulario.
      const llevabaToken = axios.isAxiosError(error) && error.config?.headers?.has('Authorization') === true
      if (apiError.status === 401 && llevabaToken) alSesionInvalida()
      return Promise.reject(apiError)
    },
  )

  return cliente
}

export const clienteIdentidad = crearClienteHttp(import.meta.env.VITE_API_URL)

export const clienteClientes = crearClienteHttp(import.meta.env.VITE_CUSTOMERS_API_URL)

export const clienteBoletos = crearClienteHttp(import.meta.env.VITE_TICKETS_API_URL)

export const clienteViajes = crearClienteHttp(import.meta.env.VITE_TRIPS_API_URL)

export const clienteFlota = crearClienteHttp(import.meta.env.VITE_FLEET_API_URL)

export const clienteAlquileres = crearClienteHttp(import.meta.env.VITE_RENTALS_API_URL)

export const clienteCostos = crearClienteHttp(import.meta.env.VITE_COSTS_API_URL)

/**
 * Ejecuta la petición y devuelve el cuerpo; las respuestas sin cuerpo (202/204) dan `undefined`.
 * Por omisión usa el cliente de Identidad.
 */
export async function solicitar<T>(config: AxiosRequestConfig, cliente: AxiosInstance = clienteIdentidad): Promise<T> {
  const respuesta = await cliente.request<T>(config)
  if (respuesta.status === 204 || respuesta.data === '' || respuesta.data == null) {
    return undefined as T
  }
  return respuesta.data
}

/** Quita los parámetros vacíos para no enviar `?texto=&rol=`. */
export function limpiarParametros<T extends object>(parametros: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(parametros).filter(([, valor]) => valor !== undefined && valor !== null && valor !== ''),
  ) as Partial<T>
}
