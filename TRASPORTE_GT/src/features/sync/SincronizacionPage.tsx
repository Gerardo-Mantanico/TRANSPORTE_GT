import { InfoNote } from '../../components/ui/Misc'
import { useRepublicarEventosClientes } from '../../hooks/customerWallet'
import { useRepublicarEventosFlota } from '../../hooks/fleet'
import { useRepublicarEventos } from '../../hooks/identity'
import { useRepublicarEventosViajes } from '../../hooks/trips'
import { SincronizacionCard } from './SincronizacionCard'

/**
 * Republicación de las instantáneas de cada productor (solo ADMIN_SISTEMA). Los hechos (compras, salidas,
 * reembolsos...) no se republican: repetirlos duplicaría correos y movimientos.
 */
export function SincronizacionPage() {
  const identidad = useRepublicarEventos()
  const flota = useRepublicarEventosFlota()
  const viajes = useRepublicarEventosViajes()
  const clientes = useRepublicarEventosClientes()

  return (
    <>
      <InfoNote>
        Los datos iniciales ya vienen sincronizados en todos los servicios. Use estos botones para recuperar la
        proyección de un servicio (por ejemplo, tras vaciar su base o perder mensajes). Siga el orden de la página:
        cada servicio depende de los anteriores. Es idempotente: los consumidores ignoran las versiones que ya
        aplicaron.
      </InfoNote>
      <div className="sync-grid">
        <SincronizacionCard
          servicio="Identidad"
          eventos="SucursalCreada y UsuarioCreado de todo lo existente"
          consumidores="Flota, Viajes, Alquileres, Costos, Clientes, Notificaciones y Reportes"
          republicar={identidad}
          describir={(r) => `Se encolaron ${r.sucursales} eventos de sucursales y ${r.usuarios} de usuarios.`}
        />
        <SincronizacionCard
          servicio="Flota"
          eventos="BusRegistrado y ChoferRegistrado de todo lo existente"
          consumidores="Viajes, Costos, Notificaciones y Reportes"
          republicar={flota}
          describir={(r) => `Se encolaron ${r.buses} eventos de buses y ${r.choferes} de choferes.`}
        />
        <SincronizacionCard
          servicio="Viajes"
          eventos="RutaCreada y ViajeProgramado de todo lo existente"
          consumidores="Boletos, Alquileres y Reportes"
          nota="No reenvía salidas ni llegadas: son hechos y generarían costos y kilometraje duplicados."
          republicar={viajes}
          describir={(r) => `Se encolaron ${r.rutas} eventos de rutas y ${r.viajes} de viajes.`}
        />
        <SincronizacionCard
          servicio="Clientes"
          eventos="PerfilClienteActualizado de cada cliente con su versión actual"
          consumidores="Boletos y Alquileres"
          nota="Las recargas y reembolsos de la cartera no se republican."
          republicar={clientes}
          describir={(r) => `Se encolaron ${r.clientes} perfiles de cliente.`}
        />
      </div>
    </>
  )
}
