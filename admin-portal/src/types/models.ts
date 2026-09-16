import type {
  AppPriceType,
  AppStatus,
  GeoType,
  NotificationType,
  OsPlatform,
  PartnerStatus,
  PartnerType,
  UserStatus,
  VersionStatus,
} from './enums';

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
}

export interface PartnerResponse {
  id: string;
  partnerCode: string;
  partnerType: PartnerType;
  name: string;
  taxId: string | null;
  legalRepName: string;
  legalRepPhone: string | null;
  email: string;
  status: PartnerStatus;
  createdAt: string;
}

export interface PartnerDecisionRequest {
  reason?: string | null;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  partnerId: string | null;
  status: UserStatus;
  roles: string[];
  createdAt: string;
}

export interface CreatePartnerUserRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roleCodes: string[];
}

export interface CreateSystemUserRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roleCodes: string[];
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

export interface VersionReviewRequest {
  rejectionReason?: string | null;
  reviewNotes?: string | null;
}

export interface AuditLogResponse {
  id: number;
  userId: string | null;
  action: string;
  targetEntity: string;
  targetEntityId: string;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface AppCategory {
  id: number | null;
  name: string;
  description: string | null;
  iconUrl: string | null;
}

export interface ContentRating {
  id: number;
  code: string;
  description: string | null;
}

export interface Tag {
  id: number;
  name: string;
  searchCount: number;
}

export interface Geography {
  code: string;
  name: string;
  geoType: GeoType;
  parent: Geography | null;
  createdAt: string;
}

export interface AppPermission {
  id: number;
  code: string;
  name: string;
  description: string | null;
  parent: AppPermission | null;
  isSensitive: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string | null;
  message: string;
  isRead: boolean | null;
  createdAt: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details: string[];
}
