import { apiClient } from './client';
import type { CreateSystemUserRequest, UserResponse } from '../types/models';
import type { UserStatus } from '../types/enums';

export async function listSystemUsers(): Promise<UserResponse[]> {
  const { data } = await apiClient.get<UserResponse[]>('/api/system/users');
  return data;
}

export async function createSystemUser(req: CreateSystemUserRequest): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>('/api/system/users', req);
  return data;
}

export async function setSystemUserStatus(id: string, status: UserStatus): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>(`/api/system/users/${id}/status`, null, {
    params: { status },
  });
  return data;
}
