import type { Cliente } from '../types/customerWalletTypes'

/** La cartera queda bloqueada si el usuario fue desactivado en Identidad. */
export function carteraBloqueada(cliente: Cliente | null): boolean {
  return cliente?.activo === false
}

/** Sin NIT no se puede comprar ni alquilar en línea (422 PERFIL_INCOMPLETO); CF nunca es NIT de cliente. */
export function puedeOperarEnLinea(cliente: Cliente | null): boolean {
  return cliente !== null && !carteraBloqueada(cliente) && Boolean(cliente.nit)
}
