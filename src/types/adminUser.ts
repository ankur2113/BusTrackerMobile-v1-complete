export type UserRole = "ADMIN" | "COORDINATOR" | "COMMUTER";

export type AdminUser = {
  id: string;
  username: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateUserRequest = {
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: "COORDINATOR" | "COMMUTER";
  password: string;
};

export type UpdateUserRequest = {
  fullName: string;
  email?: string;
  phone?: string;
  active?: boolean;
};
