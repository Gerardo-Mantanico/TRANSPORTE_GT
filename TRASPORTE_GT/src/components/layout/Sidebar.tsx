import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { NAV_BY_ROLE } from '../../app/navigation'
import { initialsOf } from '../../app/providers/roles'
import { useAuth } from '../../app/providers/useAuth'
import { Icon } from '../ui/Icon'
import { Logo } from '../ui/Logo'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { role, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [accountOpen, setAccountOpen] = useState(false)

  if (!role) return null

  const groups = NAV_BY_ROLE[role] ?? []
  const currentPath = location.pathname
  const userName = user?.nombreCompleto ?? 'Usuario'
  const userInitials = initialsOf(userName)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {open && <button className="scrim" onClick={onClose} aria-label="Cerrar menú" />}
      <aside className={`sidebar ${open ? 'open' : ''}`.trim()}>
        <Logo />
        <nav>
          {groups.map((group) => (
            <div key={group.label} className="nav-group">
              <small>{group.label}</small>
              {group.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={`/${item.id}`}
                  className={currentPath === `/${item.id}` ? 'active' : ''}
                  onClick={onClose}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {currentPath === `/${item.id}` && <i />}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="account-area">
          {accountOpen && (
            <div className="account-menu">
              <button
                onClick={() => {
                  setAccountOpen(false)
                  onClose()
                  navigate('/perfil')
                }}
              >
                <span>
                  <Icon name="user" />
                </span>
                <div>
                  <strong>Ver perfil</strong>
                  <small>Información personal y cuenta</small>
                </div>
                <Icon name="chevron" size={14} />
              </button>
              <button className="logout-action" onClick={handleLogout}>
                <span>
                  <Icon name="arrow" />
                </span>
                <div>
                  <strong>Cerrar sesión</strong>
                  <small>Salir de forma segura</small>
                </div>
              </button>
            </div>
          )}
          <button
            className={`user-card ${accountOpen ? 'active' : ''}`.trim()}
            onClick={() => setAccountOpen((value) => !value)}
          >
            <span className="avatar">{userInitials}</span>
            <span>
              <strong>{userName}</strong>
              <small>{role}</small>
            </span>
            <Icon name="more" />
          </button>
        </div>
      </aside>
    </>
  )
}
