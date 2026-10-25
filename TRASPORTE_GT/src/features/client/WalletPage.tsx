import { useState, type FormEvent } from 'react'
import type { BadgeTone } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { SectionTitle } from '../../components/ui/Misc'
import { Paginacion } from '../../components/ui/Paginacion'
import { useCartera, useMovimientos, usePerfilCliente, useRecargarCartera } from '../../hooks/customerWallet'
import {
  ETIQUETAS_TIPO_MOVIMIENTO,
  TIPOS_MOVIMIENTO,
  type FiltroMovimientos,
  type Movimiento,
  type TipoMovimiento,
} from '../../types/customerWalletTypes'
import { formatDateEs, formatFechaLarga, formatMonto, hoyIso } from '../../utils/format'
import { nuevaClaveIdempotencia } from '../../utils/idempotencia'
import { AvisoCartera } from '../customerWallet/AvisoCartera'
import { AvisoPerfilCliente } from '../customerWallet/AvisoPerfilCliente'
import { carteraBloqueada } from '../../utils/perfilCliente'

const TAMANO_PAGINA = 10

const TONOS: Record<TipoMovimiento, BadgeTone> = {
  RECARGA: 'success',
  PAGO: 'info',
  REEMBOLSO: 'warning',
}

function descripcion(movimiento: Movimiento): string {
  if (movimiento.descripcion) return movimiento.descripcion
  if (movimiento.tipo === 'RECARGA') return 'Recarga manual'
  return movimiento.tipoReferencia === 'ALQUILER' ? 'Alquiler privado' : 'Compra de boletos'
}

export function WalletPage() {
  const cartera = useCartera()
  const perfil = usePerfilCliente()
  const bloqueada = carteraBloqueada(perfil.datos)
  const [filtro, setFiltro] = useState<FiltroMovimientos>({ pagina: 0, tamano: TAMANO_PAGINA })
  const rangoInvalido = Boolean(filtro.desde && filtro.hasta && filtro.desde > filtro.hasta)
  const movimientos = useMovimientos(filtro, !rangoInvalido)
  const recarga = useRecargarCartera()
  const [monto, setMonto] = useState('')
  const [fechaRecarga, setFechaRecarga] = useState(hoyIso)
  // Una clave por intento de recarga: si se reintenta tras un fallo de red el backend no suma dos veces.
  const [claveIdempotencia, setClaveIdempotencia] = useState(() => nuevaClaveIdempotencia())
  const [aviso, setAviso] = useState<string | null>(null)

  const montoValido = /^\d{1,10}(\.\d{1,2})?$/.test(monto) && Number(monto) > 0

  const actualizarFiltro = (cambios: Partial<FiltroMovimientos>) =>
    setFiltro((actual) => ({ ...actual, ...cambios, pagina: 0 }))

  const recargar = async (event: FormEvent) => {
    event.preventDefault()
    if (!montoValido) return
    setAviso(null)
    const resultado = await recarga.ejecutar({
      monto: Number(monto).toFixed(2),
      fechaRecarga,
      claveIdempotencia,
    })
    if (!resultado.ok) return
    setAviso(`Recarga de ${formatMonto(resultado.datos.monto)} registrada. Nuevo saldo: ${formatMonto(resultado.datos.saldoPosterior)}.`)
    setMonto('')
    setClaveIdempotencia(nuevaClaveIdempotencia())
    cartera.recargar()
    movimientos.recargar()
  }

  const pagina = movimientos.datos
  const rows = (pagina?.contenido ?? []).map((movimiento) => {
    const ingreso = movimiento.tipo !== 'PAGO'
    return [
      <div className="wallet-movement-date">
        <Icon name="calendar" size={14} />
        <strong>{formatDateEs(movimiento.fechaMovimiento)}</strong>
      </div>,
      <div className="wallet-movement-description">
        <strong>{descripcion(movimiento)}</strong>
        <small>{movimiento.tipoReferencia === 'ALQUILER' ? 'Alquiler' : movimiento.tipoReferencia === 'BOLETOS' ? 'Boletos' : 'Movimiento de cartera'}</small>
      </div>,
      <Badge tone={TONOS[movimiento.tipo]}>{ETIQUETAS_TIPO_MOVIMIENTO[movimiento.tipo]}</Badge>,
      <span className={`wallet-movement-amount ${ingreso ? 'money-positive' : 'money-negative'}`}>
        {ingreso ? '+' : '−'} {formatMonto(movimiento.monto)}
      </span>,
      <strong className="wallet-movement-balance">{formatMonto(movimiento.saldoPosterior)}</strong>,
    ]
  })

  return (
    <>
      <section className="wallet-hero">
        <div>
          <span>Saldo disponible</span>
          <strong>{cartera.datos ? formatMonto(cartera.datos.saldo) : cartera.cargando ? '...' : '—'}</strong>
          <small>
            {cartera.datos ? `Actualizado el ${formatFechaLarga(cartera.datos.actualizadoEn)}` : 'Cartera digital'}
          </small>
        </div>
        <Icon name="wallet" size={40} />
      </section>
      <AvisoCartera error={cartera.error} onReintentar={cartera.recargar} />
      <AvisoPerfilCliente cliente={perfil.datos} />
      <div className="wallet-grid">
        <form className="surface top-up" onSubmit={recargar}>
          <SectionTitle title="Recargar cartera" subtitle="Agregue crédito manualmente" />
          <Field
            label="Cantidad a recargar (Q)"
            placeholder="0.00"
            type="number"
            step="0.01"
            value={monto}
            onChange={(event) => {
              setMonto(event.target.value)
              setAviso(null)
              recarga.reiniciar()
              // Otro monto es otra recarga: nueva clave para no chocar con la anterior (409).
              setClaveIdempotencia(nuevaClaveIdempotencia())
            }}
            required
          />
          <Field
            label="Fecha de pago"
            type="date"
            value={fechaRecarga}
            onChange={(event) => setFechaRecarga(event.target.value)}
            required
          />
          <Button type="submit" disabled={!montoValido || recarga.cargando || !cartera.datos || bloqueada}>
            {recarga.cargando ? 'Procesando...' : 'Confirmar recarga'}
          </Button>
          <AvisoError error={recarga.error} />
          {aviso && (
            <div className="success-note">
              <Icon name="check" />
              <span>{aviso}</span>
            </div>
          )}
        </form>
        <section className="surface list-surface wallet-movements-surface">
          <SectionTitle title="Movimientos" subtitle="Recargas, pagos y reembolsos, del más reciente al más antiguo" />
          <div className="wallet-filters-heading">
            <span><Icon name="settings" size={14} /> Filtrar movimientos</span>
            {(filtro.tipo || filtro.desde || filtro.hasta) && <small>Filtros activos</small>}
          </div>
          <div className="filters wallet-movement-filters">
            <label className="field">
              <span className="field-label">
                <span>Tipo</span>
              </span>
              <select
                value={filtro.tipo ?? ''}
                onChange={(event) =>
                  actualizarFiltro({ tipo: (event.target.value || undefined) as TipoMovimiento | undefined })
                }
              >
                <option value="">Todos</option>
                {TIPOS_MOVIMIENTO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {ETIQUETAS_TIPO_MOVIMIENTO[tipo]}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Desde"
              type="date"
              value={filtro.desde ?? ''}
              onChange={(event) => actualizarFiltro({ desde: event.target.value || undefined })}
            />
            <Field
              label="Hasta"
              type="date"
              value={filtro.hasta ?? ''}
              onChange={(event) => actualizarFiltro({ hasta: event.target.value || undefined })}
            />
          </div>
          {rangoInvalido ? (
            <div className="empty-inline">
              <Icon name="calendar" />
              <div>
                <strong>Rango de fechas inválido</strong>
                <p>La fecha inicial no puede ser posterior a la final.</p>
              </div>
            </div>
          ) : movimientos.error ? (
            <AvisoCartera error={movimientos.error} onReintentar={movimientos.recargar} />
          ) : !pagina && movimientos.cargando ? (
            <Cargando texto="Cargando movimientos..." />
          ) : rows.length ? (
            <DataTable headers={['Fecha', 'Descripción', 'Tipo', 'Monto', 'Saldo']} rows={rows} />
          ) : (
            <div className="filter-empty">
              <span>
                <Icon name="wallet" />
              </span>
              <strong>Sin movimientos</strong>
              <p>Sus recargas y pagos aparecerán aquí.</p>
            </div>
          )}
          {!rangoInvalido && (
            <Paginacion
              pagina={pagina}
              deshabilitada={movimientos.cargando}
              onCambiar={(numero) => setFiltro((actual) => ({ ...actual, pagina: numero }))}
            />
          )}
        </section>
      </div>
    </>
  )
}
