import { Navigate, Route, Routes } from 'react-router-dom'
import { defaultPageFor } from './navigationPaths'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuth } from './providers/useAuth'
import { AppShell } from '../components/layout/AppShell'
import { Cargando } from '../components/ui/Estado'
import { LoginPage } from '../features/auth/LoginPage'
import { OlvideContrasenaPage } from '../features/auth/OlvideContrasenaPage'
import { RestablecerContrasenaPage } from '../features/auth/RestablecerContrasenaPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { ResourceListPage } from '../features/lists/ResourceListPage'
import { SucursalesPage } from '../features/identity/SucursalesPage'
import { UsuariosPage } from '../features/identity/UsuariosPage'
import { TicketSalesPage } from '../features/sales/TicketSalesPage'
import { ComprasSucursalPage } from '../features/tickets/ComprasSucursalPage'
import { ReportsPage } from '../features/reports/ReportsPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { ProfilePage } from '../features/profile/ProfilePage'
import { ExploreTripsPage } from '../features/client/ExploreTripsPage'
import { RentalRequestPage } from '../features/client/RentalRequestPage'
import { HistoryPage } from '../features/client/HistoryPage'
import { WalletPage } from '../features/client/WalletPage'
import type { Rol } from '../types/identityTypes'

const SISTEMA: Rol[] = ['ADMIN_SISTEMA']
const SUCURSAL: Rol[] = ['ADMIN_SUCURSAL']
const ADMINISTRADORES: Rol[] = ['ADMIN_SISTEMA', 'ADMIN_SUCURSAL']

const LIST_PAGES: { page: string; roles: Rol[] }[] = [
  { page: 'viajes', roles: ['ADMIN_SUCURSAL', 'CAJERO', 'CHOFER'] },
  { page: 'buses', roles: SUCURSAL },
  { page: 'choferes', roles: SUCURSAL },
  { page: 'rutas', roles: SUCURSAL },
  { page: 'alquileres', roles: SUCURSAL },
  { page: 'taller', roles: SUCURSAL },
  { page: 'categorias', roles: SUCURSAL },
]

function HomeRedirect() {
  const { estado, usuario } = useAuth()
  if (estado === 'cargando') return <Cargando pantalla />
  if (!usuario) return <Navigate to="/login" replace />
  return <Navigate to={defaultPageFor(usuario.rol)} replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/olvide-contrasena" element={<OlvideContrasenaPage />} />
      <Route path="/restablecer-contrasena" element={<RestablecerContrasenaPage />} />
      <Route path="/activar-cuenta" element={<RestablecerContrasenaPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeRedirect />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route element={<ProtectedRoute roles={ADMINISTRADORES} />}>
          <Route path="resumen" element={<DashboardPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['ADMIN_SUCURSAL', 'CAJERO']} />}>
          <Route path="venta" element={<TicketSalesPage />} />
          <Route path="boletos-vendidos" element={<ComprasSucursalPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={SUCURSAL} />}>
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="reportes-sucursal" element={<ReportsPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={SISTEMA} />}>
          <Route path="reportes-sistema" element={<ReportsPage system />} />
          <Route path="configuracion" element={<SettingsPage />} />
          <Route path="sucursales" element={<SucursalesPage />} />
        </Route>
        {/* Todo usuario es cliente: cualquier rol compra, alquila y usa su cartera. */}
        <Route path="explorar" element={<ExploreTripsPage />} />
        <Route path="solicitar" element={<RentalRequestPage />} />
        <Route path="historial" element={<HistoryPage />} />
        <Route path="cartera" element={<WalletPage />} />
        {LIST_PAGES.map(({ page, roles }) => (
          <Route key={page} element={<ProtectedRoute roles={roles} />}>
            <Route path={page} element={<ResourceListPage type={page} />} />
          </Route>
        ))}
        <Route path="*" element={<HomeRedirect />} />
      </Route>
    </Routes>
  )
}
