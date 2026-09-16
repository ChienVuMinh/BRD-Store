import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Descriptions,
  Typography,
  Button,
  Space,
  Modal,
  Input,
  Table,
  Card,
  App as AntApp,
  Skeleton,
} from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, StopOutlined } from '@ant-design/icons';
import { approvePartner, getPartner, listPartnerUsers, rejectPartner, suspendPartner } from '../../api/partners';
import { listPartnerApps } from '../../api/apps';
import StatusTag from '../../components/StatusTag';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../api/client';

const { Title } = Typography;
const { TextArea } = Input;

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message, modal } = AntApp.useApp();
  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);
  const canDecide = hasAnyRole(['O_PARTNER_MANAGER', 'O_ADMIN', 'S_ADMIN']);

  const [reasonModal, setReasonModal] = useState<'reject' | 'suspend' | null>(null);
  const [reason, setReason] = useState('');

  const partnerQuery = useQuery({
    queryKey: ['partner', id],
    queryFn: () => getPartner(id!),
    enabled: !!id,
  });
  const usersQuery = useQuery({
    queryKey: ['partner-users', id],
    queryFn: () => listPartnerUsers(id!),
    enabled: !!id,
  });
  const appsQuery = useQuery({
    queryKey: ['partner-apps', id],
    queryFn: () => listPartnerApps(id!),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => approvePartner(id!),
    onSuccess: () => {
      message.success('Đã duyệt đối tác');
      queryClient.invalidateQueries({ queryKey: ['partner', id] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectPartner(id!, { reason }),
    onSuccess: () => {
      message.success('Đã từ chối đối tác');
      setReasonModal(null);
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['partner', id] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const suspendMutation = useMutation({
    mutationFn: () => suspendPartner(id!, { reason }),
    onSuccess: () => {
      message.success('Đã tạm khóa đối tác');
      setReasonModal(null);
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['partner', id] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  function confirmApprove() {
    modal.confirm({
      title: 'Duyệt đối tác này?',
      content: 'Tài khoản P_ADMIN sẽ được tự động tạo cho đối tác.',
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: () => approveMutation.mutate(),
    });
  }

  if (partnerQuery.isLoading) return <Skeleton active />;
  if (!partnerQuery.data) return <Typography.Text type="danger">Không tìm thấy đối tác</Typography.Text>;

  const partner = partnerQuery.data;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/partners')}>Quay lại</Button>
      </Space>
      <Title level={3}>
        {partner.name} <StatusTag status={partner.status} />
      </Title>

      <Card>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Mã đối tác">{partner.partnerCode}</Descriptions.Item>
          <Descriptions.Item label="Loại hình">{partner.partnerType}</Descriptions.Item>
          <Descriptions.Item label="Mã số thuế">{partner.taxId ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Email">{partner.email}</Descriptions.Item>
          <Descriptions.Item label="Người đại diện">{partner.legalRepName}</Descriptions.Item>
          <Descriptions.Item label="SĐT người đại diện">{partner.legalRepPhone ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={2}>
            {new Date(partner.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
        </Descriptions>

        {canDecide && (
          <Space style={{ marginTop: 16 }}>
            {partner.status === 'PENDING' && (
              <>
                <Button type="primary" icon={<CheckOutlined />} loading={approveMutation.isPending} onClick={confirmApprove}>
                  Duyệt
                </Button>
                <Button danger icon={<CloseOutlined />} onClick={() => setReasonModal('reject')}>
                  Từ chối
                </Button>
              </>
            )}
            {partner.status === 'APPROVED' && (
              <Button danger icon={<StopOutlined />} onClick={() => setReasonModal('suspend')}>
                Tạm khóa
              </Button>
            )}
          </Space>
        )}
      </Card>

      <Card title="Ứng dụng của đối tác" style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          loading={appsQuery.isLoading}
          dataSource={appsQuery.data ?? []}
          onRow={(record) => ({ onClick: () => navigate(`/apps/${record.id}`), style: { cursor: 'pointer' } })}
          columns={[
            { title: 'Tên app', dataIndex: 'name' },
            { title: 'Nền tảng', dataIndex: 'osPlatform' },
            { title: 'Package', dataIndex: 'packageName' },
            { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag status={s} /> },
          ]}
          pagination={false}
        />
      </Card>

      <Card title="Người dùng của đối tác" style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          loading={usersQuery.isLoading}
          dataSource={usersQuery.data ?? []}
          columns={[
            { title: 'Tên đăng nhập', dataIndex: 'username' },
            { title: 'Họ tên', dataIndex: 'fullName' },
            { title: 'Email', dataIndex: 'email' },
            { title: 'Vai trò', dataIndex: 'roles', render: (roles: string[]) => roles.join(', ') },
            { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag status={s} /> },
          ]}
          pagination={false}
        />
      </Card>

      <Modal
        title={reasonModal === 'reject' ? 'Từ chối đối tác' : 'Tạm khóa đối tác'}
        open={reasonModal !== null}
        onCancel={() => setReasonModal(null)}
        onOk={() => (reasonModal === 'reject' ? rejectMutation.mutate() : suspendMutation.mutate())}
        confirmLoading={rejectMutation.isPending || suspendMutation.isPending}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <TextArea
          rows={3}
          placeholder="Nhập lý do..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
