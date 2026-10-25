import { useState, type FormEvent } from 'react'
import { AccionFila } from '../../components/ui/AccionFila'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { InfoNote, SectionTitle } from '../../components/ui/Misc'
import { usePasajeros, useRegistrarAbordaje } from '../../hooks/tickets'
import { useViajes } from '../../hooks/trips'
import { ETIQUETAS_CANAL, type ResultadoAbordaje } from '../../types/ticketTypes'
import type { Viaje } from '../../types/tripTypes'
import { etiquetaAsiento } from '../../utils/asientos'
import { finDiaGuatemala, inicioDiaGuatemala } from '../../utils/fechaHora'
import { formatFechaHora, formatHora, hoyIso } from '../../utils/format'
import { EstadoViajeBadge } from '../trips/EstadoViajeBadge'
import { EscanerQr } from './EscanerQr'

function rutaDe(viaje: { nombreOrigen: string; nombreDestino: string }) {
  return `${viaje.nombreOrigen} → ${viaje.nombreDestino}`
}

/** Pasajeros del viaje elegido: lector QR o código a mano, y la lista con quién ya abordó. */
function AbordajeViaje({ viaje }: { viaje: Viaje }) {
  const pasajeros = usePasajeros(viaje.id)
  const abordar = useRegistrarAbordaje()
  const [codigo, setCodigo] = useState('')
  const [camara, setCamara] = useState(false)
  const [ultimo, setUltimo] = useState<ResultadoAbordaje | null>(null)
  const lista = pasajeros.datos
  const abierto = (lista?.estado ?? viaje.estado) === 'PROGRAMADO'

  const registrar = async (texto: string) => {
    const limpio = texto.trim()
    if (!limpio || abordar.cargando) return
    setUltimo(null)
    const resultado = await abordar.ejecutar({ idViaje: viaje.id, codigo: limpio })
    if (!resultado.ok) return
    setUltimo(resultado.datos)
    setCodigo('')
    pasajeros.recargar()
  }

  const enviar = (event: FormEvent) => {
    event.preventDefault()
    void registrar(codigo)
  }

  const rows = (lista?.pasajeros ?? []).map((pasajero) => [
    <strong>{etiquetaAsiento(pasajero.numeroAsiento)}</strong>,
    <code>{pasajero.codigo}</code>,
    <>
      <strong>{pasajero.nombreComprador}</strong>
      <small className="cell-note">NIT {pasajero.nitComprador}</small>
    </>,
    ETIQUETAS_CANAL[pasajero.canal],
    pasajero.abordadoEn ? (
      <Badge tone="success">Abordó {formatHora(pasajero.abordadoEn)}</Badge>
    ) : (
      <Badge tone="warning">Pendiente</Badge>
    ),
    !pasajero.abordadoEn && abierto ? (
      <AccionFila icono="check" titulo="Marcar abordaje" onClick={() => void registrar(pasajero.codigo)} />
    ) : null,
  ])

  const porcentaje = lista && lista.boletos ? Math.round((lista.abordados / lista.boletos) * 100) : 0

  return (
    <div className="boarding-grid">
      <section className="surface form-card">
        <SectionTitle title={rutaDe(viaje)} subtitle={`${formatFechaHora(viaje.fechaHoraSalida)} · ${viaje.bus?.placa ?? 'Sin bus'}`} />
        {lista && (
          <div className="boarding-progress" aria-label={`${lista.abordados} de ${lista.boletos} pasajeros abordaron`}>
            <div>
              <strong>{lista.abordados}</strong>
              <span>de {lista.boletos} abordaron</span>
            </div>
            <span className="boarding-bar">
              <span style={{ width: `${porcentaje}%` }} />
            </span>
          </div>
        )}
        {abierto ? (
          <>
            <form className="boarding-form" onSubmit={enviar}>
              <Field
                label="Código del boleto"
                placeholder="BOL-XXXXXXXX"
                value={codigo}
                onChange={(event) => setCodigo(event.target.value.toUpperCase())}
                maxLength={20}
                autoComplete="off"
              />
              <Button type="submit" icon="check" disabled={!codigo.trim() || abordar.cargando}>
                {abordar.cargando ? 'Registrando...' : 'Registrar'}
              </Button>
            </form>
            <Button variant="secondary" icon="camera" onClick={() => setCamara((actual) => !actual)}>
              {camara ? 'Cerrar cámara' : 'Escanear con cámara'}
            </Button>
            {camara && <EscanerQr onCodigo={(leido) => void registrar(leido)} pausado={abordar.cargando} />}
          </>
        ) : (
          <InfoNote>El viaje ya salió: la lista queda solo de consulta.</InfoNote>
        )}
        <AvisoError error={abordar.error} />
        {ultimo && (
          <div className={ultimo.nuevo ? 'success-note' : 'persistent-note'} role="status">
            <Icon name={ultimo.nuevo ? 'check' : 'clock'} />
            <span>
              {etiquetaAsiento(ultimo.abordaje.numeroAsiento)} · {ultimo.abordaje.nombreComprador}{' '}
              {ultimo.nuevo
                ? 'abordó.'
                : `ya había abordado a las ${formatHora(ultimo.abordaje.abordadoEn)}.`}
            </span>
          </div>
        )}
      </section>
      <section className="surface list-surface">
        {pasajeros.error ? (
          <AvisoError error={pasajeros.error} onReintentar={pasajeros.recargar} />
        ) : !lista && pasajeros.cargando ? (
          <Cargando texto="Cargando pasajeros..." />
        ) : rows.length ? (
          <DataTable headers={['Asiento', 'Código', 'Pasajero', 'Canal', 'Abordaje', 'Acciones']} rows={rows} />
        ) : (
          <div className="filter-empty">
            <span>
              <Icon name="ticket" />
            </span>
            <strong>Sin boletos vendidos</strong>
            <p>Este viaje todavía no tiene boletos confirmados.</p>
          </div>
        )}
      </section>
    </div>
  )
}

/** Abordaje para CAJERO y ADMIN_SUCURSAL: viajes regulares de su sucursal en el día elegido. */
export function AbordajePage() {
  const [fecha, setFecha] = useState(hoyIso())
  const [idViaje, setIdViaje] = useState('')
  const viajes = useViajes({
    tipoViaje: 'REGULAR',
    desde: inicioDiaGuatemala(fecha),
    hasta: finDiaGuatemala(fecha),
    tamano: 50,
  })
  const salidas = viajes.datos?.contenido ?? []
  const elegido = salidas.find((viaje) => viaje.id === idViaje)

  return (
    <>
      <section className="surface form-card boarding-filters">
        <Field
          label="Fecha de salida"
          type="date"
          value={fecha}
          onChange={(event) => {
            setFecha(event.target.value)
            setIdViaje('')
          }}
        />
        <Field label="Viaje">
          <select value={idViaje} onChange={(event) => setIdViaje(event.target.value)} disabled={viajes.cargando}>
            <option value="">{salidas.length ? 'Seleccione una salida' : 'No hay salidas ese día'}</option>
            {salidas.map((viaje) => (
              <option key={viaje.id} value={viaje.id}>
                {formatHora(viaje.fechaHoraSalida)} · {rutaDe(viaje)} · {viaje.bus?.placa ?? 'sin bus'}
              </option>
            ))}
          </select>
        </Field>
        {elegido && <EstadoViajeBadge estado={elegido.estado} />}
      </section>
      <AvisoError error={viajes.error} onReintentar={viajes.recargar} />
      {elegido ? (
        <AbordajeViaje key={elegido.id} viaje={elegido} />
      ) : (
        <InfoNote>
          Elija una salida de su sucursal. El abordaje se registra con el QR del boleto (PDF del pasajero) o con su
          código, mientras el viaje está programado; al registrar la salida la lista queda solo de consulta.
        </InfoNote>
      )}
    </>
  )
}
