import { useEffect, useState, type FormEvent } from 'react'
import { errorMessage } from '../../api/client'
import { pagarAlquiler, solicitarAlquiler } from '../../api/rentals'
import { listarSucursales } from '../../api/identity'
import { obtenerCartera } from '../../api/wallet'
import type { AlquilerResponse, SucursalResponse } from '../../api/types'
import { TODAY } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { AvisoError } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { InfoNote } from '../../components/ui/Misc'
import { SelectField } from '../../components/ui/SelectField'
import { useToast } from '../../components/ui/useToast'
import { formatQ } from '../../utils/format'
import { maxLen, required, toIntInRange, toNumberInRange } from '../../utils/validators'

export function RentalRequestPage() {
  const [sucursales, setSucursales] = useState<SucursalResponse[]>([])
  const [idSucursal, setIdSucursal] = useState('')
  const [destination, setDestination] = useState('')
  const [passengers, setPassengers] = useState('12')
  const [tripType, setTripType] = useState('Solo ida')
  const [departureDate, setDepartureDate] = useState(TODAY)
  const [returnDate, setReturnDate] = useState(TODAY)
  const [distanceKm, setDistanceKm] = useState('80')
  const [alquiler, setAlquiler] = useState<AlquilerResponse | null>(null)
  const [balance, setBalance] = useState(0)
  const [paid, setPaid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)
  const toast = useToast()

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [pagina, cartera] = await Promise.all([
          listarSucursales({ size: 100 }),
          obtenerCartera().catch(() => null),
        ])
        if (cancelled) return
        setSucursales(pagina.contenido)
        if (pagina.contenido[0]) setIdSucursal(pagina.contenido[0].id)
        if (cartera) setBalance(Number(cartera.saldo) || 0)
      } catch (caught) {
        if (cancelled) return
        const message = errorMessage(caught)
        setError(message)
        toast.error(message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [toast])

  const estimate = alquiler ? alquiler.precioFinal ?? alquiler.precioEstimado : null
  const canPay = estimate !== null && estimate <= balance && alquiler?.estado === 'COTIZADO'
  const remaining = balance - (estimate ?? 0)

  const fail = (message: string) => {
    setError(message)
    toast.error(message)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const originError = required(idSucursal, 'La sucursal de origen')
    if (originError) {
      fail(originError)
      return
    }
    const destinationError = required(destination, 'El destino')
    if (destinationError) {
      fail(destinationError)
      return
    }
    const destinationLen = maxLen(destination, 150, 'El destino')
    if (destinationLen) {
      fail(destinationLen)
      return
    }
    if (!departureDate) {
      fail('La fecha de salida es obligatoria.')
      return
    }
    if (tripType === 'Ida y vuelta' && returnDate < departureDate) {
      fail('La fecha de retorno debe ser igual o posterior a la fecha de salida.')
      return
    }
    const passengerCount = toIntInRange(passengers, 1, 300)
    if (!passengerCount.ok) {
      fail(`Número de pasajeros: ${passengerCount.error}`)
      return
    }
    const distance = toNumberInRange(distanceKm, 0.01, 100000, 'La distancia estimada (km)')
    if (!distance.ok) {
      fail(distance.error)
      return
    }

    setLoading(true)
    try {
      const sucursal = sucursales.find((item) => item.id === idSucursal)
      const created = await solicitarAlquiler({
        idSucursalOrigen: idSucursal,
        origen: sucursal?.nombre ?? 'Origen',
        destino: destination,
        fechaHoraSalida: new Date(`${departureDate}T08:00:00`).toISOString(),
        idaYVuelta: tripType === 'Ida y vuelta',
        fechaHoraRetorno:
          tripType === 'Ida y vuelta' ? new Date(`${returnDate}T17:00:00`).toISOString() : null,
        numeroPasajeros: passengerCount.value,
        distanciaEstimadaKm: distance.value,
      })
      setAlquiler(created)
      setPaid(false)
      toast.success('Solicitud de alquiler enviada. Espera la cotización del administrador.')
    } catch (caught) {
      fail(errorMessage(caught))
    } finally {
      setLoading(false)
    }
  }

  const pay = async () => {
    if (!alquiler) return
    setPaying(true)
    setError(null)
    try {
      const result = await pagarAlquiler(alquiler.id, TODAY)
      setAlquiler(result)
      setPaid(true)
      toast.success('Pago realizado correctamente desde tu cartera.')
      const cartera = await obtenerCartera().catch(() => null)
      if (cartera) setBalance(Number(cartera.saldo) || 0)
    } catch (caught) {
      fail(errorMessage(caught))
    } finally {
      setPaying(false)
    }
  }

  return (
    <>
      <div className="form-page">
        <section className="surface form-card">
          <h2>Detalles del viaje</h2>
          <form onSubmit={submit}>
            <div className="form-grid two">
              <SelectField
                label="Sucursal de origen"
                options={sucursales.map((sucursal) => ({
                  value: sucursal.id,
                  label: sucursal.nombre,
                }))}
                value={idSucursal}
                onChange={setIdSucursal}
                required
              />
              <Field
                label="Destino"
                placeholder="Ciudad o dirección"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                required
              />
              <Field
                label="Fecha de salida"
                type="date"
                value={departureDate}
                onChange={(event) => setDepartureDate(event.target.value)}
                required
              />
              <Field
                label="Fecha de retorno"
                type="date"
                value={returnDate}
                onChange={(event) => setReturnDate(event.target.value)}
                disabled={tripType !== 'Ida y vuelta'}
              />
              <Field
                label="Número de pasajeros"
                type="number"
                value={passengers}
                onChange={(event) => setPassengers(event.target.value)}
                required
              />
              <Field label="Tipo de viaje" required>
                <select value={tripType} onChange={(event) => setTripType(event.target.value)}>
                  <option>Solo ida</option>
                  <option>Ida y vuelta</option>
                </select>
              </Field>
              <Field
                label="Distancia estimada (km)"
                type="number"
                value={distanceKm}
                onChange={(event) => setDistanceKm(event.target.value)}
                required
              />
            </div>
            <InfoNote>
              El precio lo calcula el sistema con la tarifa vigente. El administrador podrá
              cotizarlo antes del pago.
            </InfoNote>
            {error && <p className="danger-copy">{error}</p>}
            <Button type="submit" icon="chart" disabled={loading}>
              {loading ? 'Enviando…' : 'Solicitar alquiler'}
            </Button>
          </form>
        </section>
        <aside className="estimate-card">
          <span className="eyebrow light">Estimación</span>
          <h3>Precio estimado</h3>
          <strong>{estimate !== null ? formatQ(estimate) : '—'}</strong>
          <Badge tone={paid ? 'success' : alquiler ? 'info' : 'warning'}>
            {paid
              ? 'Pagado con cartera'
              : alquiler
                ? alquiler.estado === 'COTIZADO'
                  ? 'Listo para pagar'
                  : 'Esperando cotización'
                : 'Pendiente de solicitud'}
          </Badge>
          <p>Este monto lo determina el backend con la tarifa vigente.</p>
          {alquiler && alquiler.estado === 'COTIZADO' && !paid && (
            <div className="estimate-pay">
              <div className="payment-balance">
                <div>
                  <span>Saldo actual</span>
                  <strong>{formatQ(balance)}</strong>
                </div>
                <Icon name="arrow" />
                <div>
                  <span>Saldo restante</span>
                  <strong>{formatQ(Math.max(remaining, 0))}</strong>
                </div>
              </div>
              {!canPay && (
                <p className="estimate-warn">
                  Su saldo no cubre el monto cotizado. Recargue su cartera antes de pagar.
                </p>
              )}
              <Button icon="wallet" disabled={!canPay || paying} onClick={pay}>
                {paying ? 'Procesando…' : `Pagar con cartera · ${formatQ(estimate ?? 0)}`}
              </Button>
            </div>
          )}
          {paid && (
            <div className="success-note">
              <Icon name="check" />
              <span>Pago completado correctamente.</span>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
