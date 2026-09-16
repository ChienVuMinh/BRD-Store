import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Select, Space } from 'antd';
import { listAllVersions } from '../../api/versions';
import StatusTag from '../../components/StatusTag';
import type { VersionStatus } from '../../types/enums';

const { Title } = Typography;

const STATUS_OPTIONS: { label: string; value: VersionStatus }[] = [
  { label: 'Nháp', value: 'DRAFT' },
  { label: 'Đã submit', value: 'SUBMIT' },
  { label: 'Chờ duyệt', value: 'IN_REVIEW' },
  { label: 'Đã duyệt', value: 'APPROVED' },
  { label: 'Từ chối', value: 'REJECTED' },
  { label: 'Đã phát hành', value: 'PUBLISHED' },
  { label: 'Lưu trữ', value: 'ARCHIVED' },
];

export default function VersionListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<VersionStatus | undefined>('IN_REVIEW');

  const { data, isLoading } = useQuery({
    queryKey: ['versions', status ?? 'ALL'],
    queryFn: () => listAllVersions(status),
  });

  return (
    <div>
      <Title level={3}>Phiên bản chờ duyệt</Title>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          allowClear
          placeholder="Lọc theo trạng thái"
          style={{ width: 220 }}
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
        />
      </Space>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data ?? []}
        onRow={(record) => ({ onClick: () => navigate(`/versions/${record.id}`), style: { cursor: 'pointer' } })}
        columns={[
          { title: 'Version', dataIndex: 'versionName' },
          { title: 'Build number', dataIndex: 'buildNumber' },
          { title: 'Min SDK', dataIndex: 'minSdkVersion', render: (v: string | null) => v ?? '—' },
          { title: 'Target SDK', dataIndex: 'targetSdkVersion', render: (v: string | null) => v ?? '—' },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (s: string) => <StatusTag status={s} />,
            filters: STATUS_OPTIONS.map((o) => ({ text: o.label, value: o.value })),
            onFilter: (value, record) => record.status === value,
          },
          { title: 'Ngày tạo', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('vi-VN') },
        ]}
      />
    </div>
  );
}
