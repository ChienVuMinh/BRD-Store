import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StorefrontLayout from './layouts/StorefrontLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/register/RegisterPage';
import AppDetailPage from './pages/app-detail/AppDetailPage';
import MyAppsPage from './pages/my-apps/MyAppsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<StorefrontLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/apps/:id" element={<AppDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/my-apps"
            element={
              <ProtectedRoute>
                <MyAppsPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
