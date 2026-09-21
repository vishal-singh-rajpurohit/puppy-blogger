import type { ErrorRequestHandler } from "express";

interface AppError extends Error {
    statusCode?: number;
}

export const globalError: ErrorRequestHandler = (
    err: AppError,
    req,
    resp,
    next
) => {
    const statusCode = err.statusCode ?? 500;
    const message = err.message || "Internal Server Error";

    return resp.status(statusCode).json({
        success: false,
        message,
    });
};