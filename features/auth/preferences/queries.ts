import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserPreferences, updatePreferredLanguage } from "./api";
import type { UserPreferences, PreferredLanguage } from "./types";

export const useUserPreferences = () => {
  return useQuery({
    queryKey: ["user", "preferences"],
    queryFn: getUserPreferences,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
};

export const useUpdatePreferredLanguage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (preferredLanguage: PreferredLanguage) => 
      updatePreferredLanguage(preferredLanguage),
    onSuccess: (data) => {
      toast.success(data.message || "Language preference updated successfully");
      // Update the user preferences cache
      queryClient.setQueryData(["user", "preferences"], (old: UserPreferences | undefined) => 
        old ? { ...old, preferredLanguage: data.user.preferredLanguage } : undefined
      );
    },
    onError: (error) => {
      toast.error("Failed to update language preference", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
};
