import { apiClient } from './client';
import type { LoginRequest, LoginResponse } from '../types/models';

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/login', req);
  return data;
}
