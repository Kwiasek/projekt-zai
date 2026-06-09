export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type FetchOptions = RequestInit & {
  token?: string;
  onTokenUpdate?: (token: string) => void;
};

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { token, onTokenUpdate, ...customConfig } = options;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customConfig.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    credentials: "include", // Important for cookie-based sessions/refresh
    ...customConfig,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Check for token renewal in response headers (e.g. from a filter/interceptor on backend)
  const authHeader = response.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ") && onTokenUpdate) {
    const newToken = authHeader.substring(7);
    onTokenUpdate(newToken);
  }

  if (!response.ok) {
    // If we get a 401 and we have a way to refresh, we could handle it here.
    // For now, let's just make sure we capture the error correctly.
    
    let errorMessage = `Error ${response.status}: ${response.statusText || "An error occurred while fetching data."}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If not JSON, use the message we already constructed
    }
    
    const error = new Error(errorMessage) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

