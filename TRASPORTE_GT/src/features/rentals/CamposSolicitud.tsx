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
    <>
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
          label="Origen"
          placeholder="Ciudad o dirección de salida"
          value={formulario.origen}
          onChange={(event) => onCambiar({ origen: event.target.value })}
          maxLength={150}
          disabled={deshabilitado}
          required
        />
        <Field
          label="Destino"
          placeholder="Ciudad o dirección de llegada"
          value={formulario.destino}
          onChange={(event) => onCambiar({ destino: event.target.value })}
          maxLength={150}
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
        <Field
          label="Distancia estimada (km)"
          type="number"
          step="0.01"
          placeholder={conMapa ? 'Calculada con el mapa' : 'Ej. 205.50'}
          value={conMapa ? String(distancia ?? '') : formulario.distanciaKm}
          onChange={(event) => onCambiar({ distanciaKm: event.target.value })}
          disabled={conMapa || deshabilitado}
          required={!conMapa}
        />
      </div>
      <SelectorPuntosMapa
        origen={formulario.puntoOrigen}
        destino={formulario.puntoDestino}
        onCambiar={(puntoOrigen, puntoDestino) => onCambiar({ puntoOrigen, puntoDestino })}
      />
      <small className="cell-note">
        {conMapa
          ? 'Con los dos puntos el sistema calcula la distancia por carretera (aprox.).'
          : 'Marque el origen y el destino en el mapa, o escriba la distancia en km.'}
      </small>
    </>
  )
}
