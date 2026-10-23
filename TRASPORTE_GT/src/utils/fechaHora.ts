/** Guatemala no tiene horario de verano: siempre UTC-6. */
const OFFSET_GUATEMALA = '-06:00'
const ZONA_GUATEMALA = 'America/Guatemala'

/** Valor de `<input type="datetime-local">` (`YYYY-MM-DDTHH:mm`, hora de Guatemala) → ISO con zona. */
export function aIsoGuatemala(local: string): string {
  return `${local.length === 16 ? `${local}:00` : local}${OFFSET_GUATEMALA}`
}

/** ISO (cualquier zona) → valor para `<input type="datetime-local">` en hora de Guatemala. */
export function aLocalGuatemala(iso: string): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_GUATEMALA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso))
  const valor = (tipo: string) => partes.find((parte) => parte.type === tipo)?.value ?? '00'
  const hora = valor('hour') === '24' ? '00' : valor('hour')
  return `${valor('year')}-${valor('month')}-${valor('day')}T${hora}:${valor('minute')}`
}

/** Ahora (o desplazado en horas) para `<input type="datetime-local">`, en hora de Guatemala. */
export function ahoraLocalGuatemala(desplazamientoHoras = 0): string {
  return aLocalGuatemala(new Date(Date.now() + desplazamientoHoras * 3_600_000).toISOString())
}

/** Suma horas a un valor `datetime-local` (hora de Guatemala). */
export function sumarHorasLocal(local: string, horas: number): string {
  return aLocalGuatemala(new Date(new Date(aIsoGuatemala(local)).getTime() + horas * 3_600_000).toISOString())
}

/** Inicio y fin de un día `YYYY-MM-DD` de Guatemala, como ISO con zona. */
export function inicioDiaGuatemala(fecha: string): string {
  return `${fecha}T00:00:00${OFFSET_GUATEMALA}`
}

export function finDiaGuatemala(fecha: string): string {
  return `${fecha}T23:59:59${OFFSET_GUATEMALA}`
}
