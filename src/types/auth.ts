export type UserRole = "ADMIN" | "COORDINATOR" | "COMMUTER";

export interface AuthenticatedUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthenticatedUser;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CurrentUserResponse {
  userId: string;
  username: string;
  fullName: string;
  roles: string[];
}
