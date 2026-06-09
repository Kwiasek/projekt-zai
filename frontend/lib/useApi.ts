import { useAuthStore } from "@/components/auth-store-provider";
import { fetchApi } from "@/lib/fetchApi";
import { useCallback } from "react";

type FetchOptions = RequestInit & {
  token?: string;
  onTokenUpdate?: (token: string) => void;
};

export function useApi() {
  const { accessToken, setAccessToken, clearAuth } = useAuthStore();
  
  const callApi = useCallback(async (endpoint: string, options: FetchOptions = {}) => {
    try {
      return await fetchApi(endpoint, {
        ...options,
        token: accessToken || options.token,
        onTokenUpdate: setAccessToken,
      });
    } catch (error: unknown) {
      // If unauthorized and we have a potential refresh path
      if (error && typeof error === 'object' && 'status' in error && error.status === 401 && !endpoint.includes("/api/refresh") && !endpoint.includes("/api/login")) {
        try {
          // Attempt to refresh the token
          const refreshResponse = await fetchApi("/api/refresh", { 
            method: "POST",
            // fetchApi will include credentials: "include" by default
          });
          
          if (refreshResponse && refreshResponse.accessToken) {
            const newAccessToken = refreshResponse.accessToken;
            setAccessToken(newAccessToken);
            
            // Retry the original request with the new token
            return await fetchApi(endpoint, {
              ...options,
              token: newAccessToken,
              onTokenUpdate: setAccessToken,
            });
          }
        } catch (refreshError) {
          // Refresh failed, user needs to log in again
          console.error("Token refresh failed", refreshError);
          clearAuth();
          throw error; // Throw the original 401 error
        }
      }
      
      throw error;
    }
  }, [accessToken, setAccessToken, clearAuth]);

  return callApi;
}
