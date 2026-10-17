import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { AvisoError } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { Avatar } from '../../components/ui/Misc'
import { useBuscarClientePorNit } from '../../hooks/customerWallet'
import type { ClienteBusqueda } from '../../types/customerWalletTypes'

/** Busca el cliente por NIT para enlazar una venta de mostrador (CAJERO y ADMIN_SUCURSAL). */
export function BuscarClienteNit({ onEncontrado }: { onEncontrado?: (cliente: ClienteBusqueda | null) => void }) {
  const { ejecutar, cargando, error, reiniciar } = useBuscarClientePorNit()
  const [nit, setNit] = useState('')
  const [cliente, setCliente] = useState<ClienteBusqueda | null>(null)
  const generico = nit.trim().toUpperCase() === 'CF'

  const buscar = async () => {
    const valor = nit.trim()
    if (!valor || generico || cargando) return
    const resultado = await ejecutar(valor)
    const encontrado = resultado.ok ? resultado.datos : null
    setCliente(encontrado)
    onEncontrado?.(encontrado)
  }

  return (
    <div>
      <Field
        label="NIT del cliente"
        action={
          <button type="button" className="text-button" onClick={buscar} disabled={cargando || !nit.trim() || generico}>
            {cargando ? 'Buscando...' : 'Buscar'}
          </button>
        }
      >
        <input
          placeholder="CF / 1234567-8"
          value={nit}
          onChange={(event) => {
            setNit(event.target.value)
            setCliente(null)
            reiniciar()
            onEncontrado?.(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void buscar()
            }
          }}
        />
      </Field>
      {cliente && (
        <div className="person-card">
          <Avatar name={cliente.nombreCompleto} small />
          <div>
            <strong>{cliente.nombreCompleto}</strong>
            <small>NIT {cliente.nit}</small>
          </div>
          <Badge tone={cliente.activo === false ? 'neutral' : 'success'}>
            {cliente.activo === false ? 'Cuenta inactiva' : 'Cliente registrado'}
          </Badge>
        </div>
      )}
      {error?.status === 404 ? (
        <div className="empty-inline">
          <div>
            <strong>No hay cliente con ese NIT</strong>
            <p>Puede continuar con el cliente genérico del mostrador.</p>
          </div>
        </div>
      ) : (
        <AvisoError error={error} />
      )}
    </div>
  )
}
