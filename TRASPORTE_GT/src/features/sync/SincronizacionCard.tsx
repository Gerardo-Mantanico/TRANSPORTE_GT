import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { AvisoError } from '../../components/ui/Estado'
import { Icon } from '../../components/ui/Icon'
import { SectionTitle } from '../../components/ui/Misc'
import type { Mutacion } from '../../hooks/useMutacion'

interface SincronizacionCardProps<R> {
  servicio: string
  /** Eventos que vuelve a encolar el productor. */
  eventos: string
  /** Servicios que reconstruyen su proyección con esos eventos. */
  consumidores: string
  nota?: string
  republicar: Mutacion<void, R>
  /** Texto con los conteos de la respuesta. */
  describir: (resultado: R) => string
}

export function SincronizacionCard<R>({
  servicio,
  eventos,
  consumidores,
  nota,
  republicar,
  describir,
}: SincronizacionCardProps<R>) {
  const [resultado, setResultado] = useState<R | null>(null)

  const handleRepublicar = async () => {
    setResultado(null)
    const respuesta = await republicar.ejecutar()
    if (respuesta.ok) setResultado(respuesta.datos)
  }

  return (
    <section className="surface form-card sync-card">
      <SectionTitle title={`Sincronizar ${servicio}`} subtitle={`Hacia ${consumidores}`} />
      <dl className="sync-card-detalle">
        <dt>Publica</dt>
        <dd>{eventos}</dd>
        {nota && (
          <>
            <dt>Nota</dt>
            <dd>{nota}</dd>
          </>
        )}
      </dl>
      <Button variant="secondary" onClick={handleRepublicar} disabled={republicar.cargando}>
        <Icon name="sync" size={15} />
        {republicar.cargando ? 'Republicando...' : `Republicar eventos de ${servicio}`}
      </Button>
      <AvisoError error={republicar.error} />
      {resultado !== null && (
        <div className="success-note">
          <Icon name="check" />
          <span>{describir(resultado)}</span>
        </div>
      )}
    </section>
  )
}
