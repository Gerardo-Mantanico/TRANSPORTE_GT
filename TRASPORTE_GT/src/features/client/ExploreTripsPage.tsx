import { useMemo, useState } from 'react'
import { resolveRoutePoint } from '../../data/mock'
import { RouteMap } from '../../components/domain/RouteMap'
import { SeatMap } from '../../components/domain/SeatMap'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { InfoNote } from '../../components/ui/Misc'
import { useCartera, usePerfilCliente } from '../../hooks/customerWallet'
import { useSucursales } from '../../hooks/identity'
import { useComprarEnLinea, useConsultarCompra, useMapaAsientos, useViajesALaVenta } from '../../hooks/tickets'
import {
  MAX_ASIENTOS_POR_COMPRA,
  type Compra,
  type FiltroViajes,
  type ViajeDisponible,
} from '../../types/ticketTypes'
import { etiquetaAsiento, indicesOcupados, numeroAsiento, ordenarEtiquetas } from '../../utils/asientos'
import { formatFechaCorta, formatFechaHora, formatHora, formatMonto, formatQ, hoyIso } from '../../utils/format'
import { nuevaClaveIdempotencia } from '../../utils/idempotencia'
import { puedeOperarEnLinea } from '../../utils/perfilCliente'
import { AvisoPerfilCliente } from '../customerWallet/AvisoPerfilCliente'

function toggleSeat(seats: string[], seat: string) {
  return seats.includes(seat) ? seats.filter((item) => item !== seat) : [...seats, seat]
}

function rutaDe(viaje: ViajeDisponible) {
  return `${viaje.nombreOrigen} → ${viaje.nombreDestino}`
}

function PurchaseConfirmationModal({
  viaje,
  compra,
  onClose,
}: {
  viaje: ViajeDisponible
  compra: Compra
  onClose: () => void
}) {
  const asientos = compra.asientos.map((boleto) => etiquetaAsiento(boleto.numeroAsiento)).join(', ')
  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section className="modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span className="eyebrow">Compra confirmada</span>
            <h2>Boletos emitidos</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">
          <div className="success-note">
            <Icon name="check" />
            <span>
              Su compra fue registrada y los asientos <strong>{asientos}</strong> quedaron bloqueados.
              Enviamos la confirmación a su correo electrónico.
            </span>
          </div>
          <div className="detail-grid">
            <div>
              <span>Boletos</span>
              <strong>{compra.asientos.map((boleto) => boleto.codigo).join(', ')}</strong>
            </div>
            <div>
              <span>Viaje</span>
              <strong>{rutaDe(viaje)}</strong>
            </div>
            <div>
              <span>Fecha y salida</span>
              <strong>{formatFechaHora(viaje.fechaHoraSalida)}</strong>
            </div>
            <div>
              <span>Bus</span>
              <strong>{viaje.placaBus ?? '—'}</strong>
            </div>
            <div>
              <span>Asientos</span>
              <strong>{asientos}</strong>
            </div>
            <div>
              <span>Total pagado</span>
              <strong>{formatMonto(compra.montoTotal)}</strong>
            </div>
          </div>
          <InfoNote>
            El comprobante quedó guardado en <strong>Mi historial</strong> junto con sus boletos.
          </InfoNote>
        </div>
      </section>
    </div>
  )
}

/** 202: la compra quedó RESERVADA porque Cartera no respondió. El usuario decide cuándo consultar o reintentar. */
function CompraPendienteModal({
  viaje,
  compra,
  onActualizada,
  onClose,
}: {
  viaje: ViajeDisponible
  compra: Compra
  onActualizada: (compra: Compra) => void
  onClose: () => void
}) {
  const consultar = useConsultarCompra()
  const reintentar = useComprarEnLinea()
  const ocupado = consultar.cargando || reintentar.cargando
  const error = consultar.error ?? reintentar.error

  const consultarEstado = async () => {
    reintentar.reiniciar()
    const resultado = await consultar.ejecutar(compra.idCompra)
    if (resultado.ok) onActualizada(resultado.datos)
  }

  const reintentarPago = async () => {
    consultar.reiniciar()
    // Mismo idCompra y asientos: el backend vuelve a intentar el cobro sin cobrar dos veces.
    const resultado = await reintentar.ejecutar({
      idCompra: compra.idCompra,
      idViaje: compra.idViaje,
      asientos: compra.asientos.map((boleto) => boleto.numeroAsiento),
      fechaPago: compra.fechaPago,
    })
    if (resultado.ok) onActualizada(resultado.datos.compra)
  }

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section className="modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span className="eyebrow">Pago en verificación</span>
            <h2>Su compra está reservada</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">
          <div className="persistent-note">
            <Icon name="clock" />
            <span>
              Los asientos <strong>{compra.asientos.map((b) => etiquetaAsiento(b.numeroAsiento)).join(', ')}</strong>{' '}
              de {rutaDe(viaje)} están apartados mientras confirmamos el pago con su cartera. Si no se confirma, se
              liberan a las <strong>{formatHora(compra.reservaExpiraEn)}</strong>.
            </span>
          </div>
          <InfoNote>
            No necesita quedarse en esta pantalla: recibirá la confirmación por correo y la compra aparecerá en
            <strong> Mi historial</strong>.
          </InfoNote>
          <AvisoError error={error} />
        </div>
        <footer>
          <Button variant="ghost" icon="search" onClick={consultarEstado} disabled={ocupado}>
            {consultar.cargando ? 'Consultando...' : 'Consultar estado'}
          </Button>
          <Button icon="wallet" onClick={reintentarPago} disabled={ocupado}>
            {reintentar.cargando ? 'Reintentando...' : 'Reintentar pago'}
          </Button>
        </footer>
      </section>
    </div>
  )
}

function RouteModal({
  viaje,
  onClose,
  onSelect,
}: {
  viaje: ViajeDisponible
  onClose: () => void
  onSelect: () => void
}) {
  // Distancia y duración son referenciales (catálogo de rutas de Flota, aún no conectado).
  const point = resolveRoutePoint(viaje.nombreDestino)

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section className="modal route-map-modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span className="eyebrow">Vista de la ruta</span>
            <h2>{rutaDe(viaje)}</h2>
            <p>
              {formatFechaCorta(viaje.fechaHoraSalida)} · Salida {formatHora(viaje.fechaHoraSalida)} · Bus{' '}
              {viaje.placaBus ?? '—'}
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">
          <RouteMap origin={viaje.nombreOrigen} destination={viaje.nombreDestino} compact />
          <div className="route-modal-summary">
            <div>
              <span>
                <Icon name="route" size={16} />
              </span>
              <p>
                Distancia estimada<strong>{point.distance}</strong>
              </p>
            </div>
            <div>
              <span>
                <Icon name="clock" size={16} />
              </span>
              <p>
                Llegada estimada<strong>{formatHora(viaje.fechaHoraLlegadaEstimada)}</strong>
              </p>
            </div>
            <div>
              <span>
                <Icon name="ticket" size={16} />
              </span>
              <p>
                Precio por persona
                <strong>{formatMonto(viaje.precioBoleto)}</strong>
              </p>
            </div>
            <div>
              <span>
                <Icon name="bus" size={16} />
              </span>
              <p>
                Disponibilidad
                <strong>{viaje.asientosDisponibles} asientos</strong>
              </p>
            </div>
          </div>
          <div className="route-modal-note">
            <Icon name="check" size={14} />
            <span>
              El recorrido es referencial y puede variar según el tránsito y las condiciones de la
              carretera.
            </span>
          </div>
        </div>
        <footer>
          <Button icon="ticket" onClick={onSelect}>
            Seleccionar asientos
          </Button>
        </footer>
      </section>
    </div>
  )
}

type FaseCompra = { tipo: 'seleccion' } | { tipo: 'pendiente' | 'confirmada' | 'anulada'; compra: Compra }

function SeatSelectionModal({
  viaje,
  onClose,
  onComprado,
}: {
  viaje: ViajeDisponible
  onClose: () => void
  onComprado: () => void
}) {
  const mapa = useMapaAsientos(viaje.idViaje)
  const cartera = useCartera()
  const perfil = usePerfilCliente()
  const comprar = useComprarEnLinea()
  const [seats, setSeats] = useState<string[]>([])
  // Un idCompra por intento: reintentar la misma selección no cobra dos veces.
  const [idCompra, setIdCompra] = useState(() => nuevaClaveIdempotencia())
  const [fase, setFase] = useState<FaseCompra>({ tipo: 'seleccion' })

  const ocupados = useMemo(() => new Set(mapa.datos?.ocupados ?? []), [mapa.datos])
  // Si otra compra tomó un asiento (409) y el mapa se recargó, sale de la selección sin efectos.
  const seleccion = ordenarEtiquetas(seats.filter((seat) => !ocupados.has(numeroAsiento(seat))))
  const capacidad = mapa.datos?.capacidad ?? viaje.capacidad ?? 0
  const libres = Math.max(capacidad - ocupados.size, 0)
  const maximo = Math.min(MAX_ASIENTOS_POR_COMPRA, libres)
  const precio = Number(viaje.precioBoleto)
  const total = seleccion.length * precio
  const saldo = cartera.datos ? Number(cartera.datos.saldo) : null
  const saldoInsuficiente = saldo !== null && total > saldo
  const puedePagar = puedeOperarEnLinea(perfil.datos) && !saldoInsuficiente && saldo !== null

  const terminar = (compra: Compra) => {
    if (compra.estado === 'CONFIRMADA') {
      setFase({ tipo: 'confirmada', compra })
      cartera.recargar()
      onComprado()
    } else if (compra.estado === 'ANULADA') {
      setFase({ tipo: 'anulada', compra })
    } else {
      setFase({ tipo: 'pendiente', compra })
    }
  }

  const confirmar = async () => {
    const resultado = await comprar.ejecutar({
      idCompra,
      idViaje: viaje.idViaje,
      asientos: seleccion.map(numeroAsiento),
      fechaPago: hoyIso(),
    })
    if (resultado.ok) {
      terminar(resultado.datos.compra)
      return
    }
    if (resultado.error.codigo === 'ASIENTO_NO_DISPONIBLE') {
      mapa.recargar()
      setIdCompra(nuevaClaveIdempotencia())
    }
  }

  if (fase.tipo === 'confirmada') {
    return <PurchaseConfirmationModal viaje={viaje} compra={fase.compra} onClose={onClose} />
  }
  if (fase.tipo === 'pendiente') {
    return <CompraPendienteModal viaje={viaje} compra={fase.compra} onActualizada={terminar} onClose={onClose} />
  }

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section className="modal seat-modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span className="eyebrow">Selección de asientos</span>
            <h2>{rutaDe(viaje)}</h2>
            <p>
              {formatFechaCorta(viaje.fechaHoraSalida)} · Salida {formatHora(viaje.fechaHoraSalida)} · Bus{' '}
              {viaje.placaBus ?? '—'} · {capacidad} asientos
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body seat-modal-body">
          {mapa.datos ? (
            <SeatMap
              selected={seleccion}
              onToggle={(seat) => {
                if (!seleccion.includes(seat) && seleccion.length >= maximo) return
                setSeats(toggleSeat(seleccion, seat))
                setIdCompra(nuevaClaveIdempotencia())
                comprar.reiniciar()
              }}
              count={capacidad}
              occupied={indicesOcupados(mapa.datos.ocupados)}
            />
          ) : mapa.error ? (
            <AvisoError error={mapa.error} onReintentar={mapa.recargar} />
          ) : (
            <Cargando texto="Cargando asientos..." />
          )}
          <aside className="booking-summary">
            <div className="booking-summary-head">
              <span className="summary-icon">
                <Icon name="ticket" />
              </span>
              <div>
                <span className="eyebrow">Resumen de compra</span>
                <h3>Sus asientos</h3>
              </div>
            </div>
            <div className="wallet-balance">
              <span>
                <Icon name="wallet" size={16} /> Saldo disponible
              </span>
              <strong>
                {cartera.datos ? formatMonto(cartera.datos.saldo) : cartera.cargando ? '...' : 'No disponible'}
              </strong>
            </div>
            <AvisoPerfilCliente cliente={perfil.datos} accion="comprar boletos" />
            {fase.tipo === 'anulada' && (
              <div className="form-error" role="alert">
                <Icon name="close" size={15} />
                <div>
                  <strong>La compra anterior no se completó</strong>
                  <small>{fase.compra.motivoAnulacion ?? 'La reserva venció.'} Puede elegir sus asientos de nuevo.</small>
                </div>
              </div>
            )}
            <div className="summary-label">Asientos seleccionados</div>
            <div className={`selected-chips ${seleccion.length ? '' : 'empty'}`.trim()}>
              {seleccion.length ? (
                seleccion.map((seat) => (
                  <span key={seat}>
                    {seat}
                    <Icon name="check" size={11} />
                  </span>
                ))
              ) : (
                <small>Seleccione hasta {maximo} asiento(s) en el plano</small>
              )}
            </div>
            <dl>
              <div>
                <dt>Cantidad</dt>
                <dd>{seleccion.length} asiento(s)</dd>
              </div>
              <div>
                <dt>Precio unitario</dt>
                <dd>{formatMonto(viaje.precioBoleto)}</dd>
              </div>
            </dl>
            <div className="booking-total">
              <span>Total a pagar</span>
              <strong>{formatQ(total)}</strong>
            </div>
            {saldoInsuficiente && (
              <p className="estimate-warn">Su saldo no cubre el total. Recargue su cartera antes de pagar.</p>
            )}
            <AvisoError error={comprar.error} />
            <div className="booking-security">
              <Icon name="check" size={15} />
              <span>
                Al confirmar, los asientos se bloquearán de inmediato y recibirá la confirmación por
                correo electrónico.
              </span>
            </div>
          </aside>
        </div>
        <footer>
          <Button
            icon="wallet"
            disabled={!seleccion.length || !puedePagar || comprar.cargando}
            onClick={confirmar}
          >
            {comprar.cargando ? 'Procesando...' : `Confirmar y pagar · ${formatQ(total)}`}
          </Button>
        </footer>
      </section>
    </div>
  )
}

export function ExploreTripsPage() {
  const sucursales = useSucursales({ activa: true, size: 100, sort: 'nombre,asc' })
  const [seatTrip, setSeatTrip] = useState<ViajeDisponible | null>(null)
  const [mapTrip, setMapTrip] = useState<ViajeDisponible | null>(null)
  const [idOrigen, setIdOrigen] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [filtro, setFiltro] = useState<FiltroViajes>({})
  const [mapHidden, setMapHidden] = useState(false)
  const viajes = useViajesALaVenta(filtro)

  const listaSucursales = sucursales.datos?.contenido ?? []
  const origen = listaSucursales.find((sucursal) => sucursal.id === idOrigen)?.nombre ?? ''
  const showPreview = origen.length > 2 && destination.trim().length > 2 && !mapHidden
  const resultados = viajes.datos ?? []

  const handleSearch = () => {
    setFiltro({ idOrigen: idOrigen || undefined, destino: destination.trim() || undefined, fecha: date || undefined })
  }

  return (
    <>
      {showPreview && <RouteMap origin={origen} destination={destination} onHide={() => setMapHidden(true)} />}
      <div className="journey-search">
        <Field label="Origen">
          <select
            value={idOrigen}
            onChange={(event) => {
              setIdOrigen(event.target.value)
              setMapHidden(false)
            }}
          >
            <option value="">Todas las sucursales</option>
            {listaSucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </select>
        </Field>
        <span className="swap-route" aria-hidden="true">
          <Icon name="arrow" />
        </span>
        <Field label="Destino">
          <input
            list="destination-options"
            value={destination}
            onChange={(event) => {
              setDestination(event.target.value)
              setMapHidden(false)
            }}
            onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
            placeholder="¿A dónde viaja?"
          />
          <datalist id="destination-options">
            {listaSucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.nombre} />
            ))}
          </datalist>
        </Field>
        <Field label="Fecha" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <Button icon="search" onClick={handleSearch}>
          Buscar viajes
        </Button>
      </div>
      <div className="results-head">
        <div>
          <h2>Viajes disponibles</h2>
          <p>
            {resultados.length} resultado{resultados.length === 1 ? '' : 's'}{' '}
            {filtro.fecha ? `para ${filtro.fecha === hoyIso() ? 'hoy' : formatFechaCorta(`${filtro.fecha}T12:00:00`)}` : 'en las próximas salidas'}
          </p>
        </div>
        <select defaultValue="Salida más próxima">
          <option>Salida más próxima</option>
        </select>
      </div>
      {viajes.error ? (
        <AvisoError error={viajes.error} onReintentar={viajes.recargar} />
      ) : !viajes.datos && viajes.cargando ? (
        <Cargando texto="Buscando viajes..." />
      ) : !resultados.length ? (
        <div className="filter-empty">
          <span>
            <Icon name="bus" />
          </span>
          <strong>No hay viajes a la venta</strong>
          <p>Pruebe con otro destino, otra fecha o todas las sucursales.</p>
        </div>
      ) : (
        <section className="trip-grid">
          {resultados.map((viaje) => (
            <article key={viaje.idViaje} className="trip-card">
              <div className="trip-card-top">
                <span className="bus-icon">
                  <Icon name="bus" />
                </span>
                <button className="route-card-action" onClick={() => setMapTrip(viaje)}>
                  <Icon name="route" size={14} />
                  <span>Ver ruta</span>
                </button>
                <Badge tone={viaje.asientosDisponibles < 8 ? 'warning' : 'success'}>
                  {viaje.asientosDisponibles} asientos libres
                </Badge>
              </div>
              <div className="route-visual">
                <div>
                  <strong>{formatHora(viaje.fechaHoraSalida)}</strong>
                  <span>{viaje.nombreOrigen}</span>
                </div>
                <div>
                  <i />
                  <span>
                    <Icon name="bus" size={15} />
                  </span>
                  <i />
                </div>
                <div>
                  <strong>{formatHora(viaje.fechaHoraLlegadaEstimada)}</strong>
                  <span>{viaje.nombreDestino}</span>
                </div>
              </div>
              <div className="trip-meta">
                <span>
                  <Icon name="calendar" size={16} /> {formatFechaCorta(viaje.fechaHoraSalida)}
                </span>
                <span>
                  <Icon name="bus" size={16} /> {viaje.placaBus ?? '—'} · {viaje.capacidad ?? '—'} asientos
                </span>
              </div>
              <div className="trip-price">
                <div>
                  <small>Por persona</small>
                  <strong>{formatMonto(viaje.precioBoleto)}</strong>
                </div>
                <Button onClick={() => setSeatTrip(viaje)} disabled={viaje.asientosDisponibles <= 0}>
                  Seleccionar asientos
                </Button>
              </div>
            </article>
          ))}
        </section>
      )}
      {seatTrip && (
        <SeatSelectionModal viaje={seatTrip} onClose={() => setSeatTrip(null)} onComprado={viajes.recargar} />
      )}
      {mapTrip && (
        <RouteModal
          viaje={mapTrip}
          onClose={() => setMapTrip(null)}
          onSelect={() => {
            setSeatTrip(mapTrip)
            setMapTrip(null)
          }}
        />
      )}
    </>
  )
}
