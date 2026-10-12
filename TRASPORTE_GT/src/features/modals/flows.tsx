import { Icon } from '../../components/ui/Icon'
import { Button } from '../../components/ui/Button'
import { FLOW_DEFINITIONS, FLOW_LINKS_BY_PAGE } from './flowsData'


export function FlowBar({
  page,
  onOpen,
}: {
  page: string
  onOpen: (flowId: string) => void
}) {
  const links = FLOW_LINKS_BY_PAGE[page] ?? []
  if (!links.length) return null

  return (
    <section className="flow-bar">
      <div>
        <span className="eyebrow">Flujos relacionados</span>
        <p>Acceda a las vistas secundarias y guards definidos para este módulo.</p>
      </div>
      <div>
        {links.map((link) => (
          <button
            key={link.id}
            className={link.tone === 'danger' ? 'danger' : ''}
            onClick={() => onOpen(link.id)}
          >
            <strong>{link.id}</strong>
            <span>{link.label}</span>
            <Icon name="chevron" size={15} />
          </button>
        ))}
      </div>
    </section>
  )
}

export function FlowModal({ flowId, onClose }: { flowId: string; onClose: () => void }) {
  const definition = FLOW_DEFINITIONS[flowId]
  if (!definition) return null

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section
        className={`modal flow-modal ${definition.danger ? 'danger-modal' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
      >
        <header>
          <div>
            <span className="eyebrow">{definition.eyebrow}</span>
            <h2>{definition.title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">{definition.body}</div>
        <footer>
          {definition.secondary && (
            <Button variant="ghost" onClick={onClose}>
              {definition.secondary}
            </Button>
          )}
          <Button variant={definition.dangerAction ? 'danger' : 'primary'} onClick={onClose}>
            {definition.action}
          </Button>
        </footer>
      </section>
    </div>
  )
}
