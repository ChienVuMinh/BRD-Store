import { apiClient } from './client';
import type { AuditLogResponse, PageResponse } from '../types/models';

export async function listAuditLogs(page = 0, size = 50): Promise<PageResponse<AuditLogResponse>> {
  const { data } = await apiClient.get<PageResponse<AuditLogResponse>>('/api/audit-logs', {
    params: { page, size },
  });
  return data;
}

export async function listAuditLogsByEntity(
  targetEntity: string,
  targetEntityId: string,
  page = 0,
  size = 50,
): Promise<PageResponse<AuditLogResponse>> {
  const { data } = await apiClient.get<PageResponse<AuditLogResponse>>('/api/audit-logs/by-entity', {
    params: { targetEntity, targetEntityId, page, size },
  });
  return data;
}
