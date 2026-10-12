import { isValidElement, type ReactNode } from 'react'

export function cellText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(cellText).join(' ')
  if (isValidElement<{ children?: ReactNode }>(node)) return cellText(node.props.children)
  return ''
}
