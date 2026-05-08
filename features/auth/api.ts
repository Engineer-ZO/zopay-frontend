import { apiClient } from '@/lib/apiClient';
import { LoginRequest, LoginResponse, Session } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    return response.json();
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
    });
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    return response.json();
  },

  getSession: async (): Promise<Session | null> => {
    const response = await fetch(`${API_BASE_URL}/auth/session`);

    if (!response.ok) {
      return null;
    }

    return response.json();
  },
};

export const updatePreferredLanguage = async (
  payload: { preferredLanguage: string }
): Promise<{ user?: { preferredLanguage?: string } }> => {
  const response = await apiClient.put<{ user?: { preferredLanguage?: string } }>(
    '/merchant/v1/profile',
    payload
  );
  return response.data;
};
