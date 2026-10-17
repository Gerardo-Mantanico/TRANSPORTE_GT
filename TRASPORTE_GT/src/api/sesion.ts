const CLAVE_TOKEN = 'tgt-token'

export function leerToken(): string | null {
  try {
    return window.localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

export function guardarToken(token: string) {
  try {
    window.localStorage.setItem(CLAVE_TOKEN, token)
  } catch {
    // Sin almacenamiento la sesión dura solo mientras la pestaña esté abierta.
  }
}

export function borrarToken() {
  try {
    window.localStorage.removeItem(CLAVE_TOKEN)
  } catch {
    // Nada que borrar.
  }
}

/** Lee el claim `exp` (segundos) del JWT sin validar la firma. */
function expiracionJwt(token: string): number | null {
  const partes = token.split('.')
  if (partes.length !== 3) return null
  try {
    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/')
    const carga = JSON.parse(window.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))) as {
      exp?: unknown
    }
    return typeof carga.exp === 'number' ? carga.exp : null
  } catch {
    return null
  }
}

export function tokenVigente(token: string | null): token is string {
  if (!token) return false
  const exp = expiracionJwt(token)
  return exp !== null && exp * 1000 > Date.now()
}

/**
 * Avisa cuando otra pestaña inicia o cierra la sesión.
 * El evento `storage` solo se dispara en las pestañas que no hicieron el cambio.
 */
export function escucharCambiosToken(alCambiar: (token: string | null) => void): () => void {
  const manejador = (evento: StorageEvent) => {
    if (evento.key === CLAVE_TOKEN || evento.key === null) alCambiar(leerToken())
  }
  window.addEventListener('storage', manejador)
  return () => window.removeEventListener('storage', manejador)
}
