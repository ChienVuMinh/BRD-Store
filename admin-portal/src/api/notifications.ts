import { apiClient } from './client';
import type { NotificationResponse, PageResponse } from '../types/models';

export async function listNotifications(page = 0, size = 20): Promise<PageResponse<NotificationResponse>> {
  const { data } = await apiClient.get<PageResponse<NotificationResponse>>('/api/notifications', {
    params: { page, size },
  });
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.post(`/api/notifications/${id}/read`);
}
