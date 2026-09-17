import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Select, Button, Space, Table, Input, App as AntApp, Typography, Tag } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import {
  getAppClassification,
  setAppCategories,
  setAppGeographies,
  setAppTags,
  setAppPermissions,
} from '../../../api/apps';
import { listCategories, listGeographies, listTags, listPermissions } from '../../../api/referenceData';
import { getErrorMessage } from '../../../api/client';
import type { AppResponse, PermissionMapRequest } from '../../../types/models';

const { Text } = Typography;

export default function AppClassificationTab({ app }: { app: AppResponse }) {
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();

  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: listCategories });
  const geographiesQuery = useQuery({ queryKey: ['geographies'], queryFn: listGeographies });
  const tagsQuery = useQuery({ queryKey: ['tags'], queryFn: listTags });
  const permissionsQuery = useQuery({ queryKey: ['permissions'], queryFn: listPermissions });
  const classificationQuery = useQuery({
    queryKey: ['app-classification', app.id],
    queryFn: () => getAppClassification(app.id),
  });

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedGeos, setSelectedGeos] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [justifications, setJustifications] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!classificationQuery.data) return;
    const c = classificationQuery.data;
    setSelectedCategories(c.categoryIds);
    setSelectedGeos(c.geographyCodes);
    setSelectedTags(c.tagNames);
    setSelectedPermissions(c.permissions.map((p) => p.permissionId));
    setJustifications(Object.fromEntries(c.permissions.map((p) => [p.permissionId, p.justification])));
  }, [app.id, classificationQuery.data]);

  const categoriesMutation = useMutation({
    mutationFn: () => setAppCategories(app.id, selectedCategories),
    onSuccess: () => {
      message.success('Đã lưu danh mục');
      queryClient.invalidateQueries({ queryKey: ['app-classification', app.id] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const geoMutation = useMutation({
    mutationFn: () => setAppGeographies(app.id, selectedGeos),
    onSuccess: () => {
      message.success('Đã lưu khu vực phân phối');
      queryClient.invalidateQueries({ queryKey: ['app-classification', app.id] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const tagsMutation = useMutation({
    mutationFn: () => setAppTags(app.id, selectedTags),
    onSuccess: () => {
      message.success('Đã lưu tags');
      queryClient.invalidateQueries({ queryKey: ['app-classification', app.id] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const permissionsMutation = useMutation({
    mutationFn: () => {
      const reqs: PermissionMapRequest[] = selectedPermissions.map((id) => ({
        permissionId: id,
        justification: justifications[id] ?? '',
      }));
      return setAppPermissions(app.id, reqs);
    },
    onSuccess: () => {
      message.success('Đã lưu quyền truy cập');
      queryClient.invalidateQueries({ queryKey: ['app-classification', app.id] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const permissionRows = (permissionsQuery.data ?? []).filter((p) => selectedPermissions.includes(p.id));

  return (
    <div>
      <Card title="Danh mục" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Chọn danh mục ứng dụng"
            loading={categoriesQuery.isLoading}
            value={selectedCategories}
            onChange={setSelectedCategories}
            options={(categoriesQuery.data ?? []).map((c) => ({ label: c.name, value: c.id! }))}
          />
          <Button icon={<SaveOutlined />} loading={categoriesMutation.isPending} onClick={() => categoriesMutation.mutate()}>
            Lưu danh mục
          </Button>
        </Space>
      </Card>

      <Card title="Từ khóa (Tags — SEO)" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Nhập hoặc chọn từ khóa"
            loading={tagsQuery.isLoading}
            value={selectedTags}
            onChange={setSelectedTags}
            options={(tagsQuery.data ?? []).map((t) => ({ label: t.name, value: t.name }))}
          />
          <Button icon={<SaveOutlined />} loading={tagsMutation.isPending} onClick={() => tagsMutation.mutate()}>
            Lưu tags
          </Button>
        </Space>
      </Card>

      <Card title="Khu vực phân phối" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Chọn Tỉnh/Huyện/Xã (bỏ trống = toàn quốc)"
            loading={geographiesQuery.isLoading}
            value={selectedGeos}
            onChange={setSelectedGeos}
            options={(geographiesQuery.data ?? []).map((g) => ({ label: `${g.name} (${g.geoType})`, value: g.code }))}
          />
          <Button icon={<SaveOutlined />} loading={geoMutation.isPending} onClick={() => geoMutation.mutate()}>
            Lưu khu vực
          </Button>
        </Space>
      </Card>

      <Card title="Quyền truy cập thiết bị (Permissions)" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Chọn các quyền ứng dụng cần dùng"
            loading={permissionsQuery.isLoading}
            value={selectedPermissions}
            onChange={setSelectedPermissions}
            options={(permissionsQuery.data ?? []).map((p) => ({
              label: (
                <span>
                  {p.name} {p.isSensitive && <Tag color="red" style={{ marginLeft: 4 }}>Nhạy cảm</Tag>}
                </span>
              ),
              value: p.id,
            }))}
          />
          {permissionRows.length > 0 && (
            <Table
              size="small"
              rowKey="id"
              dataSource={permissionRows}
              pagination={false}
              columns={[
                {
                  title: 'Quyền',
                  dataIndex: 'name',
                  render: (name: string, p) => (
                    <span>{name} {p.isSensitive && <Tag color="red">Nhạy cảm</Tag>}</span>
                  ),
                },
                {
                  title: 'Giải trình (bắt buộc nếu nhạy cảm)',
                  key: 'justification',
                  render: (_, p) => (
                    <Input
                      placeholder="Nhập lý do sử dụng quyền này"
                      value={justifications[p.id] ?? ''}
                      status={p.isSensitive && !justifications[p.id] ? 'error' : undefined}
                      onChange={(e) => setJustifications((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    />
                  ),
                },
              ]}
            />
          )}
          <Text type="secondary" style={{ fontSize: 12 }}>
            Với quyền được đánh dấu "Nhạy cảm" (VD: Danh bạ, SMS), bắt buộc phải điền giải trình lý do sử dụng.
          </Text>
          <Button icon={<SaveOutlined />} loading={permissionsMutation.isPending} onClick={() => permissionsMutation.mutate()}>
            Lưu quyền truy cập
          </Button>
        </Space>
      </Card>
    </div>
  );
}
