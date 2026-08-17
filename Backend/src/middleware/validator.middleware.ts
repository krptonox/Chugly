import { validationResult, type ValidationError, type FieldValidationError } from "express-validator";
import type { RequestHandler } from "express";
import { ApiError } from "../utils/api-error.js";
// ...existing code...

const isFieldError = (err: ValidationError): err is FieldValidationError => err.type === "field";

export const validate: RequestHandler = (req, _res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    next();
    return;
  }

  const extractedErrors = errors.array().map((err) =>
    isFieldError(err) ? { [err.path]: err.msg } : { _error: err.msg }
  );

  throw new ApiError(422, "Received data is not valid", extractedErrors);
};