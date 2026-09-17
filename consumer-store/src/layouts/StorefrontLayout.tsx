import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Layout, Button, Space, Avatar, Dropdown, Typography } from 'antd';
import { AppstoreOutlined, UserOutlined, LogoutOutlined, DownloadOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export default function StorefrontLayout() {
  const navigate = useNavigate();
  const { token, accountId, clearAuth } = useAuthStore();

  function handleLogout() {
    clearAuth();
    navigate('/', { replace: true });
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f7' }}>
      <Header
        style={{
          background: '#fff',
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#722ed1', fontWeight: 700, fontSize: 18 }}>
          <AppstoreOutlined style={{ fontSize: 22 }} />
          BRD Store
        </Link>

        {token ? (
          <Dropdown
            menu={{
              items: [
                { key: 'my-apps', icon: <DownloadOutlined />, label: 'Ứng dụng đã cài', onClick: () => navigate('/my-apps') },
                { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout },
              ],
            }}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} size="small" />
              <Text>{accountId}</Text>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Button onClick={() => navigate('/login')}>Đăng nhập</Button>
            <Button type="primary" onClick={() => navigate('/register')}>Đăng ký</Button>
          </Space>
        )}
      </Header>
      <Content style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '24px 16px' }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center', color: '#999' }}>BRD Store © {new Date().getFullYear()}</Footer>
    </Layout>
  );
}
