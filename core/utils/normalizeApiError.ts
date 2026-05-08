import { ApiError, ValidationError } from "../http/errors";

export function normalizeApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}

export function getApiErrorDetails(error: unknown): {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
} {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      errors:
        error instanceof ValidationError
          ? error.errors
          : undefined,
    };
  }

  return {
    message: normalizeApiError(error),
  };
}
