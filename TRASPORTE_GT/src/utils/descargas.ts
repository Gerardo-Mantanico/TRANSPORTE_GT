/** Descarga un archivo generado en memoria (PDF de boletos, etc.). */
export function guardarArchivo(contenido: Blob, nombre: string) {
  const url = URL.createObjectURL(contenido)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.append(enlace)
  enlace.click()
  enlace.remove()
  // El navegador ya tomó el archivo; liberar la URL en el siguiente ciclo
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
