import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { ButtonVariant, IconName } from '../../types'
import { Icon } from './Icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: IconName
  children: ReactNode
}

export function Button({ variant = 'primary', icon, children, className = '', ...rest }: ButtonProps) {
  return (
    <button type="button" className={`button ${variant} ${className}`.trim()} {...rest}>
      <span>{children}</span>
      {icon && <Icon name={icon} size={17} />}
    </button>
  )
}
