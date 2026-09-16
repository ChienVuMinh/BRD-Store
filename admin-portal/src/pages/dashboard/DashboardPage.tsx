import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row, Statistic, Typography, List, Tag, Skeleton } from 'antd';
import {
  ShopOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { listPartners } from '../../api/partners';
import { listAllApps } from '../../api/apps';
import { listAllVersions } from '../../api/versions';
import { useAuthStore } from '../../store/authStore';

const { Title } = Typography;

export default function DashboardPage() {
  const navigate = useNavigate();
  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);

  const canSeePartners = hasAnyRole(['S_ADMIN', 'O_ADMIN', 'O_PARTNER_MANAGER', 'O_SUPPORT', 'O_REPORT']);
  const canSeeApps = hasAnyRole(['S_ADMIN', 'O_ADMIN', 'O_REVIEWER', 'O_SUPPORT', 'O_REPORT', 'O_PARTNER_MANAGER']);
  const canSeeVersions = hasAnyRole(['S_ADMIN', 'O_ADMIN', 'O_REVIEWER', 'O_SUPPORT', 'O_REPORT']);

  const partnersQuery = useQuery({
    queryKey: ['partners', 'all'],
    queryFn: () => listPartners(),
    enabled: canSeePartners,
  });
  const appsQuery = useQuery({
    queryKey: ['apps', 'all'],
    queryFn: () => listAllApps(),
    enabled: canSeeApps,
  });
  const versionsQuery = useQuery({
    queryKey: ['versions', 'all'],
    queryFn: () => listAllVersions(),
    enabled: canSeeVersions,
  });

  const pendingPartners = partnersQuery.data?.filter((p) => p.status === 'PENDING') ?? [];
  const pendingApps = appsQuery.data?.filter((a) => a.status === 'PENDING_APPROVAL') ?? [];
  const pendingVersions = versionsQuery.data?.filter((v) => v.status === 'IN_REVIEW') ?? [];

  return (
    <div>
      <Title level={3}>Tổng quan hệ thống</Title>
      <Row gutter={16}>
        {canSeePartners && (
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable onClick={() => navigate('/partners')}>
              <Statistic
                title="Đối tác chờ duyệt"
                value={pendingPartners.length}
                loading={partnersQuery.isLoading}
                prefix={<ShopOutlined />}
                valueStyle={{ color: pendingPartners.length > 0 ? '#faad14' : undefined }}
              />
            </Card>
          </Col>
        )}
        {canSeeApps && (
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable onClick={() => navigate('/apps')}>
              <Statistic
                title="Ứng dụng chờ duyệt"
                value={pendingApps.length}
                loading={appsQuery.isLoading}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: pendingApps.length > 0 ? '#faad14' : undefined }}
              />
            </Card>
          </Col>
        )}
        {canSeeVersions && (
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable onClick={() => navigate('/versions')}>
              <Statistic
                title="Phiên bản chờ duyệt"
                value={pendingVersions.length}
                loading={versionsQuery.isLoading}
                prefix={<CloudUploadOutlined />}
                valueStyle={{ color: pendingVersions.length > 0 ? '#faad14' : undefined }}
              />
            </Card>
          </Col>
        )}
        {canSeePartners && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng số đối tác"
                value={partnersQuery.data?.length ?? 0}
                loading={partnersQuery.isLoading}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        )}
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        {canSeePartners && (
          <Col xs={24} lg={8}>
            <Card title="Đối tác mới đăng ký" size="small">
              {partnersQuery.isLoading ? (
                <Skeleton active />
              ) : (
                <List
                  size="small"
                  dataSource={pendingPartners.slice(0, 5)}
                  locale={{ emptyText: 'Không có đối tác chờ duyệt' }}
                  renderItem={(p) => (
                    <List.Item
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/partners/${p.id}`)}
                    >
                      <span>{p.name}</span>
                      <Tag color="gold">{p.status}</Tag>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        )}
        {canSeeApps && (
          <Col xs={24} lg={8}>
            <Card title="Ứng dụng chờ duyệt" size="small">
              {appsQuery.isLoading ? (
                <Skeleton active />
              ) : (
                <List
                  size="small"
                  dataSource={pendingApps.slice(0, 5)}
                  locale={{ emptyText: 'Không có ứng dụng chờ duyệt' }}
                  renderItem={(a) => (
                    <List.Item
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/apps/${a.id}`)}
                    >
                      <span>{a.name}</span>
                      <Tag color="gold">{a.status}</Tag>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        )}
        {canSeeVersions && (
          <Col xs={24} lg={8}>
            <Card title="Phiên bản chờ duyệt" size="small">
              {versionsQuery.isLoading ? (
                <Skeleton active />
              ) : (
                <List
                  size="small"
                  dataSource={pendingVersions.slice(0, 5)}
                  locale={{ emptyText: 'Không có phiên bản chờ duyệt' }}
                  renderItem={(v) => (
                    <List.Item
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/versions/${v.id}`)}
                    >
                      <span>{v.versionName} (build #{v.buildNumber})</span>
                      <Tag color="processing">{v.status}</Tag>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
