export function formatQ(amount: number): string {
  return `Q ${amount.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatQCompact(amount: number): string {
  return `Q ${amount.toLocaleString('es-GT', { maximumFractionDigits: 0 })}`
}

export function parseQ(value: string): number {
  return Number(value.replace(/[^\d.-]/g, '')) || 0
}

export function formatDateEs(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  if (!year || !month || !day) return iso
  return `${String(day).padStart(2, '0')} ${months[month - 1]} ${year}`
}

export function exportToPdf() {
  window.print()
}

/** Dos iniciales: "Ana María López" → "AL". */
export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (!partes.length) return '?'
  const primera = partes[0][0]
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return `${primera}${ultima}`.toUpperCase()
}

/** Fecha ISO (con hora) a "12 de marzo de 2024". */
export function formatFechaLarga(iso: string | null | undefined): string {
  if (!iso) return '—'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return fecha.toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Monto que llega como texto del backend (`"1250.00"`) a "Q 1,250.00". */
export function formatMonto(monto: string | null | undefined): string {
  const valor = Number(monto)
  return Number.isFinite(valor) ? formatQ(valor) : '—'
}

/** Fecha de hoy `YYYY-MM-DD` en la zona horaria local (no en UTC). */
export function hoyIso(): string {
  const ahora = new Date()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${ahora.getFullYear()}-${mes}-${dia}`
}

const ZONA_GUATEMALA = 'America/Guatemala'

/** Hora de Guatemala de una fecha ISO: "07:30". */
export function formatHora(iso: string | null | undefined): string {
  if (!iso) return '—'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return fecha.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: ZONA_GUATEMALA })
}

/** Fecha corta de Guatemala: "25 oct 2026". */
export function formatFechaCorta(iso: string | null | undefined): string {
  if (!iso) return '—'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return fecha.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric', timeZone: ZONA_GUATEMALA })
}

/** "25 oct 2026 · 07:30" en hora de Guatemala. */
export function formatFechaHora(iso: string | null | undefined): string {
  return iso ? `${formatFechaCorta(iso)} · ${formatHora(iso)}` : '—'
}
