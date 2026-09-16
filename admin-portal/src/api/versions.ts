import { apiClient } from './client';
import type { VersionResponse, VersionReviewRequest } from '../types/models';
import type { VersionStatus } from '../types/enums';

export async function listAllVersions(status?: VersionStatus): Promise<VersionResponse[]> {
  const { data } = await apiClient.get<VersionResponse[]>('/api/versions', {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function listVersionsByApp(appId: string): Promise<VersionResponse[]> {
  const { data } = await apiClient.get<VersionResponse[]>(`/api/apps/${appId}/versions`);
  return data;
}

export async function getVersion(id: string): Promise<VersionResponse> {
  const { data } = await apiClient.get<VersionResponse>(`/api/versions/${id}`);
  return data;
}

export async function reviewApproveVersion(id: string, req?: VersionReviewRequest): Promise<VersionResponse> {
  const { data } = await apiClient.post<VersionResponse>(`/api/versions/${id}/review-approve`, req ?? {});
  return data;
}

export async function reviewRejectVersion(id: string, req: VersionReviewRequest): Promise<VersionResponse> {
  const { data } = await apiClient.post<VersionResponse>(`/api/versions/${id}/review-reject`, req);
  return data;
}
