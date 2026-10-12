import type { BadgeTone, IconName } from '../../types'
import { Badge } from './Badge'
import { Icon } from './Icon'

interface KpiCardProps {
  label: string
  value: string
  delta: string
  icon: IconName
  tone?: string
  hint?: string
  progress?: number
  deltaTone?: BadgeTone
}

export function KpiCard({
  label,
  value,
  delta,
  icon,
  tone = '',
  hint,
  progress,
  deltaTone,
}: KpiCardProps) {
  const badgeTone: BadgeTone =
    deltaTone ?? (delta.startsWith('+') ? 'success' : 'neutral')

  return (
    <article className={`kpi ${tone}`.trim()}>
      <div className="kpi-top">
        <span className="kpi-icon">
          <Icon name={icon} />
        </span>
        <Badge tone={badgeTone}>{delta}</Badge>
      </div>
      <strong>{value}</strong>
      <span>{label}</span>
      {typeof progress === 'number' && (
        <div
          className="kpi-progress"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        >
          <i style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
      )}
      {hint && <small className="kpi-hint">{hint}</small>}
    </article>
  )
}
