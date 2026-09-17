import { apiClient } from './client';
import type { ConsumerRegisterRequest, LoginRequest, LoginResponse } from '../types/models';

export async function loginConsumer(req: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/consumer/login', req);
  return data;
}

export async function registerConsumer(req: ConsumerRegisterRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/consumer/register', req);
  return data;
}
