import type { ReactNode } from 'react'

export type Theme = 'light' | 'dark'

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'info' | 'danger'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export type IconName =
  | 'home'
  | 'bus'
  | 'calendar'
  | 'chart'
  | 'check'
  | 'chevron'
  | 'clock'
  | 'close'
  | 'download'
  | 'fuel'
  | 'grid'
  | 'menu'
  | 'moon'
  | 'more'
  | 'plus'
  | 'route'
  | 'search'
  | 'settings'
  | 'sun'
  | 'ticket'
  | 'user'
  | 'users'
  | 'wallet'
  | 'wrench'
  | 'arrow'

export interface NavItem {
  id: string
  label: string
  icon: IconName
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export type TableCell = ReactNode

export type TableRow = TableCell[]

export interface FlowLink {
  id: string
  label: string
  tone?: 'danger'
}

export const TODAY = new Date().toISOString().slice(0, 10)
