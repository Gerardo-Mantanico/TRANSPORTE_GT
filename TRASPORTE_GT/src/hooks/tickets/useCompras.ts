import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import {
  comprarEnLinea,
  descargarBoletosPdf,
  listarComprasSucursal,
  listarMisCompras,
  obtenerCompra,
  venderEnMostrador,
} from '../../services/tickets'
import type {
  CompraRequest,
  FiltroComprasSucursal,
  FiltroMisCompras,
  VentaMostradorRequest,
} from '../../types/ticketTypes'

export function useMisCompras(filtro: FiltroMisCompras) {
  return useConsulta((signal) => listarMisCompras(filtro, signal), JSON.stringify(filtro))
}

export function useComprasSucursal(filtro: FiltroComprasSucursal) {
  return useConsulta((signal) => listarComprasSucursal(filtro, signal), JSON.stringify(filtro))
}

export function useCompra(idCompra: string | null | undefined) {
  return useConsulta((signal) => obtenerCompra(idCompra ?? '', signal), idCompra ?? '', Boolean(idCompra))
}

const comprar = (datos: CompraRequest, signal: AbortSignal) => comprarEnLinea(datos, signal)
const consultar = (idCompra: string, signal: AbortSignal) => obtenerCompra(idCompra, signal)
const vender = (datos: VentaMostradorRequest, signal: AbortSignal) => venderEnMostrador(datos, signal)
const descargarPdf = (idCompra: string, signal: AbortSignal) => descargarBoletosPdf(idCompra, signal)

/** `datos.resultado` dice si quedó CONFIRMADA, EXISTENTE o PENDIENTE (202). Reintentar con el mismo idCompra. */
export function useComprarEnLinea() {
  return useMutacion(comprar)
}

/** Consulta bajo demanda (botón "Consultar estado" de una compra RESERVADA). */
export function useConsultarCompra() {
  return useMutacion(consultar)
}

export function useVenderEnMostrador() {
  return useMutacion(vender)
}

/** PDF de los boletos de una compra confirmada (un QR por boleto). */
export function useDescargarBoletosPdf() {
  return useMutacion(descargarPdf)
}
