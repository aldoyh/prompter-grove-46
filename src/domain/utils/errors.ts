/**
 * Custom Error Classes for Domain Layer
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DatabaseError extends AppError {
  public readonly originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message, 'DATABASE_ERROR', 500, true);
    this.originalError = originalError;
  }
}

export class AuthError extends AppError {
  constructor(message: string, _originalError?: unknown) {
    super(message, 'AUTH_ERROR', 401, true);
  }
}

export class ValidationError extends AppError {
  public readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message, 'VALIDATION_ERROR', 400, true);
    this.fields = fields;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404, true);
  }
}

export class PermissionError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 'PERMISSION_DENIED', 403, true);
  }
}