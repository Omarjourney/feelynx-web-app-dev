export interface ApiErrorOptions {
  status: number;
  code?: string;
  info?: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly info?: unknown;

  constructor(message: string, { status, code, info }: ApiErrorOptions) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.info = info;
  }
}

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export async function toApiError(response: Response): Promise<ApiError> {
  let message = response.statusText || FALLBACK_MESSAGE;
  let code: string | undefined;
  let info: unknown;

  try {
    const data = await response.clone().json();
    info = data;

    if (typeof data === 'object' && data !== null) {
      const candidateMessage =
        // common API shapes
        (data as Record<string, unknown>).message ??
        (data as Record<string, unknown>).error ??
        (data as Record<string, unknown>).detail;

      if (typeof candidateMessage === 'string' && candidateMessage.trim().length > 0) {
        message = candidateMessage;
      }

      const candidateCode = (data as Record<string, unknown>).code;
      if (typeof candidateCode === 'string' && candidateCode.trim().length > 0) {
        code = candidateCode;
      }
    }
  } catch {
    try {
      const text = await response.clone().text();
      if (text) {
        message = text;
      }
    } catch {
      // ignore - fall back to status text below
    }
  }

  if (!message) {
    message = `Request failed with status ${response.status}`;
  }

  return new ApiError(message, { status: response.status, code, info });
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getUserMessage(error: unknown): string {
  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  if (isApiError(error)) {
    switch (error.status) {
      case 400:
      case 409:
      case 422:
        return 'Some of the information looks incorrect. Please review and try again.';
      case 401:
        return 'You need to sign in before continuing.';
      case 403:
        return "You don't have permission to do that.";
      case 404:
        return 'We could not find what you were looking for.';
      case 429:
        return 'Too many attempts. Please slow down and try again in a moment.';
      default:
        if (error.status >= 500) {
          return 'Our servers are having trouble right now. Please try again shortly.';
        }
        break;
    }

    if (error.message.trim().length > 0) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return FALLBACK_MESSAGE;
}
