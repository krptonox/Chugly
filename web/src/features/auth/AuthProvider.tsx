import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "./auth.api";
import type {
  LoginPayload,
  RegisterPayload,
  User,
} from "./auth.types";

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated";

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => ReturnType<
    typeof authApi.register
  >;
  logout: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
};

export const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refreshSession = useCallback(async () => {
    try {
      const response = await authApi.currentUser();
      setUser(response.data.data);
      setStatus("authenticated");
      return response.data.data;
    } catch {
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    setUser(response.data.data);
    setStatus("authenticated");
    return response.data.data;
  }, []);

  const register = useCallback(
    (payload: RegisterPayload) => authApi.register(payload),
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      login,
      register,
      logout,
      refreshSession,
    }),
    [user, status, login, register, logout, refreshSession]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
