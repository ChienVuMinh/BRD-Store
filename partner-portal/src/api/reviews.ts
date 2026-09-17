import { apiClient } from './client';
import type { ReviewResponse, DeveloperReplyRequest } from '../types/models';

export async function listAllReviews(appId: string): Promise<ReviewResponse[]> {
  const { data } = await apiClient.get<ReviewResponse[]>(`/api/apps/${appId}/reviews/all`);
  return data;
}

export async function replyToReview(appId: string, reviewId: string, req: DeveloperReplyRequest): Promise<ReviewResponse> {
  const { data } = await apiClient.post<ReviewResponse>(`/api/apps/${appId}/reviews/${reviewId}/reply`, req);
  return data;
}
