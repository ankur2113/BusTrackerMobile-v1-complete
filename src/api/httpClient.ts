import * as SecureStore from "expo-secure-store";

import { API_BASE_URL } from "../config/api";
import { getAccessToken } from "../storage/tokenStorage";

type ApiErrorResponse = {
  message?: string;
  error?: string;
  path?: string;
  status?: number;
  timestamp?: string;
};

function cacheKey(url: string) {
  return `bus_tracker_cache_${url.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  useAuth: boolean = true,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const method = options.method || "GET";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (useAuth) {
    const token = await getAccessToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  console.log("API Request:", method, url);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const errorBody = (await response.json()) as ApiErrorResponse;
        console.log("API Error Body:", errorBody);
        errorMessage =
          errorBody.message ||
          errorBody.error ||
          `Request failed with status ${response.status}`;
      } catch {
        console.log("Unable to parse API error response");
      }

      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();

    if (!text) {
      return undefined as T;
    }

    if (method === "GET") {
      await SecureStore.setItemAsync(cacheKey(url), text);
    }

    return JSON.parse(text) as T;
  } catch (error) {
    if (method === "GET") {
      const cached = await SecureStore.getItemAsync(cacheKey(url));

      if (cached) {
        console.log("Using offline cached response for", url);
        return JSON.parse(cached) as T;
      }
    }

    throw error;
  }
}
