export const ROLES = {
  USER: 'user',
  SELLER: 'seller',
  ADMIN: 'admin',
} as const;

export const CATEGORIES = [
  { value: 'ott', label: 'OTT Platforms' },
  { value: 'ai-tools', label: 'AI & Productivity' },
  { value: 'vpn', label: 'VPN & Security' },
  { value: 'education', label: 'Education & Learning' },
  { value: 'cloud-storage', label: 'Cloud & Storage' },
  { value: 'music', label: 'Music & Audio' },
  { value: 'software', label: 'Software & Tools' },
  { value: 'other', label: 'Other' },
] as const;

export const PAYMENT_METHODS = {
  UPI: 'upi',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const ORDER_STATUS = {
  PLACED: 'placed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
} as const;
