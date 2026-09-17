import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, Form, Input, Typography, App as AntApp } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { loginConsumer } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../api/client';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { message } = AntApp.useApp();

  async function onFinish(values: { username: string; password: string }) {
    setLoading(true);
    try {
      const res = await loginConsumer(values);
      setAuth(res.token, res.username, res.id);
      navigate('/', { replace: true });
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
      <Card style={{ width: 380 }} styles={{ body: { padding: 32 } }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 0 }}>Đăng nhập</Title>
          <Text type="secondary">Vào tài khoản BRD Store của bạn</Text>
        </div>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="username" label="Tài khoản" rules={[{ required: true, message: 'Vui lòng nhập tài khoản' }]}>
            <Input prefix={<UserOutlined />} placeholder="Account ID" size="large" />
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
        <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </Text>
      </Card>
    </div>
  );
}
