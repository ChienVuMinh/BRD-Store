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
  Image,
  Row,
  Col,
  Statistic,
} from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, StopOutlined } from '@ant-design/icons';
import { approveApp, getApp, getAppStats, rejectApp, suspendApp } from '../../api/apps';
import { listVersionsByApp } from '../../api/versions';
import StatusTag from '../../components/StatusTag';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage, resolveAssetUrl } from '../../api/client';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function AppDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message, modal } = AntApp.useApp();
  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);
  const canReview = hasAnyRole(['O_REVIEWER', 'O_ADMIN', 'S_ADMIN']);
  const canSuspend = hasAnyRole(['O_ADMIN', 'S_ADMIN', 'O_SUPPORT']);

  const [reasonModal, setReasonModal] = useState<'reject' | 'suspend' | null>(null);
  const [reason, setReason] = useState('');

  const appQuery = useQuery({
    queryKey: ['app', id],
    queryFn: () => getApp(id!),
    enabled: !!id,
  });
  const statsQuery = useQuery({
    queryKey: ['app-stats', id],
    queryFn: () => getAppStats(id!),
    enabled: !!id,
  });
  const versionsQuery = useQuery({
    queryKey: ['app-versions', id],
    queryFn: () => listVersionsByApp(id!),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => approveApp(id!),
    onSuccess: () => {
      message.success('Đã duyệt ứng dụng');
      queryClient.invalidateQueries({ queryKey: ['app', id] });
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectApp(id!, { reason }),
    onSuccess: () => {
      message.success('Đã từ chối ứng dụng');
      setReasonModal(null);
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['app', id] });
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const suspendMutation = useMutation({
    mutationFn: () => suspendApp(id!, { reason }),
    onSuccess: () => {
      message.success('Đã tạm khóa ứng dụng');
      setReasonModal(null);
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['app', id] });
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  function confirmApprove() {
    modal.confirm({
      title: 'Duyệt ứng dụng này?',
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: () => approveMutation.mutate(),
    });
  }

  if (appQuery.isLoading) return <Skeleton active />;
  if (!appQuery.data) return <Text type="danger">Không tìm thấy ứng dụng</Text>;

  const app = appQuery.data;
  const stats = statsQuery.data;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/apps')}>Quay lại</Button>
      </Space>

      <Space align="center" style={{ marginBottom: 16 }}>
        {app.logoUrl && <Image src={resolveAssetUrl(app.logoUrl)} width={64} height={64} style={{ borderRadius: 8, objectFit: 'cover' }} />}
        <div>
          <Title level={3} style={{ marginBottom: 0 }}>
            {app.name} <StatusTag status={app.status} />
          </Title>
          <Text type="secondary">{app.packageName} · {app.osPlatform}</Text>
        </div>
      </Space>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small"><Statistic title="Tổng lượt tải" value={stats?.totalDownloads ?? 0} /></Card>
        </Col>
        <Col span={8}>
          <Card size="small"><Statistic title="Đánh giá trung bình" value={stats?.averageRating ?? 0} precision={2} suffix="/ 5" /></Card>
        </Col>
        <Col span={8}>
          <Card size="small"><Statistic title="Tổng lượt đánh giá" value={stats?.totalReviews ?? 0} /></Card>
        </Col>
      </Row>

      <Card>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Mô tả ngắn" span={2}>{app.shortDesc ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Mô tả đầy đủ" span={2}>{app.fullDesc ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Loại giá">{app.priceType === 'PAID' ? `Trả phí — ${app.priceVnd?.toLocaleString('vi-VN')} đ` : 'Miễn phí'}</Descriptions.Item>
          <Descriptions.Item label="Truy cập toàn quốc">{app.isGlobalAccess ? 'Có' : 'Không'}</Descriptions.Item>
          <Descriptions.Item label="Email hỗ trợ">{app.supportEmail ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="SĐT hỗ trợ">{app.supportPhone ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Website">{app.websiteUrl ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Chính sách bảo mật">{app.privacyPolicyUrl ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Chữ ký số (hash)" span={2}>{app.appSignatureHash ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={2}>{new Date(app.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
        </Descriptions>

        <Space style={{ marginTop: 16 }}>
          {canReview && app.status === 'PENDING_APPROVAL' && (
            <>
              <Button type="primary" icon={<CheckOutlined />} loading={approveMutation.isPending} onClick={confirmApprove}>
                Duyệt
              </Button>
              <Button danger icon={<CloseOutlined />} onClick={() => setReasonModal('reject')}>
                Từ chối
              </Button>
            </>
          )}
          {canSuspend && app.status === 'APPROVED' && (
            <Button danger icon={<StopOutlined />} onClick={() => setReasonModal('suspend')}>
              Tạm khóa
            </Button>
          )}
        </Space>
      </Card>

      <Card title="Danh sách phiên bản" style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          loading={versionsQuery.isLoading}
          dataSource={versionsQuery.data ?? []}
          onRow={(record) => ({ onClick: () => navigate(`/versions/${record.id}`), style: { cursor: 'pointer' } })}
          columns={[
            { title: 'Version', dataIndex: 'versionName' },
            { title: 'Build', dataIndex: 'buildNumber' },
            { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag status={s} /> },
            { title: 'Ngày tạo', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('vi-VN') },
          ]}
          pagination={false}
        />
      </Card>

      <Modal
        title={reasonModal === 'reject' ? 'Từ chối ứng dụng' : 'Tạm khóa ứng dụng'}
        open={reasonModal !== null}
        onCancel={() => setReasonModal(null)}
        onOk={() => (reasonModal === 'reject' ? rejectMutation.mutate() : suspendMutation.mutate())}
        confirmLoading={rejectMutation.isPending || suspendMutation.isPending}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <TextArea rows={3} placeholder="Nhập lý do..." value={reason} onChange={(e) => setReason(e.target.value)} />
      </Modal>
    </div>
  );
}
