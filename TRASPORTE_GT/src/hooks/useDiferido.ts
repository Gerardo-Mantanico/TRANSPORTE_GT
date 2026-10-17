import { useEffect, useState } from 'react'

/** Devuelve `valor` cuando deja de cambiar durante `espera` ms (útil para búsquedas). */
export function useDiferido<T>(valor: T, espera = 350): T {
  const [diferido, setDiferido] = useState(valor)

  useEffect(() => {
    const temporizador = window.setTimeout(() => setDiferido(valor), espera)
    return () => window.clearTimeout(temporizador)
  }, [valor, espera])

  return diferido
}
