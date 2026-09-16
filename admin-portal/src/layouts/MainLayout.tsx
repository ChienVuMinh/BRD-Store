import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Tag } from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  AppstoreOutlined,
  CloudUploadOutlined,
  FileSearchOutlined,
  TeamOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface NavItem {
  key: string;
  path: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', path: '/', icon: <DashboardOutlined />, label: 'Tổng quan' },
  {
    key: 'partners',
    path: '/partners',
    icon: <ShopOutlined />,
    label: 'Đối tác',
    roles: ['S_ADMIN', 'O_ADMIN', 'O_PARTNER_MANAGER', 'O_SUPPORT', 'O_REPORT'],
  },
  {
    key: 'apps',
    path: '/apps',
    icon: <AppstoreOutlined />,
    label: 'Ứng dụng',
    roles: ['S_ADMIN', 'O_ADMIN', 'O_REVIEWER', 'O_SUPPORT', 'O_REPORT', 'O_PARTNER_MANAGER'],
  },
  {
    key: 'versions',
    path: '/versions',
    icon: <CloudUploadOutlined />,
    label: 'Phiên bản chờ duyệt',
    roles: ['S_ADMIN', 'O_ADMIN', 'O_REVIEWER', 'O_SUPPORT', 'O_REPORT'],
  },
  {
    key: 'audit-logs',
    path: '/audit-logs',
    icon: <FileSearchOutlined />,
    label: 'Audit Log',
    roles: ['S_ADMIN', 'O_SUPPORT'],
  },
  {
    key: 'system-users',
    path: '/system-users',
    icon: <TeamOutlined />,
    label: 'Người dùng hệ thống',
    roles: ['S_ADMIN'],
  },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { username, roles, hasAnyRole, clearAuth } = useAuthStore();

  const visibleItems = useMemo(
    () => NAV_ITEMS.filter((item) => !item.roles || hasAnyRole(item.roles)),
    [hasAnyRole],
  );

  const selectedKey = useMemo(() => {
    const match = visibleItems
      .slice()
      .sort((a, b) => b.path.length - a.path.length)
      .find((item) => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));
    return match?.key ?? 'dashboard';
  }, [location.pathname, visibleItems]);

  function handleLogout() {
    clearAuth();
    navigate('/login', { replace: true });
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            height: 48,
            margin: 12,
            color: '#fff',
            fontWeight: 700,
            fontSize: collapsed ? 16 : 18,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {collapsed ? 'BRD' : 'BRD Store Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={visibleItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => navigate(item.path),
          }))}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Dropdown
            menu={{
              items: [
                { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout },
              ],
            }}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <div>
                <div><Text strong>{username}</Text></div>
                <Space size={4}>
                  {roles.map((r) => (
                    <Tag key={r} color="blue" style={{ marginInlineEnd: 0, fontSize: 11 }}>{r}</Tag>
                  ))}
                </Space>
              </div>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
