import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { List, Typography, Empty, Skeleton } from 'antd';
import { listMyInstalls } from '../../api/installs';
import { resolveAssetUrl } from '../../api/client';

const { Title, Text } = Typography;

export default function MyAppsPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['my-installs'],
    queryFn: listMyInstalls,
  });

  return (
    <div>
      <Title level={3}>Ứng dụng đã cài</Title>
      {isLoading ? (
        <Skeleton active />
      ) : !data || data.length === 0 ? (
        <Empty description="Bạn chưa tải ứng dụng nào" />
      ) : (
        <List
          dataSource={data}
          renderItem={(item) => (
            <List.Item style={{ cursor: 'pointer' }} onClick={() => navigate(`/apps/${item.appId}`)}>
              <List.Item.Meta
                avatar={
                  item.logoUrl ? (
                    <img src={resolveAssetUrl(item.logoUrl)} alt={item.appName} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f0f0f0' }} />
                  )
                }
                title={item.appName}
                description={
                  <span>
                    {item.versionName && <>Phiên bản {item.versionName} · </>}
                    Đã tải: {new Date(item.installedAt).toLocaleString('vi-VN')}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
      <Text type="secondary" style={{ fontSize: 12 }}>
        Đây là lịch sử tải xuống của bạn — bản demo web không hỗ trợ cài đặt thực tế lên thiết bị.
      </Text>
    </div>
  );
}
