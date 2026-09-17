import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Row, Col, Typography, Button, Tag, Skeleton, Space, App as AntApp, Statistic, Divider } from 'antd';
import { DownloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getApp, getAppStats } from '../../api/apps';
import { getPublishedVersion } from '../../api/versions';
import { installApp } from '../../api/installs';
import { resolveAssetUrl, getErrorMessage } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import ReviewsSection from './ReviewsSection';

const { Title, Text, Paragraph } = Typography;

export default function AppDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();
  const token = useAuthStore((s) => s.token);

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
  const publishedVersionQuery = useQuery({
    queryKey: ['app-published-version', id],
    queryFn: () => getPublishedVersion(id!),
    enabled: !!id,
  });

  const installMutation = useMutation({
    mutationFn: (versionId: string) => installApp(id!, { versionId }),
    onSuccess: () => {
      message.success('Đã ghi nhận lượt tải. Cảm ơn bạn!');
      queryClient.invalidateQueries({ queryKey: ['app-stats', id] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  if (appQuery.isLoading) return <Skeleton active />;
  if (!appQuery.data) return <Text type="danger">Không tìm thấy ứng dụng</Text>;

  const app = appQuery.data;
  const stats = statsQuery.data;
  const publishedVersion = publishedVersionQuery.data;

  function handleInstall() {
    if (!token) {
      message.info('Vui lòng đăng nhập để tải ứng dụng');
      navigate('/login');
      return;
    }
    if (!publishedVersion) return;
    installMutation.mutate(publishedVersion.id);
  }

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 16 }}>
        Quay lại
      </Button>

      {app.bannerUrl && (
        <img
          src={resolveAssetUrl(app.bannerUrl)}
          alt={app.name}
          style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 12, marginBottom: 24 }}
        />
      )}

      <Row gutter={24}>
        <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
          {app.logoUrl ? (
            <img src={resolveAssetUrl(app.logoUrl)} alt={app.name} style={{ width: 96, height: 96, borderRadius: 20, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 96, height: 96, borderRadius: 20, background: '#f0f0f0', margin: '0 auto' }} />
          )}
        </Col>
        <Col xs={24} sm={18}>
          <Title level={2} style={{ marginBottom: 4 }}>{app.name}</Title>
          <Text type="secondary">{app.packageName} · {app.osPlatform}</Text>
          <div style={{ marginTop: 8 }}>
            <Tag color={app.priceType === 'PAID' ? 'gold' : 'green'}>
              {app.priceType === 'PAID' ? `${app.priceVnd?.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
            </Tag>
          </div>
          <Space size={32} style={{ marginTop: 16 }}>
            <Statistic title="Lượt tải" value={stats?.totalDownloads ?? 0} />
            <Statistic title="Đánh giá" value={stats?.averageRating ?? 0} precision={1} suffix="/ 5" />
            <Statistic title="Lượt đánh giá" value={stats?.totalReviews ?? 0} />
          </Space>
          <div style={{ marginTop: 20 }}>
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              disabled={!publishedVersion}
              loading={installMutation.isPending}
              onClick={handleInstall}
            >
              {publishedVersion ? `Tải xuống (${publishedVersion.versionName})` : 'Chưa có bản phát hành'}
            </Button>
          </div>
        </Col>
      </Row>

      <Divider />

      <Title level={4}>Giới thiệu</Title>
      <Paragraph>{app.fullDesc ?? app.shortDesc ?? 'Chưa có mô tả.'}</Paragraph>

      {publishedVersion && (
        <>
          <Title level={4}>Thông tin phiên bản</Title>
          <Paragraph>
            Phiên bản: {publishedVersion.versionName} (build #{publishedVersion.buildNumber})<br />
            {publishedVersion.releaseNotes && <>Ghi chú: {publishedVersion.releaseNotes}<br /></>}
            Cập nhật: {new Date(publishedVersion.createdAt).toLocaleDateString('vi-VN')}
          </Paragraph>
        </>
      )}

      <Divider />
      <ReviewsSection appId={app.id} averageRating={stats?.averageRating ?? 0} />
    </div>
  );
}
