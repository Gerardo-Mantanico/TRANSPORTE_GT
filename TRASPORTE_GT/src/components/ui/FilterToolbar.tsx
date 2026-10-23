import { useState } from 'react'
import { Button } from './Button'

const PERIODS = ['Todo', 'Hoy', '7 días', 'Este mes'] as const

interface FilterToolbarProps {
  action?: string
  onAction?: () => void
}

export function FilterToolbar({ action, onAction }: FilterToolbarProps) {
  const [period, setPeriod] = useState<string>('Todo')

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
        {action && onAction && (
          <Button onClick={onAction} icon="plus">
            {action}
          </Button>
        )}
      </div>
    </div>
  )
}
