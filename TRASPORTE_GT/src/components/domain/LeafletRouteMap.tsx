import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { GEO_POINTS } from '../../data/mock'

export interface PuntoMapa {
  lat: number
  lng: number
}

export interface MapRoute {
  origin: string
  destination: string
  label?: string
  /** Coordenadas reales (reporte de mapa de rutas); sin ellas se buscan por nombre. */
  from?: PuntoMapa
  to?: PuntoMapa
}

interface LeafletRouteMapProps {
  routes: MapRoute[]
  height?: number
}

export function LeafletRouteMap({ routes, height = 420 }: LeafletRouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([14.65, -90.7], 8)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    layer.clearLayers()

    const bounds: L.LatLngTuple[] = []

    routes.forEach((route) => {
      const from = route.from ?? GEO_POINTS[route.origin]
      const to = route.to ?? GEO_POINTS[route.destination]
      if (!from || !to) return

      bounds.push([from.lat, from.lng], [to.lat, to.lng])

      L.circleMarker([from.lat, from.lng], {
        radius: 7,
        color: '#1d4ed8',
        fillColor: '#3b82f6',
        fillOpacity: 1,
      })
        .bindPopup(`<strong>${route.origin}</strong><br/>Sucursal de origen`)
        .addTo(layer)

      L.circleMarker([to.lat, to.lng], {
        radius: 6,
        color: '#0f766e',
        fillColor: '#14b8a6',
        fillOpacity: 1,
      })
        .bindPopup(`<strong>${route.destination}</strong><br/>Destino`)
        .addTo(layer)

      L.polyline(
        [
          [from.lat, from.lng],
          [to.lat, to.lng],
        ],
        { color: '#2563eb', weight: 3, opacity: 0.85, dashArray: '6 8' },
      )
        .bindPopup(
          `<strong>${route.origin} → ${route.destination}</strong>${route.label ? `<br/>${route.label}` : ''}`,
        )
        .addTo(layer)
    })

    if (bounds.length) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 })
    }
  }, [routes])

  return (
    <div
      ref={containerRef}
      className="leaflet-route-map"
      style={{ height }}
      role="img"
      aria-label="Mapa de rutas"
    />
  )
}
