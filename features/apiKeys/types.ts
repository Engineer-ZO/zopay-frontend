export interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  lastUsedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface CreateApiKeyRequest {
  name: string;
  expiresInDays?: number;
}
