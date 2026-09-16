import { apiClient } from './client';
import type { PartnerDecisionRequest, PartnerResponse, UserResponse } from '../types/models';
import type { PartnerStatus } from '../types/enums';

export async function listPartners(status?: PartnerStatus): Promise<PartnerResponse[]> {
  const { data } = await apiClient.get<PartnerResponse[]>('/api/partners', {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function getPartner(id: string): Promise<PartnerResponse> {
  const { data } = await apiClient.get<PartnerResponse>(`/api/partners/${id}`);
  return data;
}

export async function approvePartner(id: string): Promise<PartnerResponse> {
  const { data } = await apiClient.post<PartnerResponse>(`/api/partners/${id}/approve`);
  return data;
}

export async function rejectPartner(id: string, req: PartnerDecisionRequest): Promise<PartnerResponse> {
  const { data } = await apiClient.post<PartnerResponse>(`/api/partners/${id}/reject`, req);
  return data;
}

export async function suspendPartner(id: string, req: PartnerDecisionRequest): Promise<PartnerResponse> {
  const { data } = await apiClient.post<PartnerResponse>(`/api/partners/${id}/suspend`, req);
  return data;
}

export async function listPartnerUsers(id: string): Promise<UserResponse[]> {
  const { data } = await apiClient.get<UserResponse[]>(`/api/partners/${id}/users`);
  return data;
}
