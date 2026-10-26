import { useEffect, useEffectEvent, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Punto } from '../../utils/solicitudAlquiler'

interface ResultadoLugar {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: { state?: string; region?: string; county?: string }
}

function departamentoDe(lugar: ResultadoLugar): string | null {
  return lugar.address?.state ?? lugar.address?.region ?? lugar.address?.county ?? null
}

export function SelectorUbicacionMapa({
  punto,
  direccion,
  onCambiar,
  onDireccion,
  onDepartamento,
  height = 260,
  soloLectura = false,
}: {
  punto: Punto | null
  direccion: string
  onCambiar: (punto: Punto) => void
  onDireccion: (direccion: string) => void
  onDepartamento: (departamento: string) => void
  height?: number
  soloLectura?: boolean
}) {
  const contenedorRef = useRef<HTMLDivElement | null>(null)
  const mapaRef = useRef<L.Map | null>(null)
  const capaRef = useRef<L.LayerGroup | null>(null)
  const puntoInicialRef = useRef(punto)
  const consultaElegidaRef = useRef('')
  const [consulta, setConsulta] = useState(direccion)
  const [sugerencias, setSugerencias] = useState<ResultadoLugar[]>([])
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    const texto = consulta.trim()
    if (texto.length < 3 || texto === consultaElegidaRef.current) return
    const controlador = new AbortController()
    const temporizador = window.setTimeout(async () => {
      setBuscando(true)
      try {
        const parametros = new URLSearchParams({
          format: 'jsonv2',
          addressdetails: '1',
          limit: '5',
          countrycodes: 'gt',
          bounded: '1',
          viewbox: '-92.3,17.9,-88.0,13.7',
          q: texto,
        })
        const respuesta = await fetch(`https://nominatim.openstreetmap.org/search?${parametros}`, { signal: controlador.signal })
        if (respuesta.ok) setSugerencias((await respuesta.json()) as ResultadoLugar[])
      } catch {
        if (!controlador.signal.aborted) setSugerencias([])
      } finally {
        if (!controlador.signal.aborted) setBuscando(false)
      }
    }, 350)
    return () => {
      window.clearTimeout(temporizador)
      controlador.abort()
    }
  }, [consulta])

  const seleccionarPunto = useEffectEvent(async (nuevoPunto: Punto) => {
    onCambiar(nuevoPunto)
    try {
      const respuesta = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${nuevoPunto[0]}&lon=${nuevoPunto[1]}&zoom=16`,
      )
      if (!respuesta.ok) return
      const datos = (await respuesta.json()) as ResultadoLugar
      if (datos.display_name) {
        consultaElegidaRef.current = datos.display_name
        setConsulta(datos.display_name)
        onDireccion(datos.display_name)
        if (departamentoDe(datos)) onDepartamento(departamentoDe(datos) as string)
      }
    } catch {
      // Las coordenadas siguen siendo válidas si falla la consulta de dirección.
    }
  })

  const elegirResultado = (resultado: ResultadoLugar) => {
    const nuevoPunto: Punto = [Number(resultado.lat), Number(resultado.lon)]
    consultaElegidaRef.current = resultado.display_name
    setConsulta(resultado.display_name)
    setSugerencias([])
    onCambiar(nuevoPunto)
    onDireccion(resultado.display_name)
    if (departamentoDe(resultado)) onDepartamento(departamentoDe(resultado) as string)
    mapaRef.current?.setView(nuevoPunto, 14, { animate: true })
  }

  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current) return
    const limites = L.latLngBounds([13.7, -92.3], [17.9, -88.0])
    const mapa = L.map(contenedorRef.current, { maxBounds: limites, maxBoundsViscosity: 1, minZoom: 7 })
    if (puntoInicialRef.current) mapa.setView(puntoInicialRef.current, 14)
    else mapa.fitBounds(limites, { padding: [10, 10] })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapa)
    capaRef.current = L.layerGroup().addTo(mapa)
    if (!soloLectura) mapa.on('click', (evento: L.LeafletMouseEvent) => void seleccionarPunto([evento.latlng.lat, evento.latlng.lng]))
    mapaRef.current = mapa
    return () => {
      mapa.remove()
      mapaRef.current = null
      capaRef.current = null
    }
  }, [soloLectura])

  useEffect(() => {
    const capa = capaRef.current
    if (!capa) return
    capa.clearLayers()
    if (punto) {
      L.circleMarker(punto, { radius: 9, color: '#1d4ed8', fillColor: '#3b82f6', fillOpacity: 1 })
        .bindTooltip('Ubicación de la sucursal')
        .addTo(capa)
    }
  }, [punto])

  return (
    <div className="branch-location-picker">
      {!soloLectura && <div className="branch-location-search">
        <input
          value={consulta}
          onChange={(event) => {
            consultaElegidaRef.current = ''
            setConsulta(event.target.value)
          }}
          placeholder="Busca una dirección o haz clic en el mapa"
          aria-label="Buscar ubicación de la sucursal"
        />
        {buscando && <small>...</small>}
        {sugerencias.length > 0 && (
          <div className="branch-location-suggestions" role="listbox">
            {sugerencias.map((resultado) => (
              <button type="button" key={resultado.place_id} onClick={() => elegirResultado(resultado)}>
                {resultado.display_name}
              </button>
            ))}
          </div>
        )}
      </div>}
      <div ref={contenedorRef} className="leaflet-route-map branch-location-map" style={{ height }} role="application" aria-label="Mapa de ubicación de la sucursal" />
      <div className="branch-location-coordinates">
        <span>{punto ? `Lat ${punto[0].toFixed(6)}` : 'Latitud pendiente'}</span>
        <span>{punto ? `Lng ${punto[1].toFixed(6)}` : 'Longitud pendiente'}</span>
      </div>
    </div>
  )
}
