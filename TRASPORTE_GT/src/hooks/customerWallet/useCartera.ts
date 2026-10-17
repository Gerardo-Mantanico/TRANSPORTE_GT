import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import { listarMovimientos, obtenerMiCartera, recargarCartera } from '../../services/customerWallet'
import type { FiltroMovimientos, RecargaRequest } from '../../types/customerWalletTypes'

export function useCartera(habilitada = true) {
  return useConsulta((signal) => obtenerMiCartera(signal), 'cartera', habilitada)
}

export function useMovimientos(filtro: FiltroMovimientos, habilitada = true) {
  return useConsulta((signal) => listarMovimientos(filtro, signal), JSON.stringify(filtro), habilitada)
}

const recargar = (
  { claveIdempotencia, ...datos }: RecargaRequest & { claveIdempotencia: string },
  signal: AbortSignal,
) => recargarCartera(datos, claveIdempotencia, signal)

/** `ejecutar({ monto, fechaRecarga, claveIdempotencia })`; repita la clave si reintenta la misma recarga. */
export function useRecargarCartera() {
  return useMutacion(recargar)
}
