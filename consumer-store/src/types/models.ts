import type { AppPriceType, AppStatus, OsPlatform, VersionStatus } from './enums';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  principalType: string;
  id: string;
  username: string;
  roles: string[];
  partnerId: string | null;
}

export interface ConsumerRegisterRequest {
  accountId: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  password: string;
}

export interface AppResponse {
  id: string;
  partnerId: string;
  osPlatform: OsPlatform;
  packageName: string;
  name: string;
  shortDesc: string | null;
  fullDesc: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  contentRatingId: number | null;
  supportEmail: string | null;
  supportPhone: string | null;
  websiteUrl: string | null;
  privacyPolicyUrl: string | null;
  priceType: AppPriceType | null;
  priceVnd: number | null;
  appSignatureHash: string | null;
  isGlobalAccess: boolean | null;
  status: AppStatus;
  createdAt: string;
}

export interface AppStatsResponse {
  appId: string;
  totalDownloads: number | null;
  averageRating: number | null;
  totalReviews: number | null;
  updatedAt: string;
}

export interface VersionResponse {
  id: string;
  appId: string;
  versionName: string;
  buildNumber: number | null;
  fileUrl: string | null;
  fileSizeBytes: number | null;
  fileHashSha256: string | null;
  minSdkVersion: string | null;
  targetSdkVersion: string | null;
  supportedArchitectures: string | null;
  releaseNotes: string | null;
  status: VersionStatus;
  createdAt: string;
}

export interface ReviewResponse {
  id: string;
  appId: string;
  consumerId: string;
  rating: number;
  comment: string | null;
  developerReply: string | null;
  isHidden: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string | null;
}

export interface InstallRequest {
  versionId: string;
  deviceId?: string | null;
}

export interface AppCategory {
  id: number | null;
  name: string;
  description: string | null;
  iconUrl: string | null;
}

export interface MyInstallResponse {
  appId: string;
  appName: string;
  logoUrl: string | null;
  versionName: string | null;
  installedAt: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details: string[];
}
