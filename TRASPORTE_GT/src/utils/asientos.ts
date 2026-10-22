/** Asientos por fila del plano (`SeatMap`): A1–A4, B1–B4, … */
const POR_FILA = 4

/** Número del backend (desde 1) → etiqueta del plano: 1 → "A1", 6 → "B2". */
export function etiquetaAsiento(numero: number): string {
  const indice = numero - 1
  return `${String.fromCharCode(65 + Math.floor(indice / POR_FILA))}${(indice % POR_FILA) + 1}`
}

/** Etiqueta del plano → número del backend: "B2" → 6. */
export function numeroAsiento(etiqueta: string): number {
  const fila = etiqueta.charCodeAt(0) - 65
  const columna = Number(etiqueta.slice(1))
  return fila * POR_FILA + columna
}

/** Números ocupados del backend → índices (desde 0) que espera `SeatMap`. */
export function indicesOcupados(ocupados: number[]): number[] {
  return ocupados.map((numero) => numero - 1)
}

export function ordenarEtiquetas(etiquetas: string[]): string[] {
  return [...etiquetas].sort((a, b) => numeroAsiento(a) - numeroAsiento(b))
}
