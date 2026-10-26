import type { IconName } from '../types'

/**
 * Icono que representa el campo de un formulario según su etiqueta.
 * Devuelve `undefined` cuando no hay un icono claro, para no mostrar uno engañoso.
 */
export function iconoDeCampo(etiqueta: string): IconName | undefined {
  const texto = etiqueta.toLocaleLowerCase('es')

  if (/sucursal/.test(texto)) return 'building'
  if (/correo|email/.test(texto)) return 'mail'
  if (/contrase/.test(texto)) return 'lock'
  if (/rol|usuario de acceso|permiso/.test(texto)) return 'users'
  if (/nit|dpi|licencia|documento|identificaci/.test(texto)) return 'doc'
  if (/tel[eé]fono/.test(texto)) return 'phone'
  if (/nombre|apellido|comprador|cliente|chofer/.test(texto)) return 'user'
  if (/fecha|desde|hasta|vencimiento|vigente|per[ií]odo/.test(texto)) return 'calendar'
  if (/hora|llegada|salida real/.test(texto)) return 'clock'
  if (
    /precio|monto|costo|salario|ingreso|gasto|recargar|descuento|cartera|pago|total|presupuesto/.test(
      texto,
    )
  )
    return 'wallet'
  if (/bus|placa|marca|modelo|kilometraje|flota|foto|fabricaci|capacidad/.test(texto)) return 'bus'
  if (/ruta|origen|destino|direcci|distancia|kil[oó]metro|latitud|longitud|salida|retorno/.test(texto))
    return 'route'
  if (/estado|tipo|categor|canal/.test(texto)) return 'settings'
  if (/pasajero|n[uú]mero/.test(texto)) return 'users'

  return undefined
}
