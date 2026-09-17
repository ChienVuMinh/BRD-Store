import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Dropdown, List, Typography, Empty, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { listNotifications, markNotificationRead } from '../api/notifications';
import type { NotificationResponse } from '../types/models';

const { Text } = Typography;

export default function NotificationBell() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => listNotifications(0, 10),
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.content ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function handleClick(n: NotificationResponse) {
    if (!n.isRead) markReadMutation.mutate(n.id);
  }

  const dropdownContent = (
    <div style={{ width: 360, background: '#fff', borderRadius: 8, boxShadow: '0 6px 16px rgba(0,0,0,0.12)', maxHeight: 420, overflowY: 'auto' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>Thông báo</div>
      {notifications.length === 0 ? (
        <Empty description="Chưa có thông báo" style={{ padding: 24 }} />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(n) => (
            <List.Item
              style={{
                padding: '10px 16px',
                cursor: n.isRead ? 'default' : 'pointer',
                background: n.isRead ? undefined : '#e6fffb',
              }}
              onClick={() => handleClick(n)}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <Text strong={!n.isRead} style={{ fontSize: 13 }}>{n.title ?? 'Thông báo'}</Text>
                  {!n.isRead && <Badge status="processing" />}
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>{n.message}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                  {new Date(n.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown popupRender={() => dropdownContent} trigger={['click']} placement="bottomRight">
      <Button type="text" icon={
        <Badge count={unreadCount} size="small">
          <BellOutlined style={{ fontSize: 18 }} />
        </Badge>
      } />
    </Dropdown>
  );
}
