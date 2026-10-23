import { api } from './client'
import type {
  LoginResponse,
  PaginaResponse,
  RolBackend,
  SucursalResponse,
  UsuarioResponse,
} from './types'

export async function login(correo: string, contrasena: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/v1/identity/auth/login', { correo, contrasena })
  return data
}

export async function registro(payload: {
  nombreCompleto: string
  correo: string
  contrasena: string
}): Promise<UsuarioResponse> {
  const { data } = await api.post<UsuarioResponse>('/v1/identity/auth/registro', payload)
  return data
}

export async function olvideContrasena(correo: string): Promise<{ mensaje: string }> {
  const { data } = await api.post<{ mensaje: string }>('/v1/identity/auth/olvide-contrasena', { correo })
  return data
}

export async function obtenerYo(): Promise<UsuarioResponse> {
  const { data } = await api.get<UsuarioResponse>('/v1/identity/auth/yo')
  return data
}

export async function actualizarPerfil(nombreCompleto: string): Promise<UsuarioResponse> {
  const { data } = await api.put<UsuarioResponse>('/v1/identity/usuarios/yo', { nombreCompleto })
  return data
}

export async function listarSucursales(params?: {
  activa?: boolean
  nombre?: string
  page?: number
  size?: number
}): Promise<PaginaResponse<SucursalResponse>> {
  const { data } = await api.get<PaginaResponse<SucursalResponse>>('/v1/identity/sucursales', { params })
  return data
}

export async function listarUsuarios(params?: {
  rol?: RolBackend
  idSucursal?: string
  activo?: boolean
  texto?: string
  page?: number
  size?: number
}): Promise<PaginaResponse<UsuarioResponse>> {
  const { data } = await api.get<PaginaResponse<UsuarioResponse>>('/v1/identity/usuarios', { params })
  return data
}

export async function crearUsuario(payload: {
  nombreCompleto: string
  correo: string
  rol: RolBackend
  idSucursal: string | null
}): Promise<UsuarioResponse> {
  const { data } = await api.post<UsuarioResponse>('/v1/identity/usuarios', payload)
  return data
}

export async function crearSucursal(payload: {
  sucursal: {
    nombre: string
    departamento?: string
    direccion?: string
    telefono?: string
    latitud?: number
    longitud?: number
  }
  administrador: { nombreCompleto: string; correo: string }
}): Promise<{ sucursal: SucursalResponse }> {
  const { data } = await api.post<{ sucursal: SucursalResponse }>('/v1/identity/sucursales', payload)
  return data
}
