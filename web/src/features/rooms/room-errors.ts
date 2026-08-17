import axios from "axios";
import {
  getApiErrorMessage,
  type FieldErrors,
} from "../../lib/api-errors";

export const isUnauthorizedRoomError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 401;

export const getRoomErrorMessage = (
  error: unknown,
  fallback = "We could not complete that room action."
) => getApiErrorMessage(error, fallback);

export const getRoomFieldErrors = (error: unknown): FieldErrors => {
  if (!axios.isAxiosError(error)) {
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
