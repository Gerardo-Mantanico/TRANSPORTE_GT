import { Avatar } from '../../components/ui/Misc'
import { useFotoPrivada } from '../../hooks/fleet'
import { iniciales } from '../../utils/format'

interface FotoPrivadaProps {
  /** `fotoUrl` del bus o chofer (ruta privada); sin foto se muestran las iniciales. */
  ruta: string | null | undefined
  nombre: string
  grande?: boolean
}

/** Foto privada de Flota: se descarga con el token por el gateway (un `<img src>` directo daría 401). */
export function FotoPrivada({ ruta, nombre, grande = false }: FotoPrivadaProps) {
  const { datos: url } = useFotoPrivada(ruta)
  if (!url) {
    return grande ? (
      <span className="avatar foto-grande">{iniciales(nombre)}</span>
    ) : (
      <Avatar name={nombre} small />
    )
  }
  return <img className={`avatar foto-privada ${grande ? 'foto-grande' : 'small'}`} src={url} alt={`Foto de ${nombre}`} />
}
