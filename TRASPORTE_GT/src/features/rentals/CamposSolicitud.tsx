import { SelectorPuntosMapa } from '../../components/domain/SelectorPuntosMapa'
import { Field } from '../../components/ui/Field'
import type { Sucursal } from '../../types/identityTypes'
import { sumarHorasLocal } from '../../utils/fechaHora'
import { distanciaEstimada, tieneCoordenadas, type FormularioSolicitud } from '../../utils/solicitudAlquiler'

interface CamposSolicitudProps {
  formulario: FormularioSolicitud
  onCambiar: (cambios: Partial<FormularioSolicitud>) => void
  sucursales: Sucursal[]
  /** El personal de mostrador registra en su propia sucursal. */
  sucursalFija?: boolean
  deshabilitado?: boolean
}

/** Campos de la solicitud de alquiler, compartidos por la solicitud en línea y la de mostrador. */
export function CamposSolicitud({ formulario, onCambiar, sucursales, sucursalFija = false, deshabilitado = false }: CamposSolicitudProps) {
  const conMapa = tieneCoordenadas(formulario)
  const distancia = distanciaEstimada(formulario)

  return (
    <div className="rental-trip-content">
      <section className="request-section">
        <div className="request-section-heading">
          <span className="request-section-number">02</span>
          <div>
            <h3>Detalles del viaje</h3>
            <p>Indica cuándo viaja el grupo y desde qué sucursal saldrá.</p>
          </div>
        </div>
        <div className="form-grid two">
        <Field label="Sucursal de origen" required>
          <select
            value={formulario.idSucursalOrigen}
            disabled={sucursalFija || deshabilitado}
            onChange={(event) => onCambiar({ idSucursalOrigen: event.target.value })}
            required
          >
            <option value="">Seleccione una sucursal</option>
            {sucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Número de pasajeros"
          type="number"
          value={formulario.pasajeros}
          onChange={(event) => onCambiar({ pasajeros: event.target.value })}
          disabled={deshabilitado}
          required
        />
        <Field
          label="Salida"
          type="datetime-local"
          value={formulario.salida}
          onChange={(event) => {
            const salida = event.target.value
            // El retorno acompaña a la salida para no quedar antes de ella
            onCambiar(formulario.retorno && formulario.retorno <= salida ? { salida, retorno: sumarHorasLocal(salida, 24) } : { salida })
          }}
          disabled={deshabilitado}
          required
        />
        <Field label="Tipo de viaje" required>
          <select
            value={formulario.idaYVuelta ? 'IDA_Y_VUELTA' : 'SOLO_IDA'}
            disabled={deshabilitado}
            onChange={(event) => onCambiar({ idaYVuelta: event.target.value === 'IDA_Y_VUELTA' })}
          >
            <option value="SOLO_IDA">Solo ida</option>
            <option value="IDA_Y_VUELTA">Ida y vuelta</option>
          </select>
        </Field>
        {formulario.idaYVuelta && (
          <Field
            label="Retorno"
            type="datetime-local"
            value={formulario.retorno}
            onChange={(event) => onCambiar({ retorno: event.target.value })}
            disabled={deshabilitado}
            required
          />
        )}
        </div>
      </section>
      <section className="request-section request-map-section">
        <div className="request-section-heading">
          <span className="request-section-number">03</span>
          <div>
            <h3>Define la ruta</h3>
            <p>Busca una dirección o toca el mapa para marcar origen y destino.</p>
          </div>
          <span className="route-status">{conMapa ? 'Ruta lista' : 'Falta ubicar la ruta'}</span>
        </div>
        <SelectorPuntosMapa
          origen={formulario.puntoOrigen}
          destino={formulario.puntoDestino}
          distancia={distancia}
          onCambiar={(puntoOrigen, puntoDestino) => onCambiar({ puntoOrigen, puntoDestino })}
          onLugarEncontrado={(tipo, direccion) => onCambiar({ [tipo]: direccion })}
          onSeleccionarLugar={(tipo, punto, direccion) =>
            onCambiar(tipo === 'origen' ? { puntoOrigen: punto, origen: direccion } : { puntoDestino: punto, destino: direccion })
          }
        />
        <small className="cell-note">
          {conMapa
            ? 'La distancia se calcula automáticamente con los puntos seleccionados.'
            : 'Selecciona ambos puntos para calcular la distancia y completar la solicitud.'}
        </small>
      </section>
    </div>
  )
}
