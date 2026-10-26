import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { InfoNote, SectionTitle } from '../../components/ui/Misc'
import { useRegistrarTarifa, useTarifas } from '../../hooks/rentals'
import { formatDateEs, formatQ, hoyIso } from '../../utils/format'

/** Tarifas del precio estimado de alquileres (ADMIN_SISTEMA). Se conserva el historial. */
export function TarifasCard() {
  const tarifas = useTarifas()
  const registrar = useRegistrarTarifa()
  const [porKm, setPorKm] = useState('')
  const [porDia, setPorDia] = useState('')
  const [desde, setDesde] = useState(hoyIso())
  const [guardada, setGuardada] = useState<string | null>(null)
  const hoy = hoyIso()
  const vigente = (tarifas.datos ?? []).find((tarifa) => tarifa.vigenteDesde <= hoy) ?? null

  const guardar = async () => {
    setGuardada(null)
    const resultado = await registrar.ejecutar({ precioPorKm: Number(porKm), precioPorDia: Number(porDia), vigenteDesde: desde })
    if (resultado.ok) {
      setGuardada(`Tarifa de ${formatQ(resultado.datos.precioPorKm)}/km y ${formatQ(resultado.datos.precioPorDia)}/día desde ${formatDateEs(resultado.datos.vigenteDesde)}.`)
      setPorKm('')
      setPorDia('')
      tarifas.recargar()
    }
  }

  return (
    <section className="surface form-card">
      <SectionTitle title="Tarifas de alquiler" subtitle="Precio estimado = km × precio por km (×2 ida y vuelta) + días × precio por día" />
      {tarifas.error ? (
        <AvisoError error={tarifas.error} onReintentar={tarifas.recargar} />
      ) : !tarifas.datos && tarifas.cargando ? (
        <Cargando texto="Cargando tarifas..." />
      ) : (
        <div className="read-only-row">
          <span>Vigente</span>
          <strong>{vigente ? `${formatQ(vigente.precioPorKm)}/km · ${formatQ(vigente.precioPorDia)}/día` : 'Sin tarifa'}</strong>
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
          <Field label="Precio por km (Q)" type="number" step="0.01" value={porKm} onChange={(event) => setPorKm(event.target.value)} required />
          <Field label="Precio por día (Q)" type="number" step="0.01" value={porDia} onChange={(event) => setPorDia(event.target.value)} required />
          <Field label="Vigente desde" type="date" value={desde} onChange={(event) => setDesde(event.target.value)} required />
        </div>
        <InfoNote>
          No altera las cotizaciones ya hechas. Una tarifa con la misma fecha reemplaza a la anterior; no se aceptan fechas pasadas.
        </InfoNote>
        <Button type="submit" disabled={registrar.cargando}>
          {registrar.cargando ? 'Guardando...' : 'Registrar tarifa'}
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
          <strong>
            {formatQ(tarifa.precioPorKm)}/km · {formatQ(tarifa.precioPorDia)}/día
          </strong>
        </div>
      ))}
    </section>
  )
}
