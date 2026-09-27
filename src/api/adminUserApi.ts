import { AdminUser, CreateUserRequest, UpdateUserRequest } from "../types/adminUser";
import { apiRequest } from "./httpClient";

export async function getUsers(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>("/api/v1/admin/users");
}

export async function getUserById(userId: string): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/api/v1/admin/users/${userId}`);
}

export async function createUser(
  request: CreateUserRequest
): Promise<AdminUser> {
  return apiRequest<AdminUser>("/api/v1/admin/users", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateUser(
  userId: string,
  request: UpdateUserRequest
): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/api/v1/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export async function deleteUser(userId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/admin/users/${userId}`, {
    method: "DELETE",
  });
}
