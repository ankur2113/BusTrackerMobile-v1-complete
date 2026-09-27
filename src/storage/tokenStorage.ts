import * as SecureStore from "expo-secure-store";
import { AuthenticatedUser } from "../types/auth";

export const ACCESS_TOKEN_KEY = "bus_tracker_access_token";
export const USER_KEY = "bus_tracker_user";

export async function saveAuthSession(
  accessToken: string,
  user: AuthenticatedUser
): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getStoredUser(): Promise<AuthenticatedUser | null> {
  const value = await SecureStore.getItemAsync(USER_KEY);

  if (!value) {
    return null;
  }

  return JSON.parse(value) as AuthenticatedUser;
}

export async function clearAuthSession(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}