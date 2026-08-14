import { z } from "zod";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return { success: true, data };
}

export function errorResponse(
  message: string,
  code?: string,
  details?: unknown,
): ApiErrorResponse {
  return {
    success: false,
    error: { message, code, details },
  };
}

export function handleApiError(error: unknown): ApiErrorResponse {
  if (error instanceof ApiError) {
    return errorResponse(error.message, error.code);
  }

  if (error instanceof z.ZodError) {
    return errorResponse("Validation failed", "VALIDATION_ERROR", error.flatten());
  }

  console.error("[API Error]", error);
  return errorResponse("An unexpected error occurred", "INTERNAL_ERROR");
}
