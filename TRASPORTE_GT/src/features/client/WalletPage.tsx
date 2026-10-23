import { useEffect, useState } from 'react'
import { errorMessage } from '../../api/client'
import { listarMovimientos, obtenerCartera, recargarCartera } from '../../api/wallet'
import type { MovimientoResponse } from '../../api/types'
import type { BadgeTone } from '../../types'
import { TODAY } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { SectionTitle } from '../../components/ui/Misc'
import { useToast } from '../../components/ui/useToast'
import { formatDateEs, formatQ } from '../../utils/format'
import { toNumberInRange } from '../../utils/validators'

const TONE_BY_TIPO: Record<MovimientoResponse['tipo'], BadgeTone> = {
  RECARGA: 'success',
  PAGO: 'warning',
  REEMBOLSO: 'info',
}

const LABEL_BY_TIPO: Record<MovimientoResponse['tipo'], string> = {
  RECARGA: 'Recarga',
  PAGO: 'Pago',
  REEMBOLSO: 'Reembolso',
}

export function WalletPage() {
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [toppedUp, setToppedUp] = useState(false)
  const [movements, setMovements] = useState<MovimientoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const fail = (message: string) => {
    setError(message)
    toast.error(message)
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [cartera, movimientos] = await Promise.all([
          obtenerCartera(),
          listarMovimientos({ tamano: 50 }),
        ])
        if (cancelled) return
        setBalance(Number(cartera.saldo) || 0)
        setMovements(movimientos.contenido)
        setError(null)
      } catch (caught) {
        if (cancelled) return
        const message = errorMessage(caught)
        setError(message)
        toast.error(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [toast])

  const recharge = async () => {
    const value = toNumberInRange(amount, 1, 100000, 'la cantidad a recargar')
    if (!value.ok) {
      fail(value.error)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await recargarCartera(value.value, TODAY)
      setAmount('')
      setToppedUp(true)
      toast.success('Recarga registrada. Su saldo y historial fueron actualizados.')
      const [cartera, movimientos] = await Promise.all([
        obtenerCartera(),
        listarMovimientos({ tamano: 50 }),
      ])
      setBalance(Number(cartera.saldo) || 0)
      setMovements(movimientos.contenido)
    } catch (caught) {
      fail(errorMessage(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <section className="wallet-hero">
        <div>
          <span>Saldo disponible</span>
          <strong>{formatQ(balance)}</strong>
          <small>Cartera digital</small>
        </div>
        <Icon name="wallet" size={40} />
      </section>
      <div className="wallet-grid">
        <section className="surface top-up">
          <SectionTitle title="Recargar cartera" subtitle="Agregue crédito manualmente" />
          <Field
            label="Cantidad a recargar (Q)"
            placeholder="0.00"
            type="number"
            step={0.01}
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value)
              setToppedUp(false)
            }}
            required
          />
          <Field label="Fecha de pago" type="date" defaultValue={TODAY} required />
          {error && <p className="danger-copy">{error}</p>}
          <Button onClick={recharge} disabled={saving}>
            {saving ? 'Procesando…' : 'Confirmar recarga'}
          </Button>
          {toppedUp && (
            <div className="success-note">
              <Icon name="check" />
              <span>Recarga registrada correctamente.</span>
            </div>
          )}
        </section>
        <section className="surface">
          <SectionTitle title="Movimientos recientes" subtitle="Todo el historial" />
          {loading ? (
            <div className="filter-empty">
              <strong>Cargando movimientos…</strong>
            </div>
          ) : (
            <DataTable
              headers={['Fecha', 'Descripción', 'Tipo', 'Monto', 'Saldo']}
              rows={movements.map((movement) => [
                formatDateEs(movement.fechaMovimiento),
                movement.descripcion,
                <Badge tone={TONE_BY_TIPO[movement.tipo]}>{LABEL_BY_TIPO[movement.tipo]}</Badge>,
                <span className={movement.tipo === 'RECARGA' ? 'money-positive' : 'money-negative'}>
                  {movement.tipo === 'RECARGA' ? '+ ' : '− '}
                  {formatQ(Number(movement.monto))}
                </span>,
                formatQ(Number(movement.saldoPosterior)),
              ])}
            />
          )}
        </section>
      </div>
    </>
  )
}
