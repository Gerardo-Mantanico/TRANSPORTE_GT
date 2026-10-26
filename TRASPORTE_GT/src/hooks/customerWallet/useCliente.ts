import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import {
  actualizarMiPerfilCliente,
  buscarClientePorNit,
  obtenerMiPerfilCliente,
  republicarEventosClientes,
} from '../../services/customerWallet'
import type { ActualizarPerfilClienteRequest } from '../../types/customerWalletTypes'

export function usePerfilCliente(habilitada = true) {
  return useConsulta((signal) => obtenerMiPerfilCliente(signal), 'perfil-cliente', habilitada)
}

const editarPerfil = (datos: ActualizarPerfilClienteRequest, signal: AbortSignal) =>
  actualizarMiPerfilCliente(datos, signal)

const buscarPorNit = (nit: string, signal: AbortSignal) => buscarClientePorNit(nit, signal)

const republicar = (_: void, signal: AbortSignal) => republicarEventosClientes(signal)

export function useEditarPerfilCliente() {
  return useMutacion(editarPerfil)
}

/** Búsqueda bajo demanda en el mostrador: `ejecutar(nit)`. */
export function useBuscarClientePorNit() {
  return useMutacion(buscarPorNit)
}

/** Vuelve a encolar PerfilClienteActualizado de todos los clientes. Solo ADMIN_SISTEMA. */
export function useRepublicarEventosClientes() {
  return useMutacion(republicar)
}
