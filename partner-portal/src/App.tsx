import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/login/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AppListPage from './pages/apps/AppListPage';
import NewAppPage from './pages/apps/NewAppPage';
import AppDetailPage from './pages/apps/AppDetailPage';
import TeamPage from './pages/team/TeamPage';
import ApiKeysPage from './pages/api-keys/ApiKeysPage';

const PARTNER_ROLES = ['P_ADMIN', 'P_DEVELOPER', 'P_QC', 'P_FINANCE'];
const ADMIN_ONLY = ['P_ADMIN'];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute roles={PARTNER_ROLES}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="/apps" element={<AppListPage />} />
          <Route path="/apps/new" element={<NewAppPage />} />
          <Route path="/apps/:id" element={<AppDetailPage />} />
          <Route
            path="/team"
            element={
              <ProtectedRoute roles={ADMIN_ONLY}>
                <TeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/api-keys"
            element={
              <ProtectedRoute roles={ADMIN_ONLY}>
                <ApiKeysPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
