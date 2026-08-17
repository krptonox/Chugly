import type { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/api-error.js";

const errorHandler: ErrorRequestHandler = (
    error,
    _req,
    res,
    next
) => {
    if (res.headersSent) {
        next(error);
        return;
    }

    if (error instanceof ApiError) {
        res.status(error.statusCode).json({
            statusCode: error.statusCode,
            data: error.data,
            message: error.message,
            success: false,
            errors: error.errors,
        });
        return;
    }

    console.error(error);

    res.status(500).json({
        statusCode: 500,
        data: null,
        message: "Internal server error",
        success: false,
        errors: [],
    });
};

export { errorHandler };
