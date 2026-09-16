import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Select, Space, Input } from 'antd';
import { listPartners } from '../../api/partners';
import StatusTag from '../../components/StatusTag';
import type { PartnerStatus } from '../../types/enums';

const { Title } = Typography;

const STATUS_OPTIONS: { label: string; value: PartnerStatus }[] = [
  { label: 'Chờ duyệt', value: 'PENDING' },
  { label: 'Đã duyệt', value: 'APPROVED' },
  { label: 'Từ chối', value: 'REJECTED' },
  { label: 'Tạm khóa', value: 'SUSPENDED' },
];

export default function PartnerListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PartnerStatus | undefined>(undefined);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['partners', status ?? 'ALL'],
    queryFn: () => listPartners(status),
  });

  const filtered = (data ?? []).filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.partnerCode.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <Title level={3}>Quản lý đối tác</Title>
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
          placeholder="Tìm theo tên, mã đối tác, email"
          style={{ width: 300 }}
          allowClear
          onChange={(e) => setSearch(e.target.value)}
        />
      </Space>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={filtered}
        onRow={(record) => ({ onClick: () => navigate(`/partners/${record.id}`), style: { cursor: 'pointer' } })}
        columns={[
          { title: 'Mã đối tác', dataIndex: 'partnerCode' },
          { title: 'Tên đối tác', dataIndex: 'name' },
          { title: 'Loại hình', dataIndex: 'partnerType' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Người đại diện', dataIndex: 'legalRepName' },
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
