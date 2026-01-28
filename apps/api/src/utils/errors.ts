export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function notFound(message = "Resource not found"): AppError {
  return new AppError(message, 404, "NOT_FOUND");
}

export function unauthorized(message = "Unauthorized"): AppError {
  return new AppError(message, 401, "UNAUTHORIZED");
}

export function forbidden(message = "Forbidden"): AppError {
  return new AppError(message, 403, "FORBIDDEN");
}

export function badRequest(message = "Bad request", details?: unknown): AppError {
  return new AppError(message, 400, "BAD_REQUEST", details);
}

export function conflict(message = "Conflict"): AppError {
  return new AppError(message, 409, "CONFLICT");
}
