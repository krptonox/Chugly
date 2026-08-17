import axios from "axios";
import type { ApiErrorResponse } from "./api-types";

export type FieldErrors = Record<string, string>;

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const response = error.response?.data;

    if (response?.message) {
      return response.message;
    }

    if (!error.response) {
      return "Unable to reach the server. Check your connection and try again.";
    }
  }

  return fallback;
};

export const getApiFieldErrors = (error: unknown): FieldErrors => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return {};
  }

  const errors = error.response?.data?.errors;

  if (!Array.isArray(errors)) {
    return {};
  }

  return errors.reduce<FieldErrors>((fieldErrors, item) => {
    if (item && typeof item === "object") {
      for (const [field, value] of Object.entries(item)) {
        if (typeof value === "string" && !fieldErrors[field]) {
          fieldErrors[field] = value;
        }
      }
    }

    return fieldErrors;
  }, {});
};
