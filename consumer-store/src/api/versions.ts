import { apiClient } from './client';
import type { VersionResponse } from '../types/models';

export async function getPublishedVersion(appId: string): Promise<VersionResponse | null> {
  const { data } = await apiClient.get<VersionResponse | null>(`/api/apps/${appId}/published-version`);
  return data;
}
