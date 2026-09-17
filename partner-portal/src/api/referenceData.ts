import { apiClient } from './client';
import type { AppCategory, AppPermission, ContentRating, Geography, Tag } from '../types/models';

export async function listCategories(): Promise<AppCategory[]> {
  const { data } = await apiClient.get<AppCategory[]>('/api/reference/categories');
  return data;
}

export async function listContentRatings(): Promise<ContentRating[]> {
  const { data } = await apiClient.get<ContentRating[]>('/api/reference/content-ratings');
  return data;
}

export async function listTags(): Promise<Tag[]> {
  const { data } = await apiClient.get<Tag[]>('/api/reference/tags');
  return data;
}

export async function listGeographies(): Promise<Geography[]> {
  const { data } = await apiClient.get<Geography[]>('/api/reference/geographies');
  return data;
}

export async function listPermissions(): Promise<AppPermission[]> {
  const { data } = await apiClient.get<AppPermission[]>('/api/reference/permissions');
  return data;
}
