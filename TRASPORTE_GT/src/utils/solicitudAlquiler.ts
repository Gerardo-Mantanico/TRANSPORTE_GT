import { FACTOR_CARRETERA, type SolicitudAlquilerRequest, type Tarifa } from '../types/rentalTypes'
import { aIsoGuatemala, ahoraLocalGuatemala, sumarHorasLocal } from './fechaHora'

/** Punto elegido en el mapa: `[latitud, longitud]`. */
export type Punto = [number, number]

/** Estado del formulario de solicitud (en línea y en mostrador). Las fechas son `datetime-local` de Guatemala. */
export interface FormularioSolicitud {
  idSucursalOrigen: string
  origen: string
  destino: string
  salida: string
  idaYVuelta: boolean
  retorno: string
  pasajeros: string
  /** Solo se usa si no se marcaron los dos puntos en el mapa. */
  distanciaKm: string
  puntoOrigen: Punto | null
  puntoDestino: Punto | null
}

export function formularioInicial(idSucursalOrigen = ''): FormularioSolicitud {
  const salida = ahoraLocalGuatemala(48)
  return {
    idSucursalOrigen,
    origen: '',
    destino: '',
    salida,
    idaYVuelta: false,
    retorno: sumarHorasLocal(salida, 24),
    pasajeros: '20',
    distanciaKm: '',
    puntoOrigen: null,
    puntoDestino: null,
  }
}

export function tieneCoordenadas(formulario: FormularioSolicitud): boolean {
  return formulario.puntoOrigen !== null && formulario.puntoDestino !== null
}

const RADIO_TIERRA_KM = 6371

/** Haversine × factor de carretera, como `CalculadoraDistancia` del backend (solo para el estimado previo). */
function distanciaCarretera([lat1, lon1]: Punto, [lat2, lon2]: Punto): number {
  const rad = (grados: number) => (grados * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLon = rad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2
  return RADIO_TIERRA_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * FACTOR_CARRETERA
}

/** Distancia que usará el backend: la de los puntos del mapa o la indicada a mano. null si falta. */
export function distanciaEstimada(formulario: FormularioSolicitud): number | null {
  if (formulario.puntoOrigen && formulario.puntoDestino) {
    return Math.round(distanciaCarretera(formulario.puntoOrigen, formulario.puntoDestino) * 100) / 100
  }
  const manual = Number(formulario.distanciaKm)
  return formulario.distanciaKm && manual > 0 ? manual : null
}

/** Días calendario de Guatemala, salida y retorno incluidos; solo ida cuenta 1 (igual que el backend). */
export function diasAlquiler(formulario: FormularioSolicitud): number {
  if (!formulario.idaYVuelta || !formulario.retorno) return 1
  const dia = (local: string) => Date.UTC(Number(local.slice(0, 4)), Number(local.slice(5, 7)) - 1, Number(local.slice(8, 10)))
  return Math.max(1, Math.round((dia(formulario.retorno) - dia(formulario.salida)) / 86_400_000) + 1)
}

/** Estimado previo con la tarifa vigente; el precio que vale es el que devuelve el backend al solicitar. */
export function precioPrevio(formulario: FormularioSolicitud, tarifa: Tarifa | null): number | null {
  const distancia = distanciaEstimada(formulario)
  if (!tarifa || distancia === null) return null
  const kilometros = formulario.idaYVuelta ? distancia * 2 : distancia
  return Math.round((kilometros * tarifa.precioPorKm + diasAlquiler(formulario) * tarifa.precioPorDia) * 100) / 100
}

/** Mensaje del primer dato que falta o no cuadra; null si se puede enviar. */
export function validarFormulario(formulario: FormularioSolicitud): string | null {
  if (!formulario.idSucursalOrigen) return 'Elija la sucursal de origen.'
  if (!formulario.origen.trim() || !formulario.destino.trim()) return 'Indique el origen y el destino.'
  if (!formulario.salida) return 'Indique la fecha y hora de salida.'
  if (new Date(aIsoGuatemala(formulario.salida)).getTime() <= Date.now()) return 'La fecha de salida ya pasó.'
  if (formulario.idaYVuelta && (!formulario.retorno || formulario.retorno <= formulario.salida))
    return 'El retorno debe ser posterior a la salida.'
  const pasajeros = Number(formulario.pasajeros)
  if (!Number.isInteger(pasajeros) || pasajeros < 1 || pasajeros > 300) return 'Los pasajeros deben ser entre 1 y 300.'
  if (distanciaEstimada(formulario) === null) return 'Marque el origen y el destino en el mapa.'
  return null
}

export function aSolicitudRequest(formulario: FormularioSolicitud): SolicitudAlquilerRequest {
  const coordenadas =
    formulario.puntoOrigen && formulario.puntoDestino
      ? {
          latitudOrigen: redondear(formulario.puntoOrigen[0]),
          longitudOrigen: redondear(formulario.puntoOrigen[1]),
          latitudDestino: redondear(formulario.puntoDestino[0]),
          longitudDestino: redondear(formulario.puntoDestino[1]),
          distanciaEstimadaKm: distanciaEstimada(formulario),
        }
      : { distanciaEstimadaKm: Number(formulario.distanciaKm) }
  return {
    idSucursalOrigen: formulario.idSucursalOrigen,
    origen: formulario.origen.trim(),
    destino: formulario.destino.trim(),
    fechaHoraSalida: aIsoGuatemala(formulario.salida),
    idaYVuelta: formulario.idaYVuelta,
    fechaHoraRetorno: formulario.idaYVuelta ? aIsoGuatemala(formulario.retorno) : null,
    numeroPasajeros: Number(formulario.pasajeros),
    ...coordenadas,
  }
}

/** La base guarda 6 decimales (NUMERIC(9,6)). */
function redondear(grados: number): number {
  return Math.round(grados * 1e6) / 1e6
}
