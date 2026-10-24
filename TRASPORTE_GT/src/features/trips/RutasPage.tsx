import { useMemo, useState } from 'react'
import { useAuth } from '../../app/providers/useAuth'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { AvisoError, Cargando } from '../../components/ui/Estado'
import { FilterToolbar } from '../../components/ui/FilterToolbar'
import { FormModal } from '../../components/ui/FormModal'
import { Icon } from '../../components/ui/Icon'
import { InfoNote } from '../../components/ui/Misc'
import { useSucursales } from '../../hooks/identity'
import { useEliminarRuta, useRutas } from '../../hooks/trips'
import type { FiltroRutas, Ruta } from '../../types/tripTypes'
import { cellText } from '../../utils/cellText'
import { formatQ } from '../../utils/format'
import { RutaFormModal } from './RutaFormModal'

type ModalRutas = { tipo: 'crear' } | { tipo: 'editar'; ruta: Ruta } | { tipo: 'eliminar'; ruta: Ruta }

/**
 * Rutas que administra el ADMIN_SUCURSAL: siempre las de origen en su sucursal (las únicas que puede gestionar).
 * GET /rutas devuelve todas a cualquier autenticado; el filtro por origen lo pone esta pantalla.
 */
export function RutasPage() {
  const { usuario } = useAuth()
  const miSucursal = usuario?.idSucursal ?? ''
  const [idSucursalDestino, setIdSucursalDestino] = useState<string | undefined>(undefined)
  const [texto, setTexto] = useState('')
  const filtro: FiltroRutas = { idSucursalOrigen: miSucursal || undefined, idSucursalDestino }
  const rutas = useRutas(filtro, Boolean(miSucursal))
  const sucursales = useSucursales({ size: 100, sort: 'nombre,asc' })
  const eliminar = useEliminarRuta()
  const [modal, setModal] = useState<ModalRutas | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const listaSucursales = useMemo(() => sucursales.datos?.contenido ?? [], [sucursales.datos])
  const nombres = useMemo(() => new Map(listaSucursales.map((sucursal) => [sucursal.id, sucursal.nombre])), [listaSucursales])
  const nombre = (id: string) => nombres.get(id) ?? '—'

  const terminar = (mensaje: string) => {
    setModal(null)
    setAviso(mensaje)
    rutas.recargar()
  }

  const confirmarEliminar = async (ruta: Ruta) => {
    const resultado = await eliminar.ejecutar(ruta.id)
    if (resultado.ok) terminar(`La ruta ${nombre(ruta.idSucursalOrigen)} → ${nombre(ruta.idSucursalDestino)} se eliminó.`)
  }

  const todas = (rutas.datos ?? []).map((ruta) => {
    const propia = ruta.idSucursalOrigen === miSucursal
    return [
      <strong>
        {nombre(ruta.idSucursalOrigen)} <span className="route-arrow">→</span> {nombre(ruta.idSucursalDestino)}
      </strong>,
      `${ruta.distanciaKm.toLocaleString('es-GT')} km`,
      formatQ(ruta.precioBoleto),
      propia ? (
        <div className="row-actions">
          <Button variant="ghost" onClick={() => setModal({ tipo: 'editar', ruta })}>
            Editar
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              eliminar.reiniciar()
              setModal({ tipo: 'eliminar', ruta })
            }}
          >
            Eliminar
          </Button>
        </div>
      ) : (
        <span className="guard-label">Gestionada por la sucursal de origen</span>
      ),
    ]
  })
  const busqueda = texto.trim().toLocaleLowerCase('es')
  const rows = busqueda ? todas.filter((row) => cellText(row).toLocaleLowerCase('es').includes(busqueda)) : todas

  return (
    <>
      <section className="surface list-surface">
        <FilterToolbar
          searchPlaceholder="Buscar por sucursal..."
          onSearch={setTexto}
          action={miSucursal ? 'Nueva ruta' : undefined}
          onAction={miSucursal ? () => setModal({ tipo: 'crear' }) : undefined}
        >
          <label className="field">
            <span className="field-label">
              <span>Origen</span>
            </span>
            <input value={miSucursal ? `${nombre(miSucursal)} (mi sucursal)` : 'Sin sucursal asignada'} disabled />
          </label>
          <label className="field">
            <span className="field-label">
              <span>Destino</span>
            </span>
            <select value={idSucursalDestino ?? ''} onChange={(event) => setIdSucursalDestino(event.target.value || undefined)}>
              <option value="">Todos los destinos</option>
              {listaSucursales.filter((sucursal) => sucursal.id !== miSucursal).map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre}
                </option>
              ))}
            </select>
          </label>
        </FilterToolbar>
        {aviso && (
          <div className="success-note" role="status">
            <Icon name="check" />
            <span>{aviso}</span>
          </div>
        )}
        {rutas.error ? (
          <AvisoError error={rutas.error} onReintentar={rutas.recargar} />
        ) : !rutas.datos && rutas.cargando ? (
          <Cargando texto="Cargando rutas..." />
        ) : rows.length ? (
          <DataTable headers={['Ruta', 'Distancia', 'Precio del boleto', 'Acciones']} rows={rows} />
        ) : (
          <div className="filter-empty">
            <span>
              <Icon name="route" />
            </span>
            <strong>No hay rutas</strong>
            <p>{miSucursal ? 'Cree una ruta desde su sucursal o cambie el destino.' : 'Su usuario no tiene sucursal asignada.'}</p>
          </div>
        )}
      </section>
      {(modal?.tipo === 'crear' || modal?.tipo === 'editar') && (
        <RutaFormModal
          ruta={modal.tipo === 'editar' ? modal.ruta : undefined}
          idSucursalOrigen={miSucursal}
          sucursales={listaSucursales}
          onClose={() => setModal(null)}
          onGuardado={(ruta) =>
            terminar(
              `Ruta ${nombre(ruta.idSucursalOrigen)} → ${nombre(ruta.idSucursalDestino)} ${modal.tipo === 'editar' ? 'actualizada' : 'creada'}.`,
            )
          }
        />
      )}
      {modal?.tipo === 'eliminar' && (
        <FormModal
          eyebrow="Acción destructiva"
          title="Eliminar ruta"
          actionLabel="Eliminar"
          danger
          enviando={eliminar.cargando}
          onSubmit={() => confirmarEliminar(modal.ruta)}
          onClose={() => setModal(null)}
        >
          <p className="modal-paragraph">
            ¿Desea eliminar la ruta{' '}
            <strong>
              {nombre(modal.ruta.idSucursalOrigen)} → {nombre(modal.ruta.idSucursalDestino)}
            </strong>
            ?
          </p>
          <InfoNote>Solo se puede eliminar una ruta sin viajes asociados.</InfoNote>
          <AvisoError error={eliminar.error} />
        </FormModal>
      )}
    </>
  )
}
