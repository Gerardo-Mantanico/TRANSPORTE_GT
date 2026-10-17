import type { Pagina } from '../../types/pagina'

interface PaginacionProps {
  pagina: Pagina<unknown> | null
  onCambiar: (pagina: number) => void
  deshabilitada?: boolean
}

const VISIBLES = 5

export function Paginacion({ pagina, onCambiar, deshabilitada = false }: PaginacionProps) {
  const total = pagina?.totalElementos ?? 0
  const actual = pagina?.pagina ?? 0
  const totalPaginas = Math.max(pagina?.totalPaginas ?? 1, 1)
  const desde = total ? actual * (pagina?.tamano ?? 0) + 1 : 0
  const hasta = total ? desde + (pagina?.contenido.length ?? 0) - 1 : 0
  const inicio = Math.max(0, Math.min(actual - Math.floor(VISIBLES / 2), totalPaginas - VISIBLES))
  const numeros = Array.from({ length: Math.min(VISIBLES, totalPaginas) }, (_, indice) => inicio + indice)

  return (
    <div className="pagination">
      <span>
        Mostrando {total ? `${desde}–${hasta}` : '0'} de {total}
      </span>
      <div>
        <button
          disabled={deshabilitada || actual <= 0}
          onClick={() => onCambiar(actual - 1)}
          aria-label="Página anterior"
        >
          ‹
        </button>
        {numeros.map((numero) => (
          <button
            key={numero}
            className={numero === actual ? 'active' : ''}
            disabled={deshabilitada}
            onClick={() => onCambiar(numero)}
            aria-current={numero === actual ? 'page' : undefined}
          >
            {numero + 1}
          </button>
        ))}
        <button
          disabled={deshabilitada || actual >= totalPaginas - 1}
          onClick={() => onCambiar(actual + 1)}
          aria-label="Página siguiente"
        >
          ›
        </button>
      </div>
    </div>
  )
}
