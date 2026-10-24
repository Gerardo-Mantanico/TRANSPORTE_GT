import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { AvisoError } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FormModal } from '../../components/ui/FormModal'
import { InfoNote } from '../../components/ui/Misc'
import { useCategorias, useRegistrarGastoTaller } from '../../hooks/costs'
import type { Bus } from '../../types/fleetTypes'
import { ETIQUETAS_TIPO_LINEA, type GastoTaller, type TipoLineaTaller } from '../../types/costsTypes'
import { formatQ, hoyIso } from '../../utils/format'

interface LineaFormulario {
  clave: number
  idCategoria: string
  descripcion: string
  tipo: TipoLineaTaller
  monto: string
}

const lineaVacia = (clave: number): LineaFormulario => ({ clave, idCategoria: '', descripcion: '', tipo: 'MANO_DE_OBRA', monto: '' })

/** Registro de un servicio de taller (SUC). Es inmutable: la categoría es obligatoria en cada línea. */
export function GastoTallerModal({
  buses,
  onClose,
  onRegistrado,
}: {
  buses: Bus[]
  onClose: () => void
  onRegistrado: (gasto: GastoTaller) => void
}) {
  const registrar = useRegistrarGastoTaller()
  const categorias = useCategorias({ activa: true })
  const [idBus, setIdBus] = useState('')
  const [fechaServicio, setFechaServicio] = useState(hoyIso())
  const [observaciones, setObservaciones] = useState('')
  const [lineas, setLineas] = useState<LineaFormulario[]>([lineaVacia(1)])
  const [aviso, setAviso] = useState<string | null>(null)
  const total = lineas.reduce((suma, linea) => suma + (Number(linea.monto) || 0), 0)

  const cambiarLinea = (clave: number, cambios: Partial<LineaFormulario>) =>
    setLineas((actuales) => actuales.map((linea) => (linea.clave === clave ? { ...linea, ...cambios } : linea)))

  const guardar = async () => {
    const incompleta = lineas.find((linea) => !linea.idCategoria || !linea.descripcion.trim() || linea.monto === '')
    const problema = !idBus ? 'Elija el bus.' : fechaServicio > hoyIso() ? 'La fecha del servicio no puede ser futura.' : incompleta ? 'Complete categoría, descripción y monto de cada línea.' : null
    setAviso(problema)
    if (problema) return
    const resultado = await registrar.ejecutar({
      idBus,
      fechaServicio,
      observaciones: observaciones.trim() || null,
      lineas: lineas.map((linea) => ({
        idCategoria: linea.idCategoria,
        descripcion: linea.descripcion.trim(),
        tipo: linea.tipo,
        monto: Number(linea.monto),
      })),
    })
    if (resultado.ok) onRegistrado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow="Taller y repuestos"
      title="Registrar servicio de taller"
      actionLabel={`Registrar · ${formatQ(total)}`}
      enviando={registrar.cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <div className="form-grid two">
        <Field label="Bus" required>
          <select value={idBus} onChange={(event) => setIdBus(event.target.value)} required>
            <option value="">Seleccione un bus</option>
            {buses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.placa} · {bus.marca} {bus.modelo}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fecha del servicio" type="date" value={fechaServicio} onChange={(event) => setFechaServicio(event.target.value)} required />
      </div>
      <Field label="Observaciones" value={observaciones} onChange={(event) => setObservaciones(event.target.value)} maxLength={500} />
      <div className="summary-label">Líneas del gasto</div>
      {lineas.map((linea) => (
        <div className="form-grid two" key={linea.clave}>
          <Field label="Categoría" required>
            <select value={linea.idCategoria} onChange={(event) => cambiarLinea(linea.clave, { idCategoria: event.target.value })} required>
              <option value="">Seleccione</option>
              {(categorias.datos ?? []).map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tipo" required>
            <select value={linea.tipo} onChange={(event) => cambiarLinea(linea.clave, { tipo: event.target.value as TipoLineaTaller })}>
              {(Object.keys(ETIQUETAS_TIPO_LINEA) as TipoLineaTaller[]).map((tipo) => (
                <option key={tipo} value={tipo}>
                  {ETIQUETAS_TIPO_LINEA[tipo]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Descripción" value={linea.descripcion} onChange={(event) => cambiarLinea(linea.clave, { descripcion: event.target.value })} maxLength={250} required />
          <Field
            label="Monto (Q)"
            type="number"
            step="0.01"
            value={linea.monto}
            onChange={(event) => cambiarLinea(linea.clave, { monto: event.target.value })}
            required
            action={
              lineas.length > 1 ? (
                <button type="button" className="text-button" onClick={() => setLineas((actuales) => actuales.filter((l) => l.clave !== linea.clave))}>
                  Quitar
                </button>
              ) : undefined
            }
          />
        </div>
      ))}
      <Button variant="secondary" icon="plus" onClick={() => setLineas((actuales) => [...actuales, lineaVacia(Math.max(...actuales.map((l) => l.clave)) + 1)])}>
        Agregar línea
      </Button>
      <InfoNote>El gasto no se puede modificar después de registrarlo. El total lo calcula el sistema.</InfoNote>
      {!categorias.cargando && !(categorias.datos ?? []).length && (
        <p className="estimate-warn">No hay categorías activas: cree una en "Categorías" antes de registrar gastos.</p>
      )}
      {aviso && <p className="estimate-warn">{aviso}</p>}
      <AvisoError error={categorias.error} />
      <AvisoError error={registrar.error} />
    </FormModal>
  )
}
