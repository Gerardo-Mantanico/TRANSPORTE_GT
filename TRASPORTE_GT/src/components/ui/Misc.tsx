import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
  return <span className={`avatar ${small ? 'small' : ''}`.trim()}>{initials}</span>
}

export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="info-note">
      <Icon name="check" />
      <p>{children}</p>
    </div>
  )
}

export function ImmutableCheck({ label }: { label: string }) {
  return (
    <label className="immutable-check">
      <input type="checkbox" />
      <span>
        <strong>Confirmo que los datos son correctos.</strong>
        <small>{label}</small>
      </span>
    </label>
  )
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}
