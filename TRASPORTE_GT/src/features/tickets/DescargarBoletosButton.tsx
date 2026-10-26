import { Button } from '../../components/ui/Button'
import { useDescargarBoletosPdf } from '../../hooks/tickets'
import type { ButtonVariant } from '../../types'
import type { Compra } from '../../types/ticketTypes'
import { guardarArchivo } from '../../utils/descargas'

interface DescargarBoletosButtonProps {
  compra: Compra
  variant?: ButtonVariant
  texto?: string
}

/** Descarga el PDF de una compra confirmada: un QR por boleto para presentarlo al abordar. */
export function DescargarBoletosButton({ compra, variant = 'secondary', texto = 'Boletos PDF' }: DescargarBoletosButtonProps) {
  const descargar = useDescargarBoletosPdf()

  if (compra.estado !== 'CONFIRMADA') return null

  const handleDescargar = async () => {
    const resultado = await descargar.ejecutar(compra.idCompra)
    if (resultado.ok) guardarArchivo(resultado.datos, `boletos-${compra.idCompra}.pdf`)
  }

  return (
    <span className="cell-stack">
      <Button variant={variant} icon="download" onClick={handleDescargar} disabled={descargar.cargando}>
        {descargar.cargando ? 'Generando...' : texto}
      </Button>
      {descargar.error && (
        <small className="cell-note error-text" role="alert">
          {descargar.error.message}
        </small>
      )}
    </span>
  )
}
