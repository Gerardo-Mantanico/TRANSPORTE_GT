import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { InfoNote, SectionTitle } from '../../components/ui/Misc'
import { useRegistrarTarifaDepreciacion, useTarifasDepreciacion } from '../../hooks/costs'
import { formatDateEs, formatQ, hoyIso } from '../../utils/format'

/** Tarifa de depreciación por kilómetro (ADMIN_SISTEMA). Se aplica a los cierres de viaje desde su vigencia. */
export function TarifaDepreciacionCard() {
  const tarifas = useTarifasDepreciacion()
  const registrar = useRegistrarTarifaDepreciacion()
  const [monto, setMonto] = useState('')
  const [desde, setDesde] = useState(hoyIso())
  const [guardada, setGuardada] = useState<string | null>(null)
  const hoy = hoyIso()
  const vigente = (tarifas.datos ?? []).find((tarifa) => tarifa.vigenteDesde <= hoy) ?? null

  const guardar = async () => {
    setGuardada(null)
    const resultado = await registrar.ejecutar({ montoPorKm: Number(monto), vigenteDesde: desde })
    if (resultado.ok) {
      setGuardada(`Depreciación de ${formatQ(resultado.datos.montoPorKm)} por km desde ${formatDateEs(resultado.datos.vigenteDesde)}.`)
      setMonto('')
      tarifas.recargar()
    }
  }

  return (
    <section className="surface form-card">
      <SectionTitle title="Depreciación por kilometraje" subtitle="Monto por km aplicado a los nuevos cierres de viaje" />
      {tarifas.error ? (
        <AvisoError error={tarifas.error} onReintentar={tarifas.recargar} />
      ) : !tarifas.datos && tarifas.cargando ? (
        <Cargando texto="Cargando tarifas..." />
      ) : (
        <div className="read-only-row">
          <span>Vigente</span>
          <strong>{vigente ? `${formatQ(vigente.montoPorKm)} por km` : 'Sin tarifa'}</strong>
          <span>Desde</span>
          <strong>{vigente ? formatDateEs(vigente.vigenteDesde) : '—'}</strong>
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!registrar.cargando) void guardar()
        }}
      >
        <div className="form-grid two">
          <Field label="Costo por kilómetro (Q)" type="number" step="0.01" value={monto} onChange={(event) => setMonto(event.target.value)} required />
          <Field label="Vigente desde" type="date" value={desde} onChange={(event) => setDesde(event.target.value)} required />
        </div>
        <InfoNote>
          No altera lo ya calculado: cada viaje conserva el monto vigente al registrar su llegada. Una tarifa con la misma
          fecha reemplaza a la anterior.
        </InfoNote>
        <Button type="submit" disabled={registrar.cargando}>
          {registrar.cargando ? 'Guardando...' : 'Guardar tarifa'}
        </Button>
      </form>
      <AvisoError error={registrar.error} />
      {guardada && (
        <div className="success-note">
          <Icon name="check" />
          <span>{guardada}</span>
        </div>
      )}
      {(tarifas.datos ?? []).slice(0, 5).map((tarifa) => (
        <div className="read-only-row" key={tarifa.id}>
          <span>{formatDateEs(tarifa.vigenteDesde)}</span>
          <strong>{formatQ(tarifa.montoPorKm)} por km</strong>
        </div>
      ))}
    </section>
  )
}
