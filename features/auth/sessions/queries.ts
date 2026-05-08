import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getActiveSessions, forceLogoutAllSessions } from "./api";

export const useActiveSessions = () => {
  return useQuery({
    queryKey: ["sessions", "active"],
    queryFn: getActiveSessions,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

export const useForceLogoutAll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: forceLogoutAllSessions,
    onSuccess: (data) => {
      toast.success(data.message || "All sessions terminated successfully");
      // Clear all React Query cache
      queryClient.clear();
      // Redirect to login page after a brief delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    },
    onError: (error) => {
      toast.error("Failed to logout from all devices", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
};
