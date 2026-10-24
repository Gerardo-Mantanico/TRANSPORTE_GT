import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { AvisoError } from '../../components/ui/Estado'
import { Icon } from '../../components/ui/Icon'
import { InfoNote, SectionTitle } from '../../components/ui/Misc'
import { useRepublicarEventosFlota } from '../../hooks/fleet'
import { useRepublicarEventos } from '../../hooks/identity'
import { useRepublicarEventosViajes } from '../../hooks/trips'
import type { RepublicacionFlotaResponse } from '../../types/fleetTypes'
import type { RepublicacionResponse } from '../../types/identityTypes'
import type { RepublicacionViajesResponse } from '../../types/tripTypes'
import { TarifaDepreciacionCard } from '../costs/TarifaDepreciacionCard'
import { TarifasCard } from '../rentals/TarifasCard'

const PERMANENT_RULES = [
  'Los usuarios no se eliminan; solo se desactivan.',
  'Debe existir al menos un administrador de sistema activo.',
  'Cada sucursal mantiene un administrador enlazado.',
  'Los registros de salida y llegada son inmutables.',
]

export function SettingsPage() {
  const republicar = useRepublicarEventos()
  const [republicados, setRepublicados] = useState<RepublicacionResponse | null>(null)

  const republicarFlota = useRepublicarEventosFlota()
  const [republicadosFlota, setRepublicadosFlota] = useState<RepublicacionFlotaResponse | null>(null)

  const republicarViajes = useRepublicarEventosViajes()
  const [republicadosViajes, setRepublicadosViajes] = useState<RepublicacionViajesResponse | null>(null)

  const handleRepublicarViajes = async () => {
    setRepublicadosViajes(null)
    const resultado = await republicarViajes.ejecutar()
    if (resultado.ok) setRepublicadosViajes(resultado.datos)
  }

  const handleRepublicarFlota = async () => {
    setRepublicadosFlota(null)
    const resultado = await republicarFlota.ejecutar()
    if (resultado.ok) setRepublicadosFlota(resultado.datos)
  }

  const handleRepublicar = async () => {
    setRepublicados(null)
    const resultado = await republicar.ejecutar()
    if (resultado.ok) setRepublicados(resultado.datos)
  }

  return (
    <>
      <div className="settings-grid">
        <TarifaDepreciacionCard />
        <section className="surface form-card">
          <SectionTitle
            title="Sincronizar Identidad"
            subtitle="Republica las sucursales y usuarios actuales hacia los demás servicios"
          />
          <InfoNote>
            Útil al levantar un servicio nuevo o tras cargar datos iniciales. Es idempotente: los consumidores
            ignoran las versiones que ya aplicaron.
          </InfoNote>
          <Button variant="secondary" onClick={handleRepublicar} disabled={republicar.cargando}>
            {republicar.cargando ? 'Republicando...' : 'Republicar eventos'}
          </Button>
          <AvisoError error={republicar.error} />
          {republicados && (
            <div className="success-note">
              <Icon name="check" />
              <span>
                Se encolaron {republicados.sucursales} eventos de sucursales y {republicados.usuarios} de usuarios.
              </span>
            </div>
          )}
        </section>
        <section className="surface form-card">
          <SectionTitle
            title="Sincronizar Flota"
            subtitle="Republica los buses y choferes actuales hacia Viajes, Reportes y Notificaciones"
          />
          <InfoNote>
            Publica BusRegistrado y ChoferRegistrado de todo lo existente. Es idempotente: los consumidores
            ignoran las versiones que ya aplicaron.
          </InfoNote>
          <Button variant="secondary" onClick={handleRepublicarFlota} disabled={republicarFlota.cargando}>
            {republicarFlota.cargando ? 'Republicando...' : 'Republicar eventos de Flota'}
          </Button>
          <AvisoError error={republicarFlota.error} />
          {republicadosFlota && (
            <div className="success-note">
              <Icon name="check" />
              <span>
                Se encolaron {republicadosFlota.buses} eventos de buses y {republicadosFlota.choferes} de choferes.
              </span>
            </div>
          )}
        </section>
        <section className="surface form-card">
          <SectionTitle
            title="Sincronizar Viajes"
            subtitle="Republica las rutas y viajes actuales hacia Boletos, Alquileres y Reportes"
          />
          <InfoNote>
            Publica RutaCreada y ViajeProgramado de todo lo existente (no reenvía salidas ni llegadas). Es idempotente.
          </InfoNote>
          <Button variant="secondary" onClick={handleRepublicarViajes} disabled={republicarViajes.cargando}>
            {republicarViajes.cargando ? 'Republicando...' : 'Republicar eventos de Viajes'}
          </Button>
          <AvisoError error={republicarViajes.error} />
          {republicadosViajes && (
            <div className="success-note">
              <Icon name="check" />
              <span>
                Se encolaron {republicadosViajes.rutas} eventos de rutas y {republicadosViajes.viajes} de viajes.
              </span>
            </div>
          )}
        </section>
        <TarifasCard />
        <section className="surface rules-card">
          <h2>Reglas permanentes</h2>
          {PERMANENT_RULES.map((rule) => (
            <div key={rule}>
              <Icon name="check" />
              <span>{rule}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}
