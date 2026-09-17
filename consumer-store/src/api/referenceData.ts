import { apiClient } from './client';
import type { AppCategory } from '../types/models';

export async function listCategories(): Promise<AppCategory[]> {
  const { data } = await apiClient.get<AppCategory[]>('/api/reference/categories');
  return data;
}
