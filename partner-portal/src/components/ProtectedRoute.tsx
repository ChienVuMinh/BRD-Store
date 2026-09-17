import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Result } from 'antd';
import { useAuthStore } from '../store/authStore';

interface Props {
  children: ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const token = useAuthStore((s) => s.token);
  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return <Result status="403" title="403" subTitle="Bạn không có quyền truy cập trang này." />;
  }

  return <>{children}</>;
}
