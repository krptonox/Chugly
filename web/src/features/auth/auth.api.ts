import { apiClient } from "../../lib/api-client";
import type { ApiResponse } from "../../lib/api-types";
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
} from "./auth.types";

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<User>>(
      "/auth/register",
      payload
    ),

  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/auth/login", payload),

  logout: () => apiClient.post<ApiResponse<{}>>("/auth/logout"),

  refreshAccessToken: () =>
    apiClient.post<ApiResponse<{}>>(
      "/auth/refresh-access-token"
    ),

  currentUser: () =>
    apiClient.post<AuthResponse>("/auth/current-user"),

  verifyEmail: (verificationToken: string) =>
    apiClient.post<ApiResponse<{}>>(
      `/auth/verify-email/${encodeURIComponent(verificationToken)}`
    ),

  resendEmailVerification: () =>
    apiClient.post<ApiResponse<{}>>(
      "/auth/resend-email-verification"
    ),

  changeCurrentPassword: (
    payload: ChangePasswordPayload
  ) =>
    apiClient.post<ApiResponse<{}>>(
      "/auth/change-current-password",
      payload
    ),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<{}>>(
      "/auth/forgot-password",
      { email }
    ),

  resetPassword: (
    resetToken: string,
    payload: ResetPasswordPayload
  ) =>
    apiClient.post<ApiResponse<{}>>(
      `/auth/reset-forgot-password/${encodeURIComponent(resetToken)}`,
      payload
    ),
};
