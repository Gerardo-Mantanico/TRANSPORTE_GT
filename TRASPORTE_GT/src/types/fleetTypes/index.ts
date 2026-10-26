export * from './bus'
export * from './chofer'
export * from './filtros'
export type { RespuestaError } from '../respuestaError'

/** Fotos: JPEG, PNG o WebP de hasta 5 MB (`flota.fotos.tamanio-maximo-bytes`). */
export const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp']
export const TAMANO_MAXIMO_FOTO = 5 * 1024 * 1024
