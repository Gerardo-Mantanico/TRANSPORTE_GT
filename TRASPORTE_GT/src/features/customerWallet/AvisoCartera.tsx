import type { ApiError } from '../../api/ApiError'
import { Button } from '../../components/ui/Button'
import { AvisoError } from '../../components/ui/Estado'
import { Icon } from '../../components/ui/Icon'

/**
 * El perfil y la cartera se crean de forma asíncrona al consumir `UsuarioCreado` (para cualquier rol).
 * Un 404 justo después de crear el usuario no es un error: el perfil todavía no llega.
 */
export function AvisoCartera({ error, onReintentar }: { error: ApiError | null; onReintentar: () => void }) {
  if (!error) return null
  if (error.status !== 404) return <AvisoError error={error} onReintentar={onReintentar} />
  return (
    <div className="empty-inline">
      <Icon name="clock" />
      <div>
        <strong>Estamos preparando su cartera</strong>
        <p>
          Su perfil y su cartera se crean automáticamente después de crear su usuario. Intente de nuevo en unos
          segundos.
        </p>
      </div>
      <Button variant="ghost" onClick={onReintentar}>
        Reintentar
      </Button>
    </div>
  )
}
