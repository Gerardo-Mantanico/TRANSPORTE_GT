/** Cuerpo de toda respuesta de error de los microservicios (`RespuestaError`). */
export interface RespuestaError {
  timestamp: string
  status: number
  /** Mensaje legible para el usuario. */
  error: string
  /** Código estable, p. ej. `USUARIO_NO_ENCONTRADO`. */
  codigo: string
  ruta: string
}
