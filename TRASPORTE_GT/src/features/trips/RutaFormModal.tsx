import { useState } from 'react'
import { ApiError } from '../../api/ApiError'
import { AvisoError } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FormModal } from '../../components/ui/FormModal'
import { InfoNote } from '../../components/ui/Misc'
import { useCrearRuta, useEditarRuta } from '../../hooks/trips'
import type { Sucursal } from '../../types/identityTypes'
import type { Ruta } from '../../types/tripTypes'

interface RutaFormModalProps {
  /** Al editar; sin ruta se crea una nueva desde la sucursal del administrador. */
  ruta?: Ruta
  idSucursalOrigen: string
  sucursales: Sucursal[]
  onClose: () => void
  onGuardado: (ruta: Ruta) => void
}

export function RutaFormModal({ ruta, idSucursalOrigen, sucursales, onClose, onGuardado }: RutaFormModalProps) {
  const crear = useCrearRuta()
  const editar = useEditarRuta()
  const [idSucursalDestino, setIdSucursalDestino] = useState(ruta?.idSucursalDestino ?? '')
  const [distancia, setDistancia] = useState(ruta ? String(ruta.distanciaKm) : '')
  const [precio, setPrecio] = useState(ruta ? String(ruta.precioBoleto) : '')
  const [errorLocal, setErrorLocal] = useState<ApiError | null>(null)
  const origen = ruta?.idSucursalOrigen ?? idSucursalOrigen
  const nombreOrigen = sucursales.find((sucursal) => sucursal.id === origen)?.nombre ?? 'Su sucursal'
  const destinos = sucursales.filter((sucursal) => sucursal.id !== origen && (sucursal.activa || sucursal.id === idSucursalDestino))

  const guardar = async () => {
    const invalido = (mensaje: string) => new ApiError(400, 'VALIDACION_FALLIDA', mensaje)
    const km = Number(distancia)
    const monto = Number(precio)
    const error = !idSucursalDestino
      ? invalido('Seleccione la sucursal de destino.')
      : !(km > 0)
        ? invalido('La distancia debe ser mayor que cero.')
        : !(monto >= 0) || precio.trim() === ''
          ? invalido('El precio del boleto no puede ser negativo.')
          : null
    setErrorLocal(error)
    if (error) return
    const datos = { idSucursalOrigen: origen, idSucursalDestino, distanciaKm: km, precioBoleto: monto }
    const resultado = ruta ? await editar.ejecutar({ id: ruta.id, ...datos }) : await crear.ejecutar(datos)
    if (resultado.ok) onGuardado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow={ruta ? 'Editar registro' : 'Nuevo registro'}
      title={ruta ? 'Editar ruta' : 'Nueva ruta'}
      actionLabel={ruta ? 'Guardar cambios' : 'Crear ruta'}
      enviando={crear.cargando || editar.cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <div className="form-grid two">
        <Field label="Sucursal de origen" value={nombreOrigen} disabled />
        <Field label="Sucursal de destino" required>
          <select value={idSucursalDestino} onChange={(event) => setIdSucursalDestino(event.target.value)} required>
            <option value="" disabled>
              Seleccione una opción
            </option>
            {destinos.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Distancia aproximada (km)"
          type="number"
          step="0.01"
          placeholder="205.5"
          value={distancia}
          onChange={(event) => setDistancia(event.target.value)}
          required
        />
        <Field
          label="Precio del boleto (Q)"
          type="number"
          step="0.01"
          placeholder="85.00"
          value={precio}
          onChange={(event) => setPrecio(event.target.value)}
          required
        />
      </div>
      <InfoNote>
        {ruta
          ? 'El nuevo precio aplica a los viajes que se programen después; los ya programados conservan el suyo.'
          : 'Solo usted, como administrador de la sucursal de origen, podrá gestionar esta ruta.'}
      </InfoNote>
      <AvisoError error={errorLocal ?? crear.error ?? editar.error} />
    </FormModal>
  )
}
