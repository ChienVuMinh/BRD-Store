import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Typography, App as AntApp } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../api/client';

const { Title, Text } = Typography;

const ADMIN_PORTAL_ROLES = new Set([
  'S_ADMIN',
  'O_ADMIN',
  'O_PARTNER_MANAGER',
  'O_REVIEWER',
  'O_REPORT',
  'O_FINANCE',
  'O_SUPPORT',
]);

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { message } = AntApp.useApp();

  async function onFinish(values: { username: string; password: string }) {
    setLoading(true);
    try {
      const res = await login(values);
      const isAdminPortalUser = res.roles.some((r) => ADMIN_PORTAL_ROLES.has(r));
      if (!isAdminPortalUser) {
        message.error('Tài khoản này không có quyền truy cập trang quản trị.');
        return;
      }
      setAuth(res.token, res.username, res.roles);
      navigate('/', { replace: true });
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 100%)',
      }}
    >
      <Card style={{ width: 380 }} styles={{ body: { padding: 32 } }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 0 }}>BRD Store</Title>
          <Text type="secondary">Cổng quản trị (Admin Portal)</Text>
        </div>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}>
            <Input prefix={<UserOutlined />} placeholder="sadmin" size="large" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
