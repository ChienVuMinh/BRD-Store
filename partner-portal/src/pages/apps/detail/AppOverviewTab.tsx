import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Descriptions,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  App as AntApp,
  Card,
  Row,
  Col,
  Statistic,
  Upload,
  Image,
} from 'antd';
import { EditOutlined, SendOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { getAppStats, updateApp, submitApp, uploadAppLogo, uploadAppBanner } from '../../../api/apps';
import { listContentRatings } from '../../../api/referenceData';
import StatusTag from '../../../components/StatusTag';
import { getErrorMessage, resolveAssetUrl } from '../../../api/client';
import type { AppResponse, UpdateAppRequest } from '../../../types/models';
import type { AppPriceType } from '../../../types/enums';

export default function AppOverviewTab({ app }: { app: AppResponse }) {
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm<UpdateAppRequest>();
  const [priceType, setPriceType] = useState<AppPriceType>(app.priceType ?? 'FREE');

  const statsQuery = useQuery({
    queryKey: ['app-stats', app.id],
    queryFn: () => getAppStats(app.id),
  });
  const contentRatingsQuery = useQuery({ queryKey: ['content-ratings'], queryFn: listContentRatings });

  const updateMutation = useMutation({
    mutationFn: (req: UpdateAppRequest) => updateApp(app.id, req),
    onSuccess: () => {
      message.success('Đã cập nhật ứng dụng');
      setEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['app', app.id] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const submitMutation = useMutation({
    mutationFn: () => submitApp(app.id),
    onSuccess: () => {
      message.success('Đã gửi ứng dụng để duyệt');
      queryClient.invalidateQueries({ queryKey: ['app', app.id] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const logoUploadProps: UploadProps = {
    showUploadList: false,
    beforeUpload: async (file) => {
      try {
        await uploadAppLogo(app.id, file);
        message.success('Đã cập nhật logo');
        queryClient.invalidateQueries({ queryKey: ['app', app.id] });
      } catch (err) {
        message.error(getErrorMessage(err));
      }
      return false;
    },
  };

  const bannerUploadProps: UploadProps = {
    showUploadList: false,
    beforeUpload: async (file) => {
      try {
        await uploadAppBanner(app.id, file);
        message.success('Đã cập nhật banner');
        queryClient.invalidateQueries({ queryKey: ['app', app.id] });
      } catch (err) {
        message.error(getErrorMessage(err));
      }
      return false;
    },
  };

  function openEdit() {
    form.setFieldsValue({
      name: app.name,
      shortDesc: app.shortDesc,
      fullDesc: app.fullDesc,
      contentRatingId: app.contentRatingId,
      supportEmail: app.supportEmail,
      supportPhone: app.supportPhone,
      websiteUrl: app.websiteUrl,
      privacyPolicyUrl: app.privacyPolicyUrl,
      priceType: app.priceType,
      priceVnd: app.priceVnd,
      appSignatureHash: app.appSignatureHash,
      isGlobalAccess: app.isGlobalAccess,
    });
    setPriceType(app.priceType ?? 'FREE');
    setEditOpen(true);
  }

  const stats = statsQuery.data;
  const canEdit = app.status === 'DRAFT' || app.status === 'REJECTED';

  return (
    <div>
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

      <Card
        title="Hình ảnh"
        size="small"
        style={{ marginBottom: 16 }}
        extra={
          canEdit && (
            <Space>
              <Upload {...logoUploadProps}><Button size="small" icon={<UploadOutlined />}>Logo</Button></Upload>
              <Upload {...bannerUploadProps}><Button size="small" icon={<UploadOutlined />}>Banner</Button></Upload>
            </Space>
          )
        }
      >
        <Space size={16}>
          {app.logoUrl ? <Image src={resolveAssetUrl(app.logoUrl)} width={80} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} /> : <div style={{ color: '#999' }}>Chưa có logo</div>}
          {app.bannerUrl ? <Image src={resolveAssetUrl(app.bannerUrl)} width={200} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} /> : <div style={{ color: '#999' }}>Chưa có banner</div>}
        </Space>
      </Card>

      <Card
        title="Thông tin ứng dụng"
        extra={
          canEdit && (
            <Button icon={<EditOutlined />} onClick={openEdit}>Chỉnh sửa</Button>
          )
        }
      >
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Trạng thái" span={2}><StatusTag status={app.status} /></Descriptions.Item>
          <Descriptions.Item label="Mô tả ngắn" span={2}>{app.shortDesc ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Mô tả đầy đủ" span={2}>{app.fullDesc ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Loại giá">{app.priceType === 'PAID' ? `Trả phí — ${app.priceVnd?.toLocaleString('vi-VN')} đ` : 'Miễn phí'}</Descriptions.Item>
          <Descriptions.Item label="Truy cập toàn quốc">{app.isGlobalAccess ? 'Có' : 'Không'}</Descriptions.Item>
          <Descriptions.Item label="Email hỗ trợ">{app.supportEmail ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="SĐT hỗ trợ">{app.supportPhone ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Website">{app.websiteUrl ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Chính sách bảo mật">{app.privacyPolicyUrl ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Chữ ký số" span={2}>{app.appSignatureHash ?? '—'}</Descriptions.Item>
        </Descriptions>

        {(app.status === 'DRAFT' || app.status === 'REJECTED') && (
          <Space style={{ marginTop: 16 }}>
            <Button type="primary" icon={<SendOutlined />} loading={submitMutation.isPending} onClick={() => submitMutation.mutate()}>
              Gửi duyệt hồ sơ ứng dụng
            </Button>
          </Space>
        )}
      </Card>

      <Modal
        title="Chỉnh sửa thông tin ứng dụng"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={updateMutation.isPending}
        okText="Lưu"
        cancelText="Hủy"
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={(values) => updateMutation.mutate(values)}>
          <Form.Item name="name" label="Tên ứng dụng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="shortDesc" label="Mô tả ngắn">
            <Input maxLength={255} showCount />
          </Form.Item>
          <Form.Item name="fullDesc" label="Mô tả đầy đủ">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="contentRatingId" label="Độ tuổi">
            <Select
              allowClear
              loading={contentRatingsQuery.isLoading}
              options={(contentRatingsQuery.data ?? []).map((c) => ({ label: `${c.code} — ${c.description ?? ''}`, value: c.id }))}
            />
          </Form.Item>
          <Form.Item name="priceType" label="Mô hình kinh doanh">
            <Radio.Group onChange={(e) => setPriceType(e.target.value)}>
              <Radio.Button value="FREE">Miễn phí</Radio.Button>
              <Radio.Button value="PAID">Trả phí</Radio.Button>
            </Radio.Group>
          </Form.Item>
          {priceType === 'PAID' && (
            <Form.Item name="priceVnd" label="Giá (VNĐ)">
              <InputNumber min={0} step={1000} style={{ width: '100%' }} />
            </Form.Item>
          )}
          <Form.Item name="supportEmail" label="Email hỗ trợ">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="supportPhone" label="SĐT hỗ trợ">
            <Input />
          </Form.Item>
          <Form.Item name="websiteUrl" label="Website">
            <Input />
          </Form.Item>
          <Form.Item name="privacyPolicyUrl" label="Chính sách bảo mật">
            <Input />
          </Form.Item>
          <Form.Item name="appSignatureHash" label="Chữ ký số">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
