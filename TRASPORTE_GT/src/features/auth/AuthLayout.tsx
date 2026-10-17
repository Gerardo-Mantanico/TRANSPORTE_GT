import type { ReactNode } from 'react'
import { useTheme } from '../../app/providers/useTheme'
import { Icon } from '../../components/ui/Icon'
import { Logo } from '../../components/ui/Logo'

interface AuthLayoutProps {
  eyebrow: string
  title: string
  description: string
  wide?: boolean
  children: ReactNode
}

export function AuthLayout({ eyebrow, title, description, wide = false, children }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <main className="auth-page">
      <button
        className="theme-toggle auth-theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
      </button>
      <div className="auth-brand">
        <Logo />
        <div>
          <span className="eyebrow light">Plataforma de transporte</span>
          <h1>
            Un viaje más simple,
            <br />
            una operación más inteligente.
          </h1>
          <p>Conectamos pasajeros, equipos y decisiones en una sola plataforma.</p>
        </div>
        <div className="auth-route">
          <span>GUA</span>
          <div>
            <i />
            <i />
            <i />
          </div>
          <span>ANT</span>
        </div>
      </div>
      <section className="auth-panel">
        <div className={`auth-card ${wide ? 'wide' : ''}`.trim()}>
          <div className="mobile-logo">
            <Logo />
          </div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p className="muted">{description}</p>
          {children}
        </div>
      </section>
    </main>
  )
}
