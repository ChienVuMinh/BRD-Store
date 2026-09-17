import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { listPartnerApps } from '../../api/apps';
import StatusTag from '../../components/StatusTag';
import { useAuthStore } from '../../store/authStore';

const { Title } = Typography;

export default function AppListPage() {
  const navigate = useNavigate();
  const partnerId = useAuthStore((s) => s.partnerId);

  const { data, isLoading } = useQuery({
    queryKey: ['partner-apps', partnerId],
    queryFn: () => listPartnerApps(partnerId!),
    enabled: !!partnerId,
  });

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Ứng dụng của tôi</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/apps/new')}>
          Tạo ứng dụng mới
        </Button>
      </Space>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data ?? []}
        onRow={(record) => ({ onClick: () => navigate(`/apps/${record.id}`), style: { cursor: 'pointer' } })}
        columns={[
          { title: 'Tên ứng dụng', dataIndex: 'name' },
          { title: 'Package name', dataIndex: 'packageName' },
          { title: 'Nền tảng', dataIndex: 'osPlatform' },
          {
            title: 'Loại',
            dataIndex: 'priceType',
            render: (v: string | null, r) => (v === 'PAID' ? `${r.priceVnd?.toLocaleString('vi-VN')} đ` : 'Miễn phí'),
          },
          { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag status={s} /> },
          { title: 'Ngày tạo', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('vi-VN') },
        ]}
      />
    </div>
  );
}
