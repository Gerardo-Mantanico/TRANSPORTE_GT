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
