import { Navigate, Route, Routes } from 'react-router-dom'
import { defaultPageFor } from './navigationPaths'
import { useAuth } from './providers/useAuth'
import { AppShell } from '../components/layout/AppShell'
import { LoginPage } from '../features/auth/LoginPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { ResourceListPage } from '../features/lists/ResourceListPage'
import { TicketSalesPage } from '../features/sales/TicketSalesPage'
import { ReportsPage } from '../features/reports/ReportsPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { ProfilePage } from '../features/profile/ProfilePage'
import { ExploreTripsPage } from '../features/client/ExploreTripsPage'
import { RentalRequestPage } from '../features/client/RentalRequestPage'
import { HistoryPage } from '../features/client/HistoryPage'
import { WalletPage } from '../features/client/WalletPage'

const LIST_PAGES = ['viajes', 'buses', 'choferes', 'rutas', 'alquileres', 'taller', 'categorias', 'sucursales', 'usuarios']

function HomeRedirect() {
  const { role } = useAuth()
  if (!role) return <Navigate to="/login" replace />
  return <Navigate to={defaultPageFor(role)} replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route index element={<HomeRedirect />} />
        <Route path="resumen" element={<DashboardPage />} />
        <Route path="venta" element={<TicketSalesPage />} />
        <Route path="reportes" element={<ReportsPage />} />
        <Route path="reportes-sistema" element={<ReportsPage system />} />
        <Route path="reportes-sucursal" element={<ReportsPage />} />
        <Route path="configuracion" element={<SettingsPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="explorar" element={<ExploreTripsPage />} />
        <Route path="solicitar" element={<RentalRequestPage />} />
        <Route path="historial" element={<HistoryPage />} />
        <Route path="cartera" element={<WalletPage />} />
        {LIST_PAGES.map((page) => (
          <Route key={page} path={page} element={<ResourceListPage type={page} />} />
        ))}
        <Route path="*" element={<HomeRedirect />} />
      </Route>
    </Routes>
  )
}
