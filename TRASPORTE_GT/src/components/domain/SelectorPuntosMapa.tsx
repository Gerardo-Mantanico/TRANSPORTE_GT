import { useEffect, useEffectEvent, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Punto } from '../../utils/solicitudAlquiler'

interface SelectorPuntosMapaProps {
  origen: Punto | null
  destino: Punto | null
  onCambiar: (origen: Punto | null, destino: Punto | null) => void
  onLugarEncontrado?: (tipo: Marcando, direccion: string) => void
  onSeleccionarLugar?: (tipo: Marcando, punto: Punto, direccion: string) => void
  distancia?: number | null
  height?: number
}

type Marcando = 'origen' | 'destino'

interface ResultadoLugar {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

/**
 * Mapa para marcar el origen y el destino del alquiler con un clic. Con los dos puntos el backend calcula
 * la distancia; son opcionales.
 */
export function SelectorPuntosMapa({ origen, destino, onCambiar, onLugarEncontrado, onSeleccionarLugar, distancia = null, height = 320 }: SelectorPuntosMapaProps) {
  const contenedorRef = useRef<HTMLDivElement | null>(null)
  const mapaRef = useRef<L.Map | null>(null)
  const capaRef = useRef<L.LayerGroup | null>(null)
  const solicitudDireccionRef = useRef(0)
  const consultaSeleccionadaRef = useRef<Record<Marcando, string>>({ origen: '', destino: '' })
  const [marcando, setMarcando] = useState<Marcando>(origen ? 'destino' : 'origen')
  const [consultas, setConsultas] = useState<Record<Marcando, string>>({ origen: '', destino: '' })
  const [sugerencias, setSugerencias] = useState<Record<Marcando, ResultadoLugar[]>>({ origen: [], destino: [] })
  const [buscandoSugerencias, setBuscandoSugerencias] = useState<Marcando | null>(null)

  useEffect(() => {
    const consulta = consultas[marcando].trim()
    if (consulta.length < 3 || consulta === consultaSeleccionadaRef.current[marcando]) return

    const controlador = new AbortController()
    const temporizador = window.setTimeout(async () => {
      setBuscandoSugerencias(marcando)
      try {
        const parametros = new URLSearchParams({
          format: 'jsonv2',
          addressdetails: '1',
          limit: '5',
          countrycodes: 'gt',
          bounded: '1',
          viewbox: '-92.3,17.9,-88.0,13.7',
          q: consulta,
        })
        const respuesta = await fetch(`https://nominatim.openstreetmap.org/search?${parametros}`, { signal: controlador.signal })
        if (!respuesta.ok) return
        const datos = (await respuesta.json()) as ResultadoLugar[]
        setSugerencias((actuales) => ({ ...actuales, [marcando]: datos }))
      } catch {
        if (!controlador.signal.aborted) setSugerencias((actuales) => ({ ...actuales, [marcando]: [] }))
      } finally {
        if (!controlador.signal.aborted) setBuscandoSugerencias(null)
      }
    }, 350)

    return () => {
      window.clearTimeout(temporizador)
      controlador.abort()
    }
  }, [consultas, marcando])

  const alHacerClic = useEffectEvent(async (punto: Punto) => {
    const tipo = marcando
    if (marcando === 'origen') {
      onCambiar(punto, destino)
      setMarcando('destino')
    } else {
      onCambiar(origen, punto)
    }

    const solicitud = ++solicitudDireccionRef.current
    try {
      const respuesta = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${punto[0]}&lon=${punto[1]}&zoom=14&addressdetails=1`,
      )
      if (!respuesta.ok) return
      const datos = (await respuesta.json()) as { display_name?: string }
      if (solicitud === solicitudDireccionRef.current && datos.display_name) {
        onLugarEncontrado?.(tipo, datos.display_name)
        consultaSeleccionadaRef.current[tipo] = datos.display_name
        setConsultas((actuales) => ({ ...actuales, [tipo]: datos.display_name ?? '' }))
      }
    } catch {
      // El punto y sus coordenadas siguen siendo válidos aunque no haya conexión.
    }
  })

  const seleccionarLugar = (tipo: Marcando, lugar: ResultadoLugar) => {
    const punto: Punto = [Number(lugar.lat), Number(lugar.lon)]
    if (onSeleccionarLugar) {
      onSeleccionarLugar(tipo, punto, lugar.display_name)
    } else if (tipo === 'origen') {
      onCambiar(punto, destino)
    } else {
      onCambiar(origen, punto)
    }
    if (tipo === 'origen') setMarcando('destino')
    consultaSeleccionadaRef.current[tipo] = lugar.display_name
    setConsultas((actuales) => ({ ...actuales, [tipo]: lugar.display_name }))
    setSugerencias((actuales) => ({ ...actuales, [tipo]: [] }))
    mapaRef.current?.setView(punto, Math.max(mapaRef.current.getZoom(), 12), { animate: true })
  }

  const cambiarConsulta = (tipo: Marcando, consulta: string) => {
    setMarcando(tipo)
    if (consulta.trim() !== consultaSeleccionadaRef.current[tipo]) consultaSeleccionadaRef.current[tipo] = ''
    setConsultas((actuales) => ({ ...actuales, [tipo]: consulta }))
    if (consulta.trim().length < 3) setSugerencias((actuales) => ({ ...actuales, [tipo]: [] }))
  }

  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current) return
    const limitesGuatemala = L.latLngBounds([13.7, -92.3], [17.9, -88.0])
    const mapa = L.map(contenedorRef.current, {
      maxBounds: limitesGuatemala,
      maxBoundsViscosity: 1,
      minZoom: 7,
    }).fitBounds(limitesGuatemala, { padding: [12, 12] })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapa)
    capaRef.current = L.layerGroup().addTo(mapa)
    mapa.on('click', (evento: L.LeafletMouseEvent) => alHacerClic([evento.latlng.lat, evento.latlng.lng]))
    mapaRef.current = mapa
    return () => {
      solicitudDireccionRef.current += 1
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
      <div className="map-top-row">
        <div className="map-searches">
          {(['origen', 'destino'] as Marcando[]).map((tipo) => (
            <div className={`map-search ${tipo}`} key={tipo}>
              <button type="button" className={`map-point-chip ${marcando === tipo ? 'active' : ''}`} onClick={() => setMarcando(tipo)}>
                <span className="map-step-dot" />
                <span>{tipo === 'origen' ? '1 Origen' : '2 Destino'}</span>
                {(tipo === 'origen' ? origen : destino) && <b>✓</b>}
              </button>
              <input
                value={consultas[tipo]}
                onChange={(event) => cambiarConsulta(tipo, event.target.value)}
                onFocus={() => setMarcando(tipo)}
                placeholder={`Busca el ${tipo}...`}
                aria-label={`Buscar ${tipo}`}
              />
              {buscandoSugerencias === tipo && <span className="map-search-status">...</span>}
              {sugerencias[tipo].length > 0 && (
                <div className="map-suggestions" role="listbox">
                  {sugerencias[tipo].map((lugar) => (
                    <button type="button" key={lugar.place_id} onClick={() => seleccionarLugar(tipo, lugar)}>
                      {lugar.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className={`map-distance ${distancia !== null ? 'ready' : ''}`} aria-live="polite">
          <span>Distancia estimada</span>
          <strong>{distancia !== null ? `${distancia.toFixed(2)} km` : 'Pendiente'}</strong>
        </div>
      </div>
      {(origen || destino) && (
        <div className="map-route-actions">
          <button
            type="button"
            onClick={() => {
              onCambiar(null, null)
              setMarcando('origen')
              setConsultas({ origen: '', destino: '' })
              setSugerencias({ origen: [], destino: [] })
            }}
          >
            Limpiar ruta
          </button>
        </div>
      )}
      <div
        ref={contenedorRef}
        className="leaflet-route-map"
        style={{ height }}
        role="application"
        aria-label="Mapa para marcar origen y destino"
      />
      <div className="map-coordinates" aria-live="polite">
        <span><i className="map-step-dot origin" /> <b>Origen</b> {origen ? `${origen[0].toFixed(6)}, ${origen[1].toFixed(6)}` : 'Pendiente'}</span>
        <span><i className="map-step-dot destination" /> <b>Destino</b> {destino ? `${destino[0].toFixed(6)}, ${destino[1].toFixed(6)}` : 'Pendiente'}</span>
      </div>
    </div>
  )
}
