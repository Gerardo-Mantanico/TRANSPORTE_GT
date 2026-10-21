import axios, { AxiosError } from 'axios'
import type { RespuestaError } from './types'

const TOKEN_KEY = 'transportegt_token'
const SESSION_KEY = 'transportegt_session'

export interface SessionPayload {
  token: string
  expiraEn: string
  usuario: {
    id: string
    correo: string
    nombreCompleto: string
    rol: string
    idSucursal: string | null
  }
}

export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function getSession(): SessionPayload | null {
  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionPayload
  } catch {
    return null
  }
}

export function saveSession(session: SessionPayload): void {
  window.localStorage.setItem(TOKEN_KEY, session.token)
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(SESSION_KEY)
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? ''
      const enLogin = window.location.pathname.startsWith('/login')
      const esLogin = url.includes('/auth/login')
      // Token vencido o inválido en una petición autenticada: cerrar sesión y pedir login.
      if (!esLogin && !enLogin && getToken()) {
        clearSession()
        window.location.assign('/login?expirada=1')
      }
    }
    return Promise.reject(error)
  },
)

export class ApiError extends Error {
  codigo: string
  status: number

  constructor(codigo: string, mensaje: string, status: number) {
    super(mensaje)
    this.name = 'ApiError'
    this.codigo = codigo
    this.status = status
  }
}

export function errorMessage(error: unknown): string {
  return toApiError(error).message
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<RespuestaError>
    const data = axiosError.response?.data
    if (data?.codigo) {
      return new ApiError(data.codigo, data.error ?? data.codigo, data.status ?? axiosError.response?.status ?? 0)
    }
    const status = axiosError.response?.status
    if (status === 401) {
      return new ApiError(
        'NO_AUTENTICADO',
        'La sesión expiró o el token no es válido. Inicie sesión nuevamente.',
        401,
      )
    }
    if (status === 403) {
      return new ApiError('ACCESO_DENEGADO', 'No tiene permisos para realizar esta operación.', 403)
    }
    if (axiosError.code === 'ERR_NETWORK') {
      return new ApiError('SIN_CONEXION', 'No se pudo conectar con el servidor. Verifique que el gateway esté activo.', 0)
    }
    return new ApiError('ERROR_INESPERADO', axiosError.message, axiosError.response?.status ?? 0)
  }
  return new ApiError('ERROR_INESPERADO', error instanceof Error ? error.message : 'Error inesperado', 0)
}
