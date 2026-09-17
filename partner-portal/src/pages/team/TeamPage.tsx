import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, Typography, Button, Modal, Form, Input, Select, App as AntApp, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createPartnerUser, listPartnerUsers } from '../../api/partners';
import StatusTag from '../../components/StatusTag';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../api/client';
import type { CreatePartnerUserRequest } from '../../types/models';

const { Title } = Typography;

const PARTNER_ROLES = ['P_DEVELOPER', 'P_QC', 'P_FINANCE'];

export default function TeamPage() {
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();
  const partnerId = useAuthStore((s) => s.partnerId);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<CreatePartnerUserRequest>();

  const { data, isLoading } = useQuery({
    queryKey: ['partner-users', partnerId],
    queryFn: () => listPartnerUsers(partnerId!),
    enabled: !!partnerId,
  });

  const createMutation = useMutation({
    mutationFn: (req: CreatePartnerUserRequest) => createPartnerUser(partnerId!, req),
    onSuccess: () => {
      message.success('Đã tạo tài khoản nhân sự');
      setModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['partner-users', partnerId] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Nhân sự</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Thêm nhân sự
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
        ]}
      />

      <Modal
        title="Thêm nhân sự"
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
            <Select mode="multiple" options={PARTNER_ROLES.map((r) => ({ label: r, value: r }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
