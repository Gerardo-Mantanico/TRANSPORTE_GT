import { useState } from 'react'
import { AvisoError } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FormModal } from '../../components/ui/FormModal'
import { Icon } from '../../components/ui/Icon'
import { InfoNote } from '../../components/ui/Misc'
import { useCartera, usePerfilCliente } from '../../hooks/customerWallet'
import { usePagarAlquilerEnLinea, usePagarAlquilerMostrador } from '../../hooks/rentals'
import type { Alquiler } from '../../types/rentalTypes'
import { formatFechaHora, formatQ, hoyIso } from '../../utils/format'
import { AvisoPerfilCliente } from '../customerWallet/AvisoPerfilCliente'

interface PagoModalProps {
  alquiler: Alquiler
  onClose: () => void
  onPagado: (alquiler: Alquiler) => void
}

function Resumen({ alquiler }: { alquiler: Alquiler }) {
  return (
    <p className="modal-paragraph">
      <strong>
        {alquiler.origen} → {alquiler.destino}
      </strong>{' '}
      · {formatFechaHora(alquiler.fechaHoraSalida)} · {alquiler.numeroPasajeros} pasajeros
    </p>
  )
}

/** El cliente dueño paga con su cartera un alquiler COTIZADO. */
export function PagoEnLineaModal({ alquiler, onClose, onPagado }: PagoModalProps) {
  const pagar = usePagarAlquilerEnLinea()
  const cartera = useCartera()
  const perfil = usePerfilCliente()
  const [fechaPago, setFechaPago] = useState(hoyIso())
  const monto = alquiler.precioFinal ?? 0
  const saldo = cartera.datos ? Number(cartera.datos.saldo) : null
  const alcanza = saldo === null || saldo >= monto

  const guardar = async () => {
    const resultado = await pagar.ejecutar({ id: alquiler.id, fechaPago })
    if (resultado.ok) onPagado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow="Pago con cartera"
      title={`Pagar ${formatQ(monto)}`}
      actionLabel="Pagar con cartera"
      enviando={pagar.cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <Resumen alquiler={alquiler} />
      <div className="payment-balance">
        <div>
          <span>Saldo actual</span>
          <strong>{saldo !== null ? formatQ(saldo) : cartera.cargando ? '...' : '—'}</strong>
        </div>
        <Icon name="arrow" />
        <div>
          <span>Saldo restante</span>
          <strong>{saldo !== null ? formatQ(Math.max(saldo - monto, 0)) : '—'}</strong>
        </div>
      </div>
      <Field label="Fecha de pago" type="date" value={fechaPago} onChange={(event) => setFechaPago(event.target.value)} required />
      <AvisoPerfilCliente cliente={perfil.datos} accion="pagar alquileres" />
      {!alcanza && <p className="estimate-warn">Su saldo no cubre el precio final. Recargue su cartera antes de pagar.</p>}
      <AvisoError error={pagar.error}>
        {pagar.error?.status === 503 && (
          <small>El alquiler sigue cotizado y no se cobró. Puede reintentar: no se cobra dos veces.</small>
        )}
      </AvisoError>
    </FormModal>
  )
}

/** SUC o CAJ cobran en efectivo un alquiler de mostrador COTIZADO. */
export function CobrarMostradorModal({ alquiler, onClose, onPagado }: PagoModalProps) {
  const pagar = usePagarAlquilerMostrador()
  const [fechaPago, setFechaPago] = useState(hoyIso())

  const guardar = async () => {
    const resultado = await pagar.ejecutar({ id: alquiler.id, fechaPago })
    if (resultado.ok) onPagado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow="Pago en efectivo"
      title={`Cobrar ${formatQ(alquiler.precioFinal ?? 0)}`}
      actionLabel="Registrar pago"
      enviando={pagar.cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <Resumen alquiler={alquiler} />
      <p className="modal-paragraph">
        Cliente: <strong>{alquiler.nombreCliente}</strong> · NIT {alquiler.nitCliente}
      </p>
      <Field label="Fecha de pago" type="date" value={fechaPago} onChange={(event) => setFechaPago(event.target.value)} required />
      <InfoNote>El cobro en mostrador no usa la cartera. Al confirmarse, Viajes crea el viaje para asignar bus y chofer.</InfoNote>
      <AvisoError error={pagar.error} />
    </FormModal>
  )
}
