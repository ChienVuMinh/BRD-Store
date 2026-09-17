import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, Form, Input, Typography, App as AntApp } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { registerConsumer } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../api/client';
import type { ConsumerRegisterRequest } from '../../types/models';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { message } = AntApp.useApp();

  async function onFinish(values: ConsumerRegisterRequest) {
    setLoading(true);
    try {
      const res = await registerConsumer(values);
      setAuth(res.token, res.username, res.id);
      message.success('Đăng ký thành công!');
      navigate('/', { replace: true });
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
      <Card style={{ width: 400 }} styles={{ body: { padding: 32 } }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 0 }}>Tạo tài khoản</Title>
          <Text type="secondary">Đăng ký để tải và đánh giá ứng dụng</Text>
        </div>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="accountId" label="Tài khoản" rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản' }]}>
            <Input prefix={<UserOutlined />} placeholder="Account ID" size="large" />
          </Form.Item>
          <Form.Item name="fullName" label="Họ tên">
            <Input size="large" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
            <Input prefix={<MailOutlined />} size="large" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input prefix={<PhoneOutlined />} size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </Text>
      </Card>
    </div>
  );
}
