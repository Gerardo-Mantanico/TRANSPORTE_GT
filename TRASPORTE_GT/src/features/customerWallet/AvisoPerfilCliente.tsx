import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import type { Cliente } from '../../types/customerWalletTypes'
import { carteraBloqueada } from '../../utils/perfilCliente'

/** Explica por qué el usuario no puede pagar: cuenta desactivada o perfil sin NIT. */
export function AvisoPerfilCliente({ cliente, accion = 'comprar boletos o alquilar buses' }: { cliente: Cliente | null; accion?: string }) {
  if (!cliente) return null
  if (carteraBloqueada(cliente)) {
    return (
      <div className="form-error" role="alert">
        <Icon name="close" size={15} />
        <div>
          <strong>Su cartera está bloqueada</strong>
          <small>Su usuario está desactivado. Comuníquese con un administrador para reactivarlo.</small>
        </div>
      </div>
    )
  }
  if (!cliente.nit) {
    return (
      <div className="persistent-note">
        <Icon name="user" />
        <span>
          Para {accion} en línea debe registrar su NIT en <Link to="/perfil">Mi perfil</Link>.
        </span>
      </div>
    )
  }
  return null
}
