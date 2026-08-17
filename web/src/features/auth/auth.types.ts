import type { ApiResponse } from "../../lib/api-types";

export type Avatar = {
  url: string;
  localPath: string;
};

export type User = {
  _id: string;
  username: string;
  email: string;
  fullname?: string;
  avatar?: Avatar;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

export type ResetPasswordPayload = {
  newPassword: string;
};

export type AuthResponse = ApiResponse<User>;
