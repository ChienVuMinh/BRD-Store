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
  Card,
  App as AntApp,
  Skeleton,
  Form,
} from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { getVersion, reviewApproveVersion, reviewRejectVersion } from '../../api/versions';
import { getApp } from '../../api/apps';
import StatusTag from '../../components/StatusTag';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage, resolveAssetUrl } from '../../api/client';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function VersionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();
  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);
  const canReview = hasAnyRole(['O_REVIEWER', 'O_ADMIN', 'S_ADMIN']);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const versionQuery = useQuery({
    queryKey: ['version', id],
    queryFn: () => getVersion(id!),
    enabled: !!id,
  });
  const appQuery = useQuery({
    queryKey: ['app', versionQuery.data?.appId],
    queryFn: () => getApp(versionQuery.data!.appId),
    enabled: !!versionQuery.data?.appId,
  });

  const approveMutation = useMutation({
    mutationFn: () => reviewApproveVersion(id!, { reviewNotes: notes || undefined }),
    onSuccess: () => {
      message.success('Đã duyệt phiên bản');
      setApproveModalOpen(false);
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['version', id] });
      queryClient.invalidateQueries({ queryKey: ['versions'] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: () => reviewRejectVersion(id!, { rejectionReason, reviewNotes: notes || undefined }),
    onSuccess: () => {
      message.success('Đã từ chối phiên bản');
      setRejectModalOpen(false);
      setRejectionReason('');
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['version', id] });
      queryClient.invalidateQueries({ queryKey: ['versions'] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  if (versionQuery.isLoading) return <Skeleton active />;
  if (!versionQuery.data) return <Text type="danger">Không tìm thấy phiên bản</Text>;

  const version = versionQuery.data;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/versions')}>Quay lại</Button>
      </Space>
      <Title level={3}>
        {version.versionName} (build #{version.buildNumber}) <StatusTag status={version.status} />
      </Title>
      {appQuery.data && (
        <Text type="secondary">
          Thuộc ứng dụng:{' '}
          <a onClick={() => navigate(`/apps/${appQuery.data!.id}`)}>{appQuery.data.name}</a>
        </Text>
      )}

      <Card style={{ marginTop: 16 }}>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Min SDK">{version.minSdkVersion ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Target SDK">{version.targetSdkVersion ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Kiến trúc hỗ trợ" span={2}>{version.supportedArchitectures ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="File" span={2}>
            {version.fileUrl ? <a href={resolveAssetUrl(version.fileUrl)} target="_blank" rel="noreferrer">Tải file build</a> : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Dung lượng">
            {version.fileSizeBytes ? `${(version.fileSizeBytes / 1024 / 1024).toFixed(2)} MB` : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="SHA-256">{version.fileHashSha256 ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Release notes" span={2}>{version.releaseNotes ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={2}>{new Date(version.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
        </Descriptions>

        {canReview && version.status === 'IN_REVIEW' && (
          <Space style={{ marginTop: 16 }}>
            <Button type="primary" icon={<CheckOutlined />} onClick={() => setApproveModalOpen(true)}>
              Duyệt
            </Button>
            <Button danger icon={<CloseOutlined />} onClick={() => setRejectModalOpen(true)}>
              Từ chối
            </Button>
          </Space>
        )}
      </Card>

      <Modal
        title="Duyệt phiên bản"
        open={approveModalOpen}
        onCancel={() => setApproveModalOpen(false)}
        onOk={() => approveMutation.mutate()}
        confirmLoading={approveMutation.isPending}
        okText="Xác nhận duyệt"
        cancelText="Hủy"
      >
        <Form layout="vertical">
          <Form.Item label="Ghi chú (không bắt buộc)">
            <TextArea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Từ chối phiên bản"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={() => {
          if (!rejectionReason.trim()) {
            message.error('Vui lòng nhập lý do từ chối');
            return;
          }
          rejectMutation.mutate();
        }}
        confirmLoading={rejectMutation.isPending}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Form layout="vertical">
          <Form.Item label="Lý do từ chối" required>
            <TextArea rows={3} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
          </Form.Item>
          <Form.Item label="Ghi chú thêm (không bắt buộc)">
            <TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
