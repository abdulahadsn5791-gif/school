import type { ApiIssue } from '@ecomerece/shared';

/**
 * The unified error type that leaves http-client.
 * Mirrors Hono/DDD AppError structure (code, message, issues)
 * so client components and hooks can branch on error.code.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly issues?: ApiIssue[],
  ) {
    super(message);
    this.name = 'HttpError';
  }

  /** True for validation errors containing field-level issues */
  get isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR' && !!this.issues?.length;
  }

  /** True for network failures where request did not complete */
  get isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }
}
