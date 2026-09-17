import { apiClient } from './client';
import type { AppResponse, AppStatsResponse } from '../types/models';

export async function listPublishedApps(): Promise<AppResponse[]> {
  const { data } = await apiClient.get<AppResponse[]>('/api/public/apps');
  return data;
}

export async function getApp(id: string): Promise<AppResponse> {
  const { data } = await apiClient.get<AppResponse>(`/api/apps/${id}`);
  return data;
}

export async function getAppStats(appId: string): Promise<AppStatsResponse | null> {
  try {
    const { data } = await apiClient.get<AppStatsResponse>(`/api/apps/${appId}/stats`);
    return data;
  } catch {
    return null;
  }
}
