import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Modal, Form, Input, Upload, App as AntApp, Typography } from 'antd';
import { PlusOutlined, UploadOutlined, SendOutlined, CloudUploadOutlined, RocketOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import {
  listVersionsByApp,
  createVersion,
  submitVersion,
  sendVersionToReview,
  publishVersion,
  type CreateVersionFormValues,
} from '../../../api/versions';
import StatusTag from '../../../components/StatusTag';
import { getErrorMessage } from '../../../api/client';
import type { AppResponse, VersionResponse } from '../../../types/models';

const { Text } = Typography;

export default function AppVersionsTab({ app }: { app: AppResponse }) {
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm<Omit<CreateVersionFormValues, 'file'>>();

  const versionsQuery = useQuery({
    queryKey: ['app-versions', app.id],
    queryFn: () => listVersionsByApp(app.id),
    refetchInterval: 15000,
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateVersionFormValues) => createVersion(app.id, values),
    onSuccess: () => {
      message.success('Đã tạo phiên bản mới (Nháp)');
      setCreateOpen(false);
      form.resetFields();
      setFileList([]);
      queryClient.invalidateQueries({ queryKey: ['app-versions', app.id] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => submitVersion(id),
    onSuccess: () => {
      message.success('Đã submit — sẵn sàng test nội bộ');
      queryClient.invalidateQueries({ queryKey: ['app-versions', app.id] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const sendToReviewMutation = useMutation({
    mutationFn: (id: string) => sendVersionToReview(id),
    onSuccess: () => {
      message.success('Đã đệ trình để kiểm duyệt');
      queryClient.invalidateQueries({ queryKey: ['app-versions', app.id] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => publishVersion(id),
    onSuccess: () => {
      message.success('Đã phát hành phiên bản lên Store');
      queryClient.invalidateQueries({ queryKey: ['app-versions', app.id] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  function renderActions(v: VersionResponse) {
    switch (v.status) {
      case 'DRAFT':
        return (
          <Button
            size="small"
            icon={<CloudUploadOutlined />}
            loading={submitMutation.isPending}
            disabled={!v.fileUrl}
            onClick={() => submitMutation.mutate(v.id)}
          >
            Submit test nội bộ
          </Button>
        );
      case 'SUBMIT':
        return (
          <Button size="small" icon={<SendOutlined />} loading={sendToReviewMutation.isPending} onClick={() => sendToReviewMutation.mutate(v.id)}>
            Đệ trình duyệt
          </Button>
        );
      case 'APPROVED':
        if (app.status !== 'APPROVED') {
          return <Text type="secondary" style={{ fontSize: 12 }}>Chờ hồ sơ ứng dụng được duyệt trước khi phát hành</Text>;
        }
        return (
          <Button size="small" type="primary" icon={<RocketOutlined />} loading={publishMutation.isPending} onClick={() => publishMutation.mutate(v.id)}>
            Phát hành
          </Button>
        );
      case 'REJECTED':
        return <Text type="secondary" style={{ fontSize: 12 }}>Đã bị từ chối — tạo phiên bản mới (build number mới) để nộp lại</Text>;
      default:
        return null;
    }
  }

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text type="secondary">Quản lý các bản build và vòng đời kiểm duyệt</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          Tạo phiên bản mới
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={versionsQuery.isLoading}
        dataSource={versionsQuery.data ?? []}
        columns={[
          { title: 'Version', dataIndex: 'versionName' },
          { title: 'Build', dataIndex: 'buildNumber' },
          { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag status={s} /> },
          { title: 'Ngày tạo', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('vi-VN') },
          { title: '', key: 'actions', render: (_, v) => renderActions(v) },
        ]}
      />

      <Modal
        title="Tạo phiên bản mới"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) =>
            createMutation.mutate({ ...values, file: fileList[0]?.originFileObj as File | undefined })
          }
        >
          <Form.Item name="versionName" label="Version name" rules={[{ required: true }]}>
            <Input placeholder="1.0.0" />
          </Form.Item>
          <Form.Item name="minSdkVersion" label="Min SDK version">
            <Input placeholder="21" />
          </Form.Item>
          <Form.Item name="targetSdkVersion" label="Target SDK version">
            <Input placeholder="34" />
          </Form.Item>
          <Form.Item name="supportedArchitectures" label="Kiến trúc hỗ trợ">
            <Input placeholder="arm64-v8a, armeabi-v7a" />
          </Form.Item>
          <Form.Item name="releaseNotes" label="Release notes">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="File build">
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
