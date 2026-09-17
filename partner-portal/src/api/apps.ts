import { apiClient } from './client';
import type { AppResponse, AppStatsResponse, AppClassificationResponse, CreateAppRequest, UpdateAppRequest, PermissionMapRequest } from '../types/models';

export async function listPartnerApps(partnerId: string): Promise<AppResponse[]> {
  const { data } = await apiClient.get<AppResponse[]>(`/api/partners/${partnerId}/apps`);
  return data;
}

export async function createApp(partnerId: string, req: CreateAppRequest): Promise<AppResponse> {
  const { data } = await apiClient.post<AppResponse>(`/api/partners/${partnerId}/apps`, req);
  return data;
}

export async function getApp(id: string): Promise<AppResponse> {
  const { data } = await apiClient.get<AppResponse>(`/api/apps/${id}`);
  return data;
}

export async function updateApp(id: string, req: UpdateAppRequest): Promise<AppResponse> {
  const { data } = await apiClient.put<AppResponse>(`/api/apps/${id}`, req);
  return data;
}

export async function submitApp(id: string): Promise<AppResponse> {
  const { data } = await apiClient.post<AppResponse>(`/api/apps/${id}/submit`);
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

export async function getAppClassification(id: string): Promise<AppClassificationResponse> {
  const { data } = await apiClient.get<AppClassificationResponse>(`/api/apps/${id}/classification`);
  return data;
}

export async function setAppCategories(id: string, categoryIds: number[]): Promise<void> {
  await apiClient.put(`/api/apps/${id}/categories`, categoryIds);
}

export async function setAppGeographies(id: string, geoCodes: string[]): Promise<void> {
  await apiClient.put(`/api/apps/${id}/geographies`, geoCodes);
}

export async function setAppTags(id: string, tagNames: string[]): Promise<void> {
  await apiClient.put(`/api/apps/${id}/tags`, tagNames);
}

export async function setAppPermissions(id: string, permissions: PermissionMapRequest[]): Promise<void> {
  await apiClient.put(`/api/apps/${id}/permissions`, permissions);
}

export async function uploadAppLogo(id: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<string>(`/api/apps/${id}/logo`, form);
  return data;
}

export async function uploadAppBanner(id: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<string>(`/api/apps/${id}/banner`, form);
  return data;
}

export async function uploadAppScreenshot(id: string, file: File, displayOrder?: number): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  if (displayOrder !== undefined) form.append('displayOrder', String(displayOrder));
  const { data } = await apiClient.post<string>(`/api/apps/${id}/screenshots`, form);
  return data;
}
