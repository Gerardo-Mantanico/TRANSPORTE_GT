import { clienteFlota } from '../../api/clienteHttp'

/**
 * Las fotos son privadas: se descargan con el token (el gateway lo exige) y se muestran como object URL.
 * La ruta lleva `?v=` (cambia con cada foto nueva), así que se puede guardar en memoria por ruta.
 */
const MAXIMO_EN_MEMORIA = 100
const enMemoria = new Map<string, string>()

function recordar(ruta: string, url: string) {
  enMemoria.set(ruta, url)
  if (enMemoria.size > MAXIMO_EN_MEMORIA) {
    const [masVieja, urlVieja] = enMemoria.entries().next().value as [string, string]
    enMemoria.delete(masVieja)
    URL.revokeObjectURL(urlVieja)
  }
}

/** GET /buses/{id}/foto o /choferes/{id}/foto → object URL listo para `<img src>`. */
export async function obtenerFotoUrl(ruta: string, signal?: AbortSignal): Promise<string> {
  const guardada = enMemoria.get(ruta)
  if (guardada) return guardada
  const respuesta = await clienteFlota.get<Blob>(ruta, { responseType: 'blob', signal })
  const url = URL.createObjectURL(respuesta.data)
  recordar(ruta, url)
  return url
}

/** Al cerrar sesión: libera la memoria y no deja fotos privadas accesibles en la pestaña. */
export function olvidarFotos() {
  enMemoria.forEach((url) => URL.revokeObjectURL(url))
  enMemoria.clear()
}
