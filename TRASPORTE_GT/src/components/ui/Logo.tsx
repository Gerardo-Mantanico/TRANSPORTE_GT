interface LogoProps {
  compact?: boolean
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className={`logo ${compact ? 'compact' : ''}`.trim()}>
      <span className="logo-mark">
        <span />
        <span />
      </span>
      {!compact && (
        <span>
          <strong>TRANSPORTE_GT</strong>
          <small>Movilidad que conecta</small>
        </span>
      )}
    </div>
  )
}
