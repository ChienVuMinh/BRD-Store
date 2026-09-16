import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, Typography, Button, Modal, Form, Input, Select, App as AntApp, Space, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createSystemUser, listSystemUsers, setSystemUserStatus } from '../../api/systemUsers';
import StatusTag from '../../components/StatusTag';
import { ADMIN_ROLES } from '../../types/enums';
import { getErrorMessage } from '../../api/client';
import type { CreateSystemUserRequest } from '../../types/models';

const { Title } = Typography;

export default function SystemUserListPage() {
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<CreateSystemUserRequest>();

  const { data, isLoading } = useQuery({
    queryKey: ['system-users'],
    queryFn: listSystemUsers,
  });

  const createMutation = useMutation({
    mutationFn: (req: CreateSystemUserRequest) => createSystemUser(req),
    onSuccess: () => {
      message.success('Đã tạo tài khoản mới');
      setModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      setSystemUserStatus(id, active ? 'ACTIVE' : 'SUSPENDED'),
    onSuccess: () => {
      message.success('Đã cập nhật trạng thái');
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Người dùng hệ thống</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Tạo tài khoản
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data ?? []}
        columns={[
          { title: 'Tên đăng nhập', dataIndex: 'username' },
          { title: 'Họ tên', dataIndex: 'fullName' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Vai trò', dataIndex: 'roles', render: (roles: string[]) => roles.join(', ') },
          { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag status={s} /> },
          {
            title: 'Kích hoạt',
            key: 'toggle',
            render: (_, record) => (
              <Switch
                checked={record.status === 'ACTIVE'}
                loading={statusMutation.isPending}
                onChange={(checked) => statusMutation.mutate({ id: record.id, active: checked })}
              />
            ),
          },
        ]}
      />

      <Modal
        title="Tạo tài khoản hệ thống"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={(values) => createMutation.mutate(values)}>
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="roleCodes" label="Vai trò" rules={[{ required: true }]}>
            <Select mode="multiple" options={ADMIN_ROLES.map((r) => ({ label: r, value: r }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
