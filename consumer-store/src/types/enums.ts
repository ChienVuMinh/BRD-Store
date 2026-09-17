export type PartnerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type PartnerType = 'INDIVIDUAL' | 'ENTERPRISE';

export type AppStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type AppPriceType = 'FREE' | 'PAID';
export type OsPlatform = 'ANDROID' | 'IOS' | 'HARMONYOS' | 'MULTI_PLATFORM';

export type VersionStatus =
  | 'DRAFT'
  | 'SUBMIT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type GeoType = 'PROVINCE' | 'DISTRICT' | 'WARD';

export type NotificationType =
  | 'APP_STATUS_CHANGE'
  | 'VERSION_STATUS_CHANGE'
  | 'PARTNER_STATUS_CHANGE'
  | 'NEW_REVIEW'
  | 'DEVELOPER_REPLY'
  | 'GENERAL';

export const ADMIN_ROLES = [
  'S_ADMIN',
  'O_ADMIN',
  'O_PARTNER_MANAGER',
  'O_REVIEWER',
  'O_REPORT',
  'O_FINANCE',
  'O_SUPPORT',
] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];
