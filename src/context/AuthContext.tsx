import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { login as apiLogin } from "../api/authApi";
import {
  clearAuthSession,
  getStoredUser,
  saveAuthSession,
} from "../storage/tokenStorage";
import { AuthenticatedUser, LoginRequest } from "../types/auth";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const storedUser = await getStoredUser();
      setUser(storedUser);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(request: LoginRequest) {
    const response = await apiLogin(request);
    await saveAuthSession(response.accessToken, response.user);
    setUser(response.user);
  }

  async function logout() {
    await clearAuthSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
