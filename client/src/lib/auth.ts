import { useState, useEffect } from "react";
import { authApi } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  businessType: string;
  businessName: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authApi.getCurrentUser();
      const user = await response.json();
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const user = await response.json();
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    businessType: string;
    businessName: string;
  }) => {
    try {
      const response = await authApi.register(userData);
      const user = await response.json();
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    ...authState,
    login,
    logout,
    register,
  };
}
