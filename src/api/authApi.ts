import { CurrentUserResponse, LoginRequest, LoginResponse } from "../types/auth";
import { apiRequest } from "./httpClient";

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(
    "/api/v1/auth/login",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    false
  );
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return apiRequest<CurrentUserResponse>("/api/v1/auth/me");
}
