import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import {
  actualizarMiPerfilCliente,
  buscarClientePorNit,
  obtenerMiPerfilCliente,
} from '../../services/customerWallet'
import type { ActualizarPerfilClienteRequest } from '../../types/customerWalletTypes'

export function usePerfilCliente(habilitada = true) {
  return useConsulta((signal) => obtenerMiPerfilCliente(signal), 'perfil-cliente', habilitada)
}

const editarPerfil = (datos: ActualizarPerfilClienteRequest, signal: AbortSignal) =>
  actualizarMiPerfilCliente(datos, signal)

const buscarPorNit = (nit: string, signal: AbortSignal) => buscarClientePorNit(nit, signal)

export function useEditarPerfilCliente() {
  return useMutacion(editarPerfil)
}

/** Búsqueda bajo demanda en el mostrador: `ejecutar(nit)`. */
export function useBuscarClientePorNit() {
  return useMutacion(buscarPorNit)
}
