import { apiClient } from './client';
import type { AppResponse, AppStatsResponse, PartnerDecisionRequest } from '../types/models';
import type { AppStatus } from '../types/enums';

export async function listAllApps(status?: AppStatus): Promise<AppResponse[]> {
  const { data } = await apiClient.get<AppResponse[]>('/api/apps', {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function listPartnerApps(partnerId: string): Promise<AppResponse[]> {
  const { data } = await apiClient.get<AppResponse[]>(`/api/partners/${partnerId}/apps`);
  return data;
}

export async function getApp(id: string): Promise<AppResponse> {
  const { data } = await apiClient.get<AppResponse>(`/api/apps/${id}`);
  return data;
}

export async function approveApp(id: string): Promise<AppResponse> {
  const { data } = await apiClient.post<AppResponse>(`/api/apps/${id}/approve`);
  return data;
}

export async function rejectApp(id: string, req: PartnerDecisionRequest): Promise<AppResponse> {
  const { data } = await apiClient.post<AppResponse>(`/api/apps/${id}/reject`, req);
  return data;
}

export async function suspendApp(id: string, req: PartnerDecisionRequest): Promise<AppResponse> {
  const { data } = await apiClient.post<AppResponse>(`/api/apps/${id}/suspend`, req);
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
