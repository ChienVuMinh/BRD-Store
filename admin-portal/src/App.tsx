import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/login/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PartnerListPage from './pages/partners/PartnerListPage';
import PartnerDetailPage from './pages/partners/PartnerDetailPage';
import AppListPage from './pages/apps/AppListPage';
import AppDetailPage from './pages/apps/AppDetailPage';
import VersionListPage from './pages/versions/VersionListPage';
import VersionDetailPage from './pages/versions/VersionDetailPage';
import AuditLogPage from './pages/audit-logs/AuditLogPage';
import SystemUserListPage from './pages/system-users/SystemUserListPage';

const ADMIN_PORTAL_ROLES = ['S_ADMIN', 'O_ADMIN', 'O_PARTNER_MANAGER', 'O_REVIEWER', 'O_REPORT', 'O_FINANCE', 'O_SUPPORT'];
const PARTNER_ROLES = ['S_ADMIN', 'O_ADMIN', 'O_PARTNER_MANAGER', 'O_SUPPORT', 'O_REPORT'];
const APP_ROLES = ['S_ADMIN', 'O_ADMIN', 'O_REVIEWER', 'O_SUPPORT', 'O_REPORT', 'O_PARTNER_MANAGER'];
const VERSION_ROLES = ['S_ADMIN', 'O_ADMIN', 'O_REVIEWER', 'O_SUPPORT', 'O_REPORT'];
const AUDIT_ROLES = ['S_ADMIN', 'O_SUPPORT'];
const SYSTEM_USER_ROLES = ['S_ADMIN'];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute roles={ADMIN_PORTAL_ROLES}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route
            path="/partners"
            element={
              <ProtectedRoute roles={PARTNER_ROLES}>
                <PartnerListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partners/:id"
            element={
              <ProtectedRoute roles={PARTNER_ROLES}>
                <PartnerDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apps"
            element={
              <ProtectedRoute roles={APP_ROLES}>
                <AppListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apps/:id"
            element={
              <ProtectedRoute roles={APP_ROLES}>
                <AppDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/versions"
            element={
              <ProtectedRoute roles={VERSION_ROLES}>
                <VersionListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/versions/:id"
            element={
              <ProtectedRoute roles={VERSION_ROLES}>
                <VersionDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute roles={AUDIT_ROLES}>
                <AuditLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-users"
            element={
              <ProtectedRoute roles={SYSTEM_USER_ROLES}>
                <SystemUserListPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
