import type { ApiError } from '../../api/ApiError'
import { AvisoError } from '../../components/ui/Estado'
import { FormModal } from '../../components/ui/FormModal'
import { InfoNote } from '../../components/ui/Misc'

interface ConfirmarEstadoModalProps {
  recurso: string
  nombre: string
  activar: boolean
  nota: string
  cargando: boolean
  error: ApiError | null
  onConfirmar: () => void
  onClose: () => void
}

export function ConfirmarEstadoModal({
  recurso,
  nombre,
  activar,
  nota,
  cargando,
  error,
  onConfirmar,
  onClose,
}: ConfirmarEstadoModalProps) {
  return (
    <FormModal
      eyebrow={activar ? 'Acción · Activar' : 'Acción · Desactivar'}
      title={`${activar ? 'Activar' : 'Desactivar'} ${recurso}`}
      actionLabel={activar ? 'Activar' : 'Desactivar'}
      actionIcon="power"
      danger={!activar}
      enviando={cargando}
      onSubmit={onConfirmar}
      onClose={onClose}
    >
      <p className="modal-paragraph">
        ¿Desea {activar ? 'activar' : 'desactivar'} <strong>{nombre}</strong>?
      </p>
      <InfoNote>{nota}</InfoNote>
      <AvisoError error={error} />
    </FormModal>
  )
}
