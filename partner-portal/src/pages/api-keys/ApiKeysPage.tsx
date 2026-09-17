import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, Typography, Button, Modal, Form, Input, App as AntApp, Space, Popconfirm, Alert, Tag, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { createApiKey, deleteApiKey, listApiKeys } from '../../api/partners';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../api/client';

const { Title, Text, Paragraph } = Typography;

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();
  const partnerId = useAuthStore((s) => s.partnerId);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<{ keyName: string }>();
  const [newKey, setNewKey] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['api-keys', partnerId],
    queryFn: () => listApiKeys(partnerId!),
    enabled: !!partnerId,
  });

  const createMutation = useMutation({
    mutationFn: (keyName: string) => createApiKey(partnerId!, keyName),
    onSuccess: (res) => {
      setNewKey(res.plainKey);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['api-keys', partnerId] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const revokeMutation = useMutation({
    mutationFn: (keyId: string) => deleteApiKey(partnerId!, keyId),
    onSuccess: () => {
      message.success('Đã thu hồi API key');
      queryClient.invalidateQueries({ queryKey: ['api-keys', partnerId] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    message.success('Đã sao chép vào clipboard');
  }

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>API Keys (CI/CD)</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setNewKey(null); setModalOpen(true); }}>
          Tạo API Key
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data ?? []}
        columns={[
          { title: 'Tên key', dataIndex: 'keyName' },
          {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            render: (active: boolean) => <Tag color={active ? 'green' : 'default'}>{active ? 'ACTIVE' : 'REVOKED'}</Tag>,
          },
          { title: 'Ngày tạo', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('vi-VN') },
          {
            title: '',
            key: 'actions',
            render: (_, record) =>
              record.isActive && (
                <Popconfirm
                  title="Thu hồi API key này?"
                  description="Mọi tích hợp CI/CD dùng key này sẽ ngừng hoạt động."
                  okText="Thu hồi"
                  cancelText="Hủy"
                  onConfirm={() => revokeMutation.mutate(record.id)}
                >
                  <Tooltip title="Thu hồi">
                    <Button danger size="small" icon={<DeleteOutlined />} loading={revokeMutation.isPending} />
                  </Tooltip>
                </Popconfirm>
              ),
          },
        ]}
      />

      <Modal
        title="Tạo API Key mới"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={newKey ? [<Button key="close" type="primary" onClick={() => setModalOpen(false)}>Đóng</Button>] : undefined}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        okText="Tạo"
        cancelText="Hủy"
      >
        {newKey ? (
          <div>
            <Alert
              type="warning"
              showIcon
              message="Lưu key này ngay bây giờ"
              description="Vì lý do bảo mật, key chỉ hiển thị một lần duy nhất. Sau khi đóng cửa sổ này bạn sẽ không thể xem lại."
              style={{ marginBottom: 12 }}
            />
            <Paragraph copyable={{ text: newKey }} code style={{ wordBreak: 'break-all' }}>
              {newKey}
            </Paragraph>
            <Button icon={<CopyOutlined />} onClick={() => copyKey(newKey)}>Sao chép</Button>
          </div>
        ) : (
          <Form form={form} layout="vertical" onFinish={(values) => createMutation.mutate(values.keyName)}>
            <Form.Item name="keyName" label="Tên key" rules={[{ required: true, message: 'Vui lòng đặt tên cho key' }]}>
              <Input placeholder="VD: CI/CD pipeline - Production" />
            </Form.Item>
          </Form>
        )}
      </Modal>
      <Text type="secondary" style={{ fontSize: 12 }}>
        API Key dùng để xác thực các pipeline CI/CD tự động upload bản build mà không cần đăng nhập thủ công.
      </Text>
    </div>
  );
}
