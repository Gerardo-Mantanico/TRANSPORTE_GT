import { useEffect, useEffectEvent, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Punto } from '../../utils/solicitudAlquiler'

interface SelectorPuntosMapaProps {
  origen: Punto | null
  destino: Punto | null
  onCambiar: (origen: Punto | null, destino: Punto | null) => void
  height?: number
}

type Marcando = 'origen' | 'destino'

/**
 * Mapa para marcar el origen y el destino del alquiler con un clic. Con los dos puntos el backend calcula
 * la distancia; son opcionales.
 */
export function SelectorPuntosMapa({ origen, destino, onCambiar, height = 320 }: SelectorPuntosMapaProps) {
  const contenedorRef = useRef<HTMLDivElement | null>(null)
  const mapaRef = useRef<L.Map | null>(null)
  const capaRef = useRef<L.LayerGroup | null>(null)
  const [marcando, setMarcando] = useState<Marcando>(origen ? 'destino' : 'origen')

  const alHacerClic = useEffectEvent((punto: Punto) => {
    if (marcando === 'origen') {
      onCambiar(punto, destino)
      setMarcando('destino')
    } else {
      onCambiar(origen, punto)
    }
  })

  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current) return
    const mapa = L.map(contenedorRef.current).setView([14.65, -90.7], 7)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(mapa)
    capaRef.current = L.layerGroup().addTo(mapa)
    mapa.on('click', (evento: L.LeafletMouseEvent) => alHacerClic([evento.latlng.lat, evento.latlng.lng]))
    mapaRef.current = mapa
    return () => {
      mapa.remove()
      mapaRef.current = null
      capaRef.current = null
    }
  }, [])

  useEffect(() => {
    const capa = capaRef.current
    if (!capa) return
    capa.clearLayers()
    if (origen) {
      L.circleMarker(origen, { radius: 8, color: '#1d4ed8', fillColor: '#3b82f6', fillOpacity: 1 })
        .bindTooltip('Origen')
        .addTo(capa)
    }
    if (destino) {
      L.circleMarker(destino, { radius: 8, color: '#0f766e', fillColor: '#14b8a6', fillOpacity: 1 })
        .bindTooltip('Destino')
        .addTo(capa)
    }
    if (origen && destino) {
      L.polyline([origen, destino], { color: '#2563eb', weight: 3, dashArray: '6 8' }).addTo(capa)
    }
  }, [origen, destino])

  return (
    <div className="selector-puntos">
      <div className="tabs" role="group" aria-label="Punto a marcar">
        <button type="button" className={marcando === 'origen' ? 'active' : ''} onClick={() => setMarcando('origen')}>
          Marcar origen{origen ? ' ✓' : ''}
        </button>
        <button type="button" className={marcando === 'destino' ? 'active' : ''} onClick={() => setMarcando('destino')}>
          Marcar destino{destino ? ' ✓' : ''}
        </button>
        {(origen || destino) && (
          <button
            type="button"
            onClick={() => {
              onCambiar(null, null)
              setMarcando('origen')
            }}
          >
            Quitar puntos
          </button>
        )}
      </div>
      <div
        ref={contenedorRef}
        className="leaflet-route-map"
        style={{ height }}
        role="application"
        aria-label="Mapa para marcar origen y destino"
      />
    </div>
  )
}
