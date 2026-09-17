import { apiClient } from './client';
import type { VersionResponse } from '../types/models';

export interface CreateVersionFormValues {
  versionName: string;
  minSdkVersion?: string;
  targetSdkVersion?: string;
  supportedArchitectures?: string;
  releaseNotes?: string;
  file?: File;
}

export async function listVersionsByApp(appId: string): Promise<VersionResponse[]> {
  const { data } = await apiClient.get<VersionResponse[]>(`/api/apps/${appId}/versions`);
  return data;
}

export async function getVersion(id: string): Promise<VersionResponse> {
  const { data } = await apiClient.get<VersionResponse>(`/api/versions/${id}`);
  return data;
}

export async function createVersion(appId: string, values: CreateVersionFormValues): Promise<VersionResponse> {
  const form = new FormData();
  form.append('versionName', values.versionName);
  if (values.minSdkVersion) form.append('minSdkVersion', values.minSdkVersion);
  if (values.targetSdkVersion) form.append('targetSdkVersion', values.targetSdkVersion);
  if (values.supportedArchitectures) form.append('supportedArchitectures', values.supportedArchitectures);
  if (values.releaseNotes) form.append('releaseNotes', values.releaseNotes);
  if (values.file) form.append('file', values.file);
  const { data } = await apiClient.post<VersionResponse>(`/api/apps/${appId}/versions`, form);
  return data;
}

export async function replaceVersionBuild(id: string, file: File): Promise<VersionResponse> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<VersionResponse>(`/api/versions/${id}/build`, form);
  return data;
}

export async function submitVersion(id: string): Promise<VersionResponse> {
  const { data } = await apiClient.post<VersionResponse>(`/api/versions/${id}/submit`);
  return data;
}

export async function sendVersionToReview(id: string): Promise<VersionResponse> {
  const { data } = await apiClient.post<VersionResponse>(`/api/versions/${id}/send-to-review`);
  return data;
}

export async function publishVersion(id: string): Promise<VersionResponse> {
  const { data } = await apiClient.post<VersionResponse>(`/api/versions/${id}/publish`);
  return data;
}
