import { httpClient } from "./client";

// Token injection interceptor
export function setupAuthInterceptor() {
  // Interceptor logic will be implemented here
  // This would typically wrap the httpClient methods
}

// 401 handling interceptor
export function setupUnauthorizedInterceptor() {
  // Handle 401 responses and trigger refresh or redirect to login
  if (typeof window !== "undefined") {
    // Redirect logic would go here
  }
}
