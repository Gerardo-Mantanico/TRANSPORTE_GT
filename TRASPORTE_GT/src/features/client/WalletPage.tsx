import { useState } from 'react'
import { TODAY, WALLET_MOVEMENTS } from '../../data/mock'
import type { BadgeTone } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { SectionTitle } from '../../components/ui/Misc'
import { formatQ } from '../../utils/format'

const INITIAL_BALANCE = 1250

type Movement = readonly [string, string, string, string, string, string]

export function WalletPage() {
  const [balance, setBalance] = useState(INITIAL_BALANCE)
  const [amount, setAmount] = useState('')
  const [toppedUp, setToppedUp] = useState(false)
  const [movements, setMovements] = useState<Movement[]>([...WALLET_MOVEMENTS])

  const recharge = () => {
    const value = Number(amount)
    if (!value || value <= 0) return
    const next = balance + value
    setBalance(next)
    setMovements((current) => [
      [TODAY, 'Recarga manual', 'Recarga', `+ ${formatQ(value)}`, formatQ(next), 'success'],
      ...current,
    ])
    setAmount('')
    setToppedUp(true)
  }

  return (
    <>
      <section className="wallet-hero">
        <div>
          <span>Saldo disponible</span>
          <strong>{formatQ(balance)}</strong>
          <small>Actualizado hace unos segundos</small>
        </div>
        <Icon name="wallet" size={40} />
      </section>
      <div className="wallet-grid">
        <section className="surface top-up">
          <SectionTitle title="Recargar cartera" subtitle="Agregue crédito manualmente" />
          <Field
            label="Cantidad a recargar"
            placeholder="Q 0.00"
            type="number"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value)
              setToppedUp(false)
            }}
            required
          />
          <Field label="Fecha de pago" type="date" defaultValue={TODAY} required />
          <Button onClick={recharge} disabled={!amount || Number(amount) <= 0}>
            Confirmar recarga
          </Button>
          {toppedUp && (
            <div className="success-note">
              <Icon name="check" />
              <span>Recarga registrada. Su saldo y historial fueron actualizados.</span>
            </div>
          )}
        </section>
        <section className="surface">
          <SectionTitle title="Movimientos recientes" subtitle="Todo el historial" />
          <DataTable
            headers={['Fecha', 'Descripción', 'Tipo', 'Monto', 'Saldo']}
            rows={movements.map(([date, description, kind, amountValue, movementBalance, tone]) => [
              date,
              description,
              <Badge tone={tone as BadgeTone}>{kind}</Badge>,
              <span className={amountValue.startsWith('+') ? 'money-positive' : 'money-negative'}>
                {amountValue}
              </span>,
              movementBalance,
            ])}
          />
        </section>
      </div>
    </>
  )
}
