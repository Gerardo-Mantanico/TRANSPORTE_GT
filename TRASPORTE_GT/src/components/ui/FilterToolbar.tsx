import { useState, type ReactNode } from 'react'
import { Icon } from './Icon'
import { Button } from './Button'

const PERIODS = ['Todo', 'Hoy', '7 días', 'Este mes'] as const

interface FilterToolbarProps {
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  action?: string
  onAction?: () => void
  children?: ReactNode
}

export function FilterToolbar({
  searchPlaceholder = 'Buscar...',
  onSearch,
  action,
  onAction,
  children,
}: FilterToolbarProps) {
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState<string>('Todo')
  const [showFilters, setShowFilters] = useState(true)
  const [resetKey, setResetKey] = useState(0)
  const hasActiveFilters = query.length > 0 || period !== 'Todo'

  const handleReset = () => {
    setQuery('')
    onSearch?.('')
    setPeriod('Todo')
    setResetKey((key) => key + 1)
  }

  return (
    <div className="filter-shell">
      <div className="toolbar">
        <label className="search">
          <Icon name="search" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              onSearch?.(event.target.value)
            }}
            placeholder={searchPlaceholder}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                onSearch?.('')
              }}
              aria-label="Limpiar búsqueda"
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </label>
        <div className="period-filter" aria-label="Periodo">
          {PERIODS.map((option) => (
            <button
              key={option}
              className={period === option ? 'active' : ''}
              onClick={() => setPeriod(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          className={`filter-toggle ${showFilters ? 'active' : ''}`.trim()}
          onClick={() => setShowFilters((open) => !open)}
        >
          <Icon name="grid" size={16} />
          <span>Más filtros</span>
          {hasActiveFilters && <b>{Number(query.length > 0) + Number(period !== 'Todo')}</b>}
          <Icon name="chevron" size={14} />
        </button>
        {action && onAction && (
          <Button onClick={onAction} icon="plus">
            {action}
          </Button>
        )}
      </div>
      {showFilters && (
        <div className="filter-panel" key={resetKey}>
          <div className="filters">{children}</div>
          <div className="filter-actions">
            <button onClick={handleReset} disabled={!hasActiveFilters}>
              Restablecer
            </button>
            <Button variant="secondary">Aplicar filtros</Button>
          </div>
        </div>
      )}
      <div className="filter-status">
        <div>
          {query && (
            <span>
              Coincide con: <strong>“{query}”</strong>
              <button
                onClick={() => {
                  setQuery('')
                  onSearch?.('')
                }}
              >
                <Icon name="close" size={12} />
              </button>
            </span>
          )}
          {period !== 'Todo' && (
            <span>
              Periodo: <strong>{period}</strong>
              <button onClick={() => setPeriod('Todo')}>
                <Icon name="close" size={12} />
              </button>
            </span>
          )}
          {!hasActiveFilters && <small>Mostrando todos los registros</small>}
        </div>
        <button className="save-filter">
          <Icon name="check" size={14} /> Guardar vista
        </button>
      </div>
    </div>
  )
}
