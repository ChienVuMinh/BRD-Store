import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Typography, Tag, Modal, Descriptions, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { listAuditLogs } from '../../api/auditLogs';
import type { AuditLogResponse } from '../../types/models';

const { Title, Text } = Typography;

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  STATUS_CHANGE: 'gold',
  ROLE_CHANGE: 'purple',
  FINANCIAL_CHANGE: 'magenta',
  LOGIN: 'default',
};

function formatJson(value: string | null): string {
  if (!value) return '—';
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [selected, setSelected] = useState<AuditLogResponse | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, size],
    queryFn: () => listAuditLogs(page, size),
  });

  return (
    <div>
      <Title level={3}>Nhật ký kiểm toán (Audit Log)</Title>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.content ?? []}
        pagination={{
          current: page + 1,
          pageSize: size,
          total: data?.totalElements ?? 0,
          onChange: (p, s) => {
            setPage(p - 1);
            setSize(s);
          },
        }}
        columns={[
          { title: 'Thời gian', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('vi-VN') },
          {
            title: 'Hành động',
            dataIndex: 'action',
            render: (a: string) => <Tag color={ACTION_COLOR[a] ?? 'default'}>{a}</Tag>,
          },
          { title: 'Đối tượng', dataIndex: 'targetEntity' },
          { title: 'ID đối tượng', dataIndex: 'targetEntityId', ellipsis: true },
          { title: 'Người thực hiện', dataIndex: 'userId', ellipsis: true, render: (v: string | null) => v ?? 'Hệ thống' },
          { title: 'IP', dataIndex: 'ipAddress', render: (v: string | null) => v ?? '—' },
          {
            title: '',
            key: 'action-view',
            render: (_, record) => (
              <Button size="small" icon={<EyeOutlined />} onClick={() => setSelected(record)}>
                Chi tiết
              </Button>
            ),
          },
        ]}
      />

      <Modal
        title="Chi tiết audit log"
        open={selected !== null}
        onCancel={() => setSelected(null)}
        footer={null}
        width={720}
      >
        {selected && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Thời gian">{new Date(selected.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
            <Descriptions.Item label="Hành động">{selected.action}</Descriptions.Item>
            <Descriptions.Item label="Đối tượng">{selected.targetEntity}</Descriptions.Item>
            <Descriptions.Item label="ID đối tượng">{selected.targetEntityId}</Descriptions.Item>
            <Descriptions.Item label="Người thực hiện">{selected.userId ?? 'Hệ thống'}</Descriptions.Item>
            <Descriptions.Item label="IP">{selected.ipAddress ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Dữ liệu cũ">
              <Text code style={{ whiteSpace: 'pre-wrap' }}>{formatJson(selected.oldValue)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Dữ liệu mới">
              <Text code style={{ whiteSpace: 'pre-wrap' }}>{formatJson(selected.newValue)}</Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
