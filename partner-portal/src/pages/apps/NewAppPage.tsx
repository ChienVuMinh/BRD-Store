import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, Form, Input, Select, InputNumber, Radio, Button, Typography, Space, App as AntApp } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { createApp } from '../../api/apps';
import { listContentRatings } from '../../api/referenceData';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../api/client';
import type { CreateAppRequest } from '../../types/models';
import type { OsPlatform, AppPriceType } from '../../types/enums';

const { Title } = Typography;

const OS_OPTIONS: { label: string; value: OsPlatform }[] = [
  { label: 'Android', value: 'ANDROID' },
  { label: 'iOS', value: 'IOS' },
  { label: 'HarmonyOS', value: 'HARMONYOS' },
  { label: 'Đa nền tảng', value: 'MULTI_PLATFORM' },
];

export default function NewAppPage() {
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const partnerId = useAuthStore((s) => s.partnerId);
  const [form] = Form.useForm<CreateAppRequest>();
  const [priceType, setPriceType] = useState<AppPriceType>('FREE');

  const contentRatingsQuery = useQuery({ queryKey: ['content-ratings'], queryFn: listContentRatings });

  const createMutation = useMutation({
    mutationFn: (req: CreateAppRequest) => createApp(partnerId!, req),
    onSuccess: (app) => {
      message.success('Đã tạo ứng dụng (trạng thái Nháp)');
      navigate(`/apps/${app.id}`);
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/apps')}>Quay lại</Button>
      </Space>
      <Title level={3}>Tạo ứng dụng mới</Title>

      <Card style={{ maxWidth: 720 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ priceType: 'FREE', isGlobalAccess: true }}
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item name="osPlatform" label="Nền tảng" rules={[{ required: true }]}>
            <Select options={OS_OPTIONS} placeholder="Chọn nền tảng" />
          </Form.Item>
          <Form.Item
            name="packageName"
            label="Package name"
            rules={[{ required: true, message: 'Vui lòng nhập package name' }]}
            extra="Phải là duy nhất trên mỗi nền tảng, ví dụ: com.company.app"
          >
            <Input placeholder="com.company.app" />
          </Form.Item>
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
            <Form.Item name="priceVnd" label="Giá (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
              <InputNumber min={0} step={1000} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
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
          <Form.Item name="appSignatureHash" label="Chữ ký số (App Signature Hash)">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Tạo ứng dụng
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
