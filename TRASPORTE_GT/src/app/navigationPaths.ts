import type { Role } from '../types'

export function defaultPageFor(role: Role): string {
  return role === 'Cliente' ? '/explorar' : '/resumen'
}
