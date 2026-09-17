import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Typography, Button, Space, Skeleton, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getApp } from '../../api/apps';
import StatusTag from '../../components/StatusTag';
import AppOverviewTab from './detail/AppOverviewTab';
import AppClassificationTab from './detail/AppClassificationTab';
import AppVersionsTab from './detail/AppVersionsTab';
import AppReviewsTab from './detail/AppReviewsTab';

const { Title, Text } = Typography;

export default function AppDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const appQuery = useQuery({
    queryKey: ['app', id],
    queryFn: () => getApp(id!),
    enabled: !!id,
  });

  if (appQuery.isLoading) return <Skeleton active />;
  if (!appQuery.data) return <Text type="danger">Không tìm thấy ứng dụng</Text>;

  const app = appQuery.data;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/apps')}>Quay lại</Button>
      </Space>
      <Title level={3} style={{ marginBottom: 0 }}>
        {app.name} <StatusTag status={app.status} />
      </Title>
      <Text type="secondary">{app.packageName} · {app.osPlatform}</Text>

      <Tabs
        style={{ marginTop: 16 }}
        items={[
          { key: 'overview', label: 'Thông tin chung', children: <AppOverviewTab app={app} /> },
          { key: 'classification', label: 'Phân loại & Quyền', children: <AppClassificationTab app={app} /> },
          { key: 'versions', label: 'Phiên bản', children: <AppVersionsTab app={app} /> },
          { key: 'reviews', label: 'Đánh giá', children: <AppReviewsTab app={app} /> },
        ]}
      />
    </div>
  );
}
