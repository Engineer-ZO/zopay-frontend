import { apiClient } from "@/lib/apiClient";
import type { 
  UserPreferences, 
  UpdatePreferredLanguageRequest, 
  UpdatePreferredLanguageResponse 
} from "./types";

/**
 * Get current user preferences including preferredLanguage
 * This is typically called from the /auth/v1/me endpoint
 */
export const getUserPreferences = async (): Promise<UserPreferences> => {
  const response = await apiClient.get<UserPreferences>("/auth/v1/me");
  return response.data;
};

/**
 * Update user's preferred language
 * This should be called whenever the user changes the language in the UI
 */
export const updatePreferredLanguage = async (
  preferredLanguage: 'en' | 'fr'
): Promise<UpdatePreferredLanguageResponse> => {
  const response = await apiClient.put<UpdatePreferredLanguageResponse>(
    "/auth/v1/preferences/language",
    { preferredLanguage }
  );
  return response.data;
};
