import type { IconName } from '../types'

function buscar(etiqueta: string): IconName | undefined {
  const texto = etiqueta.toLocaleLowerCase('es')

  if (/elimin|borrar|quitar/.test(texto)) return 'trash'
  if (/activar|desactivar/.test(texto)) return 'power'
  if (/pagar|cobrar|cartera|pago|precio/.test(texto)) return 'wallet'
  if (/asignar/.test(texto)) return /bus/.test(texto) ? 'bus' : 'users'
  if (/edit/.test(texto)) return 'edit'
  if (/estado/.test(texto)) return 'settings'
  if (/salida/.test(texto)) return 'arrow'
  if (/reenviar|correo|enviar/.test(texto)) return 'mail'
  if (/detalle|ver|historial/.test(texto)) return 'eye'
  if (/crear|registrar|programar|nueva|nuevo|agregar|cotizar/.test(texto)) return 'plus'
  if (/actualizar|recargar|reintentar|revisar/.test(texto)) return 'sync'
  if (/rol|usuario|cliente|sucursal/.test(texto)) return 'users'

  return undefined
}

/** Icono que mejor representa la etiqueta de una acción (guardar, eliminar, pagar…). */
export function iconoDeAccion(etiqueta: string): IconName {
  return buscar(etiqueta) ?? 'check'
}

/** Igual que `iconoDeAccion`, pero sin recurso por omisión: `undefined` si no hay icono claro. */
export function iconoDeEncabezado(etiqueta: string): IconName | undefined {
  return buscar(etiqueta)
}
