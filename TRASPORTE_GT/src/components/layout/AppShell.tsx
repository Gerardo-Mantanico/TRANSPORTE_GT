import { useMemo, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { NAV_BY_ROLE } from '../../app/navigation'
import { useAuth } from '../../app/providers/useAuth'
import type { IconName, Role } from '../../types'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface PageMeta {
  title: string
  icon: IconName
}

function resolvePageMeta(pathname: string, role: Role | null): PageMeta {
  if (pathname === '/perfil') return { title: 'Mi perfil', icon: 'user' }
  if (!role) return { title: 'Panel', icon: 'home' }
  const item = NAV_BY_ROLE[role]
    .flatMap((group) => group.items)
    .find((entry) => `/${entry.id}` === pathname)
  return { title: item?.label ?? 'Panel', icon: item?.icon ?? 'home' }
}

export function AppShell() {
  const { role } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const meta = useMemo(() => resolvePageMeta(location.pathname, role), [location.pathname, role])

  if (!role) return <Navigate to="/login" replace />

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="app-main">
        <Topbar onMenuOpen={() => setMenuOpen(true)} pageTitle={meta.title} pageIcon={meta.icon} />
        <div className="page-content">
          <div className="page-stage" key={`${role}-${location.pathname}`}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
