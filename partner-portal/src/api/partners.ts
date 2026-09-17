import { apiClient } from './client';
import type { ApiKeyResponse, ApiKeySummaryResponse, CreatePartnerUserRequest, PartnerResponse, UserResponse } from '../types/models';

export async function getPartner(id: string): Promise<PartnerResponse> {
  const { data } = await apiClient.get<PartnerResponse>(`/api/partners/${id}`);
  return data;
}

export async function listPartnerUsers(partnerId: string): Promise<UserResponse[]> {
  const { data } = await apiClient.get<UserResponse[]>(`/api/partners/${partnerId}/users`);
  return data;
}

export async function createPartnerUser(partnerId: string, req: CreatePartnerUserRequest): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>(`/api/partners/${partnerId}/users`, req);
  return data;
}

export async function listApiKeys(partnerId: string): Promise<ApiKeySummaryResponse[]> {
  const { data } = await apiClient.get<ApiKeySummaryResponse[]>(`/api/partners/${partnerId}/api-keys`);
  return data;
}

export async function createApiKey(partnerId: string, keyName: string): Promise<ApiKeyResponse> {
  const { data } = await apiClient.post<ApiKeyResponse>(`/api/partners/${partnerId}/api-keys`, null, {
    params: { keyName },
  });
  return data;
}

export async function deleteApiKey(partnerId: string, keyId: string): Promise<void> {
  await apiClient.delete(`/api/partners/${partnerId}/api-keys/${keyId}`);
}
