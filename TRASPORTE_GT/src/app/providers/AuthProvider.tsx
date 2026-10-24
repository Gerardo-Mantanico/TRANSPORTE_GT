import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { esCancelacion } from '../../api/ApiError'
import { alRecibirNoAutorizado } from '../../api/clienteHttp'
import { borrarToken, escucharCambiosToken, guardarToken, leerToken, tokenVigente } from '../../api/sesion'
import { olvidarFotos } from '../../services/fleet'
import { login as iniciarSesion, obtenerYo } from '../../services/identity'
import type { Rol, Usuario } from '../../types/identityTypes'
import { AuthContext, type AuthContextValue, type EstadoSesion } from './auth.context'

function estadoInicial(): EstadoSesion {
  if (tokenVigente(leerToken())) return 'cargando'
  borrarToken()
  return 'anonimo'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [estado, setEstado] = useState<EstadoSesion>(estadoInicial)

  const cerrarSesionLocal = useCallback(() => {
    borrarToken()
    // Las fotos privadas descargadas no deben quedar accesibles tras cerrar sesión
    olvidarFotos()
    setUsuario(null)
    setEstado('anonimo')
  }, [])

  const cargarUsuario = useCallback(
    (signal?: AbortSignal) =>
      obtenerYo(signal).then(
        (yo) => {
          setUsuario(yo)
          setEstado('autenticado')
        },
        (error: unknown) => {
          if (!esCancelacion(error)) cerrarSesionLocal()
        },
      ),
    [cerrarSesionLocal],
  )

  // Restaura la sesión al recargar si el token guardado no ha expirado.
  useEffect(() => {
    if (!tokenVigente(leerToken())) return
    const controlador = new AbortController()
    void cargarUsuario(controlador.signal)
    return () => controlador.abort()
  }, [cargarUsuario])

  // Un 401 en una petición con token cierra la sesión.
  useEffect(() => alRecibirNoAutorizado(cerrarSesionLocal), [cerrarSesionLocal])

  // Sincroniza el inicio y el cierre de sesión entre pestañas.
  useEffect(
    () =>
      escucharCambiosToken((token) => {
        if (tokenVigente(token)) void cargarUsuario()
        else {
          setUsuario(null)
          setEstado('anonimo')
        }
      }),
    [cargarUsuario],
  )

  const login = useCallback<AuthContextValue['login']>(
    async (credenciales) => {
      const respuesta = await iniciarSesion(credenciales)
      guardarToken(respuesta.token)
      try {
        const yo = await obtenerYo()
        setUsuario(yo)
        setEstado('autenticado')
        return yo
      } catch (error) {
        cerrarSesionLocal()
        throw error
      }
    },
    [cerrarSesionLocal],
  )

  const refrescarUsuario = useCallback(async () => {
    const yo = await obtenerYo()
    setUsuario(yo)
  }, [])

  const tieneRol = useCallback(
    (...roles: Rol[]) => usuario !== null && roles.includes(usuario.rol),
    [usuario],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ usuario, estado, login, logout: cerrarSesionLocal, refrescarUsuario, tieneRol }),
    [usuario, estado, login, cerrarSesionLocal, refrescarUsuario, tieneRol],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
