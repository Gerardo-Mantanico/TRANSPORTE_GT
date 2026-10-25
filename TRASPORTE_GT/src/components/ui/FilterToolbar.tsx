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

export function FilterToolbar({ action, onAction, children }: FilterToolbarProps) {
  const [period, setPeriod] = useState<string>('Todo')
  const [showFilters, setShowFilters] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const hasActiveFilters = period !== 'Todo'

  const handleReset = () => {
    setPeriod('Todo')
    setResetKey((key) => key + 1)
  }

  return (
    <div className="filter-shell">
      <div className="toolbar">
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
          {hasActiveFilters && <b>1</b>}
          <Icon name="chevron" size={14} />
        </button>
        {action && onAction && (
          <Button onClick={onAction} icon="plus" className="toolbar-action">
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
