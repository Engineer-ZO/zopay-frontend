// Base API URL from environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Storage key for encrypted user data
export const STORAGE_KEY = 'zitopay_auth_data';

// Token expiry times (in seconds)
export const ACCESS_TOKEN_EXPIRY = 1800; // 30 minutes
export const REFRESH_TOKEN_EXPIRY = 604800; // 7 days
