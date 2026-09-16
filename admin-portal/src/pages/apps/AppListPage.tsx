import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Select, Space, Input } from 'antd';
import { listAllApps } from '../../api/apps';
import StatusTag from '../../components/StatusTag';
import type { AppStatus } from '../../types/enums';

const { Title } = Typography;

const STATUS_OPTIONS: { label: string; value: AppStatus }[] = [
  { label: 'Nháp', value: 'DRAFT' },
  { label: 'Chờ duyệt', value: 'PENDING_APPROVAL' },
  { label: 'Đã duyệt', value: 'APPROVED' },
  { label: 'Từ chối', value: 'REJECTED' },
  { label: 'Tạm khóa', value: 'SUSPENDED' },
];

export default function AppListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<AppStatus | undefined>(undefined);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['apps', status ?? 'ALL'],
    queryFn: () => listAllApps(status),
  });

  const filtered = (data ?? []).filter(
    (a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.packageName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <Title level={3}>Quản lý ứng dụng</Title>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          allowClear
          placeholder="Lọc theo trạng thái"
          style={{ width: 200 }}
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
        />
        <Input.Search
          placeholder="Tìm theo tên hoặc package name"
          style={{ width: 300 }}
          allowClear
          onChange={(e) => setSearch(e.target.value)}
        />
      </Space>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={filtered}
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
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (s: string) => <StatusTag status={s} />,
            filters: STATUS_OPTIONS.map((o) => ({ text: o.label, value: o.value })),
            onFilter: (value, record) => record.status === value,
          },
          {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            render: (v: string) => new Date(v).toLocaleString('vi-VN'),
          },
        ]}
      />
    </div>
  );
}
