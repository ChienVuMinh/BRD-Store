import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, Col, Row, Statistic, Typography, List, Tag, Skeleton, Button, Empty } from 'antd';
import { AppstoreOutlined, ClockCircleOutlined, CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { listPartnerApps } from '../../api/apps';
import { useAuthStore } from '../../store/authStore';

const { Title } = Typography;

export default function DashboardPage() {
  const navigate = useNavigate();
  const partnerId = useAuthStore((s) => s.partnerId);

  const appsQuery = useQuery({
    queryKey: ['partner-apps', partnerId],
    queryFn: () => listPartnerApps(partnerId!),
    enabled: !!partnerId,
  });

  const apps = appsQuery.data ?? [];
  const draftCount = apps.filter((a) => a.status === 'DRAFT').length;
  const pendingCount = apps.filter((a) => a.status === 'PENDING_APPROVAL').length;
  const approvedCount = apps.filter((a) => a.status === 'APPROVED').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Tổng quan</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/apps/new')}>
          Tạo ứng dụng mới
        </Button>
      </div>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Tổng số ứng dụng" value={apps.length} loading={appsQuery.isLoading} prefix={<AppstoreOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đang chờ duyệt"
              value={pendingCount}
              loading={appsQuery.isLoading}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: pendingCount > 0 ? '#faad14' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đã được duyệt"
              value={approvedCount}
              loading={appsQuery.isLoading}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Ứng dụng gần đây" style={{ marginTop: 24 }}>
        {appsQuery.isLoading ? (
          <Skeleton active />
        ) : apps.length === 0 ? (
          <Empty description="Chưa có ứng dụng nào. Bấm 'Tạo ứng dụng mới' để bắt đầu.">
            {draftCount === 0 && (
              <Button type="primary" onClick={() => navigate('/apps/new')}>Tạo ứng dụng mới</Button>
            )}
          </Empty>
        ) : (
          <List
            dataSource={apps.slice(0, 8)}
            renderItem={(app) => (
              <List.Item style={{ cursor: 'pointer' }} onClick={() => navigate(`/apps/${app.id}`)}>
                <List.Item.Meta title={app.name} description={`${app.packageName} · ${app.osPlatform}`} />
                <Tag>{app.status}</Tag>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
