import { apiClient } from './client';
import type { InstallRequest, MyInstallResponse } from '../types/models';

export async function installApp(appId: string, req: InstallRequest): Promise<void> {
  await apiClient.post(`/api/apps/${appId}/install`, req);
}

export async function listMyInstalls(): Promise<MyInstallResponse[]> {
  const { data } = await apiClient.get<MyInstallResponse[]>('/api/consumers/me/installs');
  return data;
}
