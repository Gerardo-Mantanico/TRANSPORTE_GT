import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { AvisoError } from '../../components/ui/Estado'
import { Icon } from '../../components/ui/Icon'
import { InfoNote, SectionTitle } from '../../components/ui/Misc'
import { usePerfilCliente } from '../../hooks/customerWallet'
import { useSucursales } from '../../hooks/identity'
import { useSolicitarAlquiler, useTarifaVigente } from '../../hooks/rentals'
import type { Alquiler } from '../../types/rentalTypes'
import { formatFechaHora, formatQ } from '../../utils/format'
import { puedeOperarEnLinea } from '../../utils/perfilCliente'
import {
  aSolicitudRequest,
  diasAlquiler,
  distanciaEstimada,
  formularioInicial,
  precioPrevio,
  validarFormulario,
  type FormularioSolicitud,
} from '../../utils/solicitudAlquiler'
import { AvisoPerfilCliente } from '../customerWallet/AvisoPerfilCliente'
import { CamposSolicitud } from '../rentals/CamposSolicitud'
import { MisAlquileres } from '../rentals/MisAlquileres'

export function RentalRequestPage() {
  const sucursales = useSucursales({ activa: true, size: 100, sort: 'nombre,asc' })
  const perfil = usePerfilCliente()
  const tarifa = useTarifaVigente()
  const solicitar = useSolicitarAlquiler()
  const [formulario, setFormulario] = useState<FormularioSolicitud>(() => formularioInicial())
  const [aviso, setAviso] = useState<string | null>(null)
  const [creado, setCreado] = useState<Alquiler | null>(null)
  // Cambia al registrar una solicitud para que "Mis alquileres" se vuelva a montar con la nueva
  const [envios, setEnvios] = useState(0)

  const previo = precioPrevio(formulario, tarifa.datos)
  const distancia = distanciaEstimada(formulario)
  const habilitado = puedeOperarEnLinea(perfil.datos)

  const cambiar = (cambios: Partial<FormularioSolicitud>) => {
    setFormulario((actual) => ({ ...actual, ...cambios }))
    setCreado(null)
  }

  const enviar = async () => {
    const problema = validarFormulario(formulario)
    setAviso(problema)
    if (problema) return
    const resultado = await solicitar.ejecutar(aSolicitudRequest(formulario))
    if (resultado.ok) {
      setCreado(resultado.datos)
      setFormulario(formularioInicial(formulario.idSucursalOrigen))
      setEnvios((valor) => valor + 1)
    }
  }

  return (
    <>
      <div className="form-page">
        <form
          className="surface form-card"
          onSubmit={(event) => {
            event.preventDefault()
            if (!solicitar.cargando) void enviar()
          }}
        >
          <h2>Detalles del viaje</h2>
          <CamposSolicitud
            formulario={formulario}
            onCambiar={cambiar}
            sucursales={sucursales.datos?.contenido ?? []}
            deshabilitado={solicitar.cargando}
          />
          <AvisoPerfilCliente cliente={perfil.datos} accion="alquilar buses" />
          <InfoNote>
            El administrador de la sucursal confirmará o ajustará el precio estimado. Cuando esté cotizado, páguelo con su
            cartera desde "Mis alquileres" para que quede confirmado.
          </InfoNote>
          {aviso && <p className="estimate-warn">{aviso}</p>}
          <AvisoError error={solicitar.error} />
          <Button type="submit" icon="route" disabled={solicitar.cargando || !habilitado}>
            {solicitar.cargando ? 'Enviando...' : 'Solicitar alquiler'}
          </Button>
        </form>
        <aside className="estimate-card">
          <span className="eyebrow light">Estimación</span>
          <h3>{creado ? 'Precio estimado' : 'Precio aproximado'}</h3>
          <strong>{creado ? formatQ(creado.precioEstimado) : previo !== null ? formatQ(previo) : '—'}</strong>
          <Badge tone={creado ? 'warning' : 'neutral'}>{creado ? 'Pendiente de cotización' : 'Sin enviar'}</Badge>
          {creado ? (
            <div className="success-note">
              <Icon name="check" />
              <span>
                Solicitud enviada: {creado.origen} → {creado.destino}, {formatFechaHora(creado.fechaHoraSalida)}. Le
                avisaremos por correo cuando la sucursal la cotice.
              </span>
            </div>
          ) : tarifa.datos ? (
            <p>
              {distancia !== null ? `${distancia.toLocaleString('es-GT')} km` : 'Distancia por definir'} ×{' '}
              {formatQ(tarifa.datos.precioPorKm)}/km{formulario.idaYVuelta ? ' × 2 (ida y vuelta)' : ''} +{' '}
              {diasAlquiler(formulario)} día(s) × {formatQ(tarifa.datos.precioPorDia)}. El precio exacto lo calcula el
              sistema al enviar.
            </p>
          ) : (
            <p>{tarifa.error ? tarifa.error.message : 'Cargando la tarifa vigente...'}</p>
          )}
        </aside>
      </div>
      <section className="surface list-surface">
        <SectionTitle title="Mis alquileres" subtitle="Pague aquí los alquileres ya cotizados" />
        <MisAlquileres key={envios} />
      </section>
    </>
  )
}
