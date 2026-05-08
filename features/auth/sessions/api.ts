import { apiClient } from "@/lib/apiClient";
import type { GetSessionsResponse, ForceLogoutResponse } from "./types";

/**
 * Retrieve all active sessions for the current user.
 * Works for both merchant and admin users.
 */
export const getActiveSessions = async (): Promise<GetSessionsResponse> => {
  const response = await apiClient.get<GetSessionsResponse>("/auth/v1/sessions");
  return response.data;
};

/**
 * Terminate all active sessions for the current user, including the current session.
 * Works for both merchant and admin users.
 * After successful call, frontend should redirect to login page.
 */
export const forceLogoutAllSessions = async (): Promise<ForceLogoutResponse> => {
  const response = await apiClient.post<ForceLogoutResponse>("/auth/v1/force-logout");
  return response.data;
};
