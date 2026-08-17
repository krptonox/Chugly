import type { FieldErrors } from "../../lib/api-errors";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateLogin = (
  email: string,
  password: string
): FieldErrors => {
  const errors: FieldErrors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
};

export const validateRegister = (
  email: string,
  username: string,
  password: string
): FieldErrors => {
  const errors = validateLogin(email, password);

  if (!username.trim()) {
    errors.username = "Username is required.";
  } else if (username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters.";
  } else if (username !== username.toLowerCase()) {
    errors.username = "Username must use lowercase letters.";
  }

  if (password && password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
};

export const validateEmail = (email: string): FieldErrors => {
  const errors: FieldErrors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
};

export const validateNewPassword = (
  password: string,
  fieldName = "newPassword"
): FieldErrors => {
  const errors: FieldErrors = {};

  if (!password) {
    errors[fieldName] = "Password is required.";
  } else if (password.length < 8) {
    errors[fieldName] = "Password must be at least 8 characters.";
  }

  return errors;
};

export const validateChangePassword = (
  oldPassword: string,
  newPassword: string
): FieldErrors => {
  const errors: FieldErrors = {};

  if (!oldPassword) {
    errors.oldPassword = "Current password is required.";
  }

  Object.assign(errors, validateNewPassword(newPassword));
  return errors;
};
