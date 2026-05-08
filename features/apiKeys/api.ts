import { ApiKey, CreateApiKeyRequest } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const apiKeysApi = {
  list: async (): Promise<ApiKey[]> => {
    const response = await fetch(`${API_BASE_URL}/api-keys`);

    if (!response.ok) {
      throw new Error("Failed to fetch API keys");
    }

    return response.json();
  },

  create: async (data: CreateApiKeyRequest): Promise<ApiKey> => {
    const response = await fetch(`${API_BASE_URL}/api-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create API key");
    }

    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api-keys/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete API key");
    }
  },
};
