import { apiClient } from './client';
import type { CreateReviewRequest, ReviewResponse } from '../types/models';

export async function listVisibleReviews(appId: string): Promise<ReviewResponse[]> {
  const { data } = await apiClient.get<ReviewResponse[]>(`/api/apps/${appId}/reviews`);
  return data;
}

export async function addReview(appId: string, req: CreateReviewRequest): Promise<ReviewResponse> {
  const { data } = await apiClient.post<ReviewResponse>(`/api/apps/${appId}/reviews`, req);
  return data;
}

export async function updateReview(appId: string, reviewId: string, req: CreateReviewRequest): Promise<ReviewResponse> {
  const { data } = await apiClient.put<ReviewResponse>(`/api/apps/${appId}/reviews/${reviewId}`, req);
  return data;
}
