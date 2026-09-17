import { Tag } from 'antd';

const COLOR_MAP: Record<string, string> = {
  PENDING: 'gold',
  PENDING_APPROVAL: 'gold',
  DRAFT: 'default',
  SUBMIT: 'blue',
  IN_REVIEW: 'processing',
  APPROVED: 'green',
  PUBLISHED: 'green',
  ACTIVE: 'green',
  REJECTED: 'red',
  SUSPENDED: 'volcano',
  INACTIVE: 'default',
  ARCHIVED: 'default',
};

export default function StatusTag({ status }: { status: string }) {
  return <Tag color={COLOR_MAP[status] ?? 'default'}>{status}</Tag>;
}
