import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Input, Row, Col, Card, Typography, Tag, Empty, Skeleton } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { listPublishedApps } from '../../api/apps';
import { resolveAssetUrl } from '../../api/client';

const { Title, Text } = Typography;

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['published-apps'],
    queryFn: listPublishedApps,
  });

  const apps = (data ?? []).filter(
    (a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.shortDesc?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2}>Khám phá ứng dụng</Title>
        <Text type="secondary">Duyệt và tải các ứng dụng đã được kiểm duyệt</Text>
        <div style={{ marginTop: 16, maxWidth: 480, marginInline: 'auto' }}>
          <Input.Search
            size="large"
            placeholder="Tìm kiếm ứng dụng..."
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Col key={i} xs={12} sm={8} md={6}>
              <Card><Skeleton active avatar paragraph={{ rows: 1 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : apps.length === 0 ? (
        <Empty description="Không tìm thấy ứng dụng nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {apps.map((app) => (
            <Col key={app.id} xs={12} sm={8} md={6}>
              <Card
                hoverable
                onClick={() => navigate(`/apps/${app.id}`)}
                styles={{ body: { padding: 16 } }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8 }}>
                  {app.logoUrl ? (
                    <img
                      src={resolveAssetUrl(app.logoUrl)}
                      alt={app.name}
                      style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: 64, height: 64, borderRadius: 14, background: '#f0f0f0' }} />
                  )}
                  <Text strong ellipsis style={{ width: '100%' }}>{app.name}</Text>
                  <Tag color={app.priceType === 'PAID' ? 'gold' : 'green'}>
                    {app.priceType === 'PAID' ? `${app.priceVnd?.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                  </Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
