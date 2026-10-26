import { useState } from 'react'
import { useAuth } from '../../app/providers/useAuth'
import { AvisoError } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FormModal } from '../../components/ui/FormModal'
import { useSucursales } from '../../hooks/identity'
import { useSolicitarAlquilerMostrador, useTarifaVigente } from '../../hooks/rentals'
import type { Alquiler } from '../../types/rentalTypes'
import { formatQ } from '../../utils/format'
import { aSolicitudRequest, formularioInicial, precioPrevio, validarFormulario, type FormularioSolicitud } from '../../utils/solicitudAlquiler'
import { BuscarClienteNit } from '../customerWallet/BuscarClienteNit'
import { CamposSolicitud } from './CamposSolicitud'

/** Solicitud presencial (SUC y CAJ): el cliente no necesita cuenta; sin NIT queda como consumidor final. */
export function MostradorModal({ onClose, onRegistrado }: { onClose: () => void; onRegistrado: (alquiler: Alquiler) => void }) {
  const { usuario } = useAuth()
  const registrar = useSolicitarAlquilerMostrador()
  const sucursales = useSucursales({ activa: true, size: 100, sort: 'nombre,asc' })
  const tarifa = useTarifaVigente()
  const [formulario, setFormulario] = useState<FormularioSolicitud>(() => formularioInicial(usuario?.idSucursal ?? ''))
  const [nit, setNit] = useState('')
  const [nombre, setNombre] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)
  const previo = precioPrevio(formulario, tarifa.datos)

  const guardar = async () => {
    const problema = !nombre.trim() ? 'Indique el nombre del cliente.' : validarFormulario(formulario)
    setAviso(problema)
    if (problema) return
    const resultado = await registrar.ejecutar({
      solicitud: aSolicitudRequest(formulario),
      nitCliente: nit.trim() || null,
      nombreCliente: nombre.trim(),
    })
    if (resultado.ok) onRegistrado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow="Mostrador"
      title="Nueva solicitud de alquiler"
      subtitle="Completa la información para registrar la solicitud"
      actionLabel={previo !== null ? `Registrar · ${formatQ(previo)} aprox.` : 'Registrar solicitud'}
      fullScreen
      enviando={registrar.cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <div className="rental-request-content">
        <section className="request-section request-client-section">
          <div className="request-section-heading">
            <span className="request-section-number">01</span>
            <div>
              <h3>Datos del cliente</h3>
              <p>Busca al cliente por NIT o registra su nombre.</p>
            </div>
          </div>
          <div className="form-grid two">
            <BuscarClienteNit
              onNitChange={setNit}
              onEncontrado={(cliente) => {
                if (cliente) setNombre(cliente.nombreCompleto)
              }}
              deshabilitado={registrar.cargando}
            />
            <Field label="Nombre del cliente" value={nombre} onChange={(event) => setNombre(event.target.value)} maxLength={150} required />
          </div>
        </section>
        <CamposSolicitud
          formulario={formulario}
          onCambiar={(cambios) => setFormulario((actual) => ({ ...actual, ...cambios }))}
          sucursales={sucursales.datos?.contenido ?? []}
          sucursalFija={Boolean(usuario?.idSucursal)}
          deshabilitado={registrar.cargando}
        />
      </div>
      {aviso && <p className="estimate-warn">{aviso}</p>}
      <AvisoError error={tarifa.error} />
      <AvisoError error={registrar.error} />
    </FormModal>
  )
}
