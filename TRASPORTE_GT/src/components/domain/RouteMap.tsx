import { resolveRoutePoint } from '../../data/mock'
import { Icon } from '../ui/Icon'

interface RouteMapProps {
  origin: string
  destination: string
  onHide?: () => void
  compact?: boolean
}

const ORIGIN_POINT = { x: 555, y: 88 }

export function RouteMap({ origin, destination, onHide, compact = false }: RouteMapProps) {
  const point = resolveRoutePoint(destination)
  const routePath = `M ${ORIGIN_POINT.x} ${ORIGIN_POINT.y} C ${ORIGIN_POINT.x - 55} ${ORIGIN_POINT.y + 8}, ${point.x + 75} ${point.y - 30}, ${point.x} ${point.y}`

  return (
    <section className={`route-preview ${compact ? 'compact' : ''}`.trim()}>
      {!compact && (
        <div className="route-preview-head">
          <div>
            <span className="eyebrow">Vista de la ruta</span>
            <h2>
              {origin} <span>→</span> {destination}
            </h2>
          </div>
          <div className="route-preview-metrics">
            <span>
              <Icon name="route" size={15} />
              <strong>{point.distance}</strong>
              <small>Distancia estimada</small>
            </span>
            <span>
              <Icon name="clock" size={15} />
              <strong>{point.duration}</strong>
              <small>Duración estimada</small>
            </span>
            {onHide && (
              <button onClick={onHide} aria-label="Ocultar mapa">
                <Icon name="close" size={16} />
              </button>
            )}
          </div>
        </div>
      )}
      <div className="route-map-canvas">
        <svg viewBox="0 0 700 230" role="img" aria-label={`Mapa de la ruta de ${origin} a ${destination}`}>
          <defs>
            <pattern id="map-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M36 0H0V36" fill="none" stroke="currentColor" strokeWidth=".55" />
            </pattern>
            <filter id="map-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity=".2" />
            </filter>
          </defs>
          <rect width="700" height="230" className="map-ground" />
          <rect width="700" height="230" fill="url(#map-grid)" className="map-grid" />
          <path
            className="map-zone"
            d="M-20 175 C80 140 105 185 205 156 S340 120 440 158 590 203 730 144V250H-20Z"
          />
          <path className="map-road minor" d="M-20 60C120 100 190 16 325 64S540 123 730 38" />
          <path
            className="map-road minor"
            d="M62-10C94 72 126 117 90 250M280-10C302 50 272 147 318 250M620-10C584 76 640 145 584 250"
          />
          <path
            className="map-road major"
            d="M-20 195C90 172 160 202 245 166S390 86 505 112 610 177 730 158"
          />
          <path className="map-route-shadow" d={routePath} />
          <path className="map-route" d={routePath} />
          <circle cx={ORIGIN_POINT.x} cy={ORIGIN_POINT.y} r="13" className="map-marker-halo" />
          <circle
            cx={ORIGIN_POINT.x}
            cy={ORIGIN_POINT.y}
            r="7"
            className="map-marker start"
            filter="url(#map-shadow)"
          />
          <circle cx={point.x} cy={point.y} r="15" className="map-marker-halo destination" />
          <path
            className="map-pin"
            filter="url(#map-shadow)"
            transform={`translate(${point.x - 10} ${point.y - 27})`}
            d="M10 0a10 10 0 0 0-10 10c0 7.5 10 17 10 17s10-9.5 10-17A10 10 0 0 0 10 0Zm0 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
          />
          <g className="map-city-label" transform={`translate(${ORIGIN_POINT.x - 113} ${ORIGIN_POINT.y - 25})`}>
            <rect width="105" height="25" rx="7" />
            <text x="10" y="16">{origin}</text>
          </g>
          <g
            className="map-city-label destination"
            transform={`translate(${Math.max(10, point.x - 48)} ${Math.min(200, point.y + 20)})`}
          >
            <rect width="98" height="25" rx="7" />
            <text x="10" y="16">{destination}</text>
          </g>
        </svg>
        <div className="map-controls">
          <button aria-label="Acercar">+</button>
          <button aria-label="Alejar">−</button>
        </div>
        <div className="map-route-chip">
          <Icon name="bus" size={15} />
          <span>Ruta regular disponible</span>
        </div>
      </div>
      {!compact && (
        <div className="route-preview-foot">
          <span>
            <Icon name="check" size={14} /> La ruta mostrada es referencial y puede variar según el
            tránsito.
          </span>
          {onHide && <button onClick={onHide}>Ocultar mapa</button>}
        </div>
      )}
    </section>
  )
}
