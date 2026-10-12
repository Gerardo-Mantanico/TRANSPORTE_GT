import { useNavigate } from 'react-router-dom'
import { NAV_BY_ROLE, ROLE_OPTIONS } from '../../app/navigation'
import { useAuth } from '../../app/providers/useAuth'
import { useTheme } from '../../app/providers/useTheme'
import type { IconName, Role } from '../../types'
import { Icon } from '../ui/Icon'

interface TopbarProps {
  onMenuOpen: () => void
  pageTitle: string
  pageIcon: IconName
}

export function Topbar({ onMenuOpen, pageTitle, pageIcon }: TopbarProps) {
  const { role, switchRole } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  if (!role) return null

  const handleRoleChange = (nextRole: string) => {
    switchRole(nextRole as Role)
    const firstItem = NAV_BY_ROLE[nextRole as Role][0]?.items[0]
    navigate(firstItem ? `/${firstItem.id}` : '/')
  }

  return (
    <div className="topbar">
      <button className="mobile-menu" onClick={onMenuOpen} aria-label="Abrir menú">
        <Icon name="menu" />
      </button>
      <div className="breadcrumb">
        <span>TRANSPORTE_GT</span>
        <Icon name="chevron" size={14} />
        <i className="breadcrumb-icon">
          <Icon name={pageIcon} size={15} />
        </i>
        <strong>{pageTitle}</strong>
      </div>
      <div className="topbar-actions">
        <label className="role-switch">
          <span>Vista</span>
          <select value={role} onChange={(event) => handleRoleChange(event.target.value)}>
            {ROLE_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <button
          className="icon-button theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </div>
    </div>
  )
}
