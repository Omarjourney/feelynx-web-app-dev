export interface ApiError {
  status?: number;
  code?: string;
  message?: string;
  errors?: Record<string, unknown> | string[] | string;
  cause?: unknown;
}

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_ERROR_MESSAGE =
  "We couldn't reach the server. Check your internet connection and try again.";

const STATUS_MESSAGES: Record<number, string> = {
  401: 'Please sign in to continue.',
  403: "You don't have permission to perform this action.",
  404: "We couldn't find what you were looking for.",
  422: 'Some of the information provided looks incorrect. Please review and try again.',
  500: 'Something went wrong on our side. Please try again in a moment.',
};

const CODE_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'The credentials you entered are incorrect.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before continuing.',
  RATE_LIMITED: 'You are performing actions too quickly. Please wait and try again.',
  ACCESS_DENIED: "You don't have permission to perform this action.",
  NOT_FOUND: "We couldn't find what you were looking for.",
  VALIDATION_FAILED: 'Some of the information provided looks incorrect. Please review and try again.',
};

const NETWORK_ERROR_HINTS = [
  'Failed to fetch',
  'NetworkError',
  'Network request failed',
  'The network connection was lost',
  'Load failed',
];

const TECHNICAL_MESSAGE_PATTERNS = [
  /^failed to/i,
  /^typeerror/i,
  /unexpected token/i,
  /json/i,
];

function normalizeCode(code?: string): string | undefined {
  if (!code) return undefined;
  return code
    .trim()
    .toUpperCase()
    .replace(/[-\s]+/g, '_');
}

function isApiError(error: unknown): error is ApiError {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as Record<string, unknown>;
  return (
    'status' in candidate ||
    'code' in candidate ||
    'message' in candidate ||
    'errors' in candidate
  );
}

function extractValidationMessage(errors: ApiError['errors']): string | null {
  if (!errors) return null;
  if (typeof errors === 'string') return errors;
  if (Array.isArray(errors)) {
    const first = errors.find((value) => Boolean(value));
    return first ? String(first) : null;
  }
  if (typeof errors === 'object') {
    for (const value of Object.values(errors)) {
      if (!value) continue;
      if (Array.isArray(value)) {
        const first = value.find((item) => Boolean(item));
        if (first) return String(first);
      } else if (typeof value === 'string') {
        if (value.trim()) return value;
      }
    }
  }
  return null;
}

function isLikelyNetworkError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true;
  }

  let message: string | undefined;
  if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String((error as { message?: unknown }).message ?? '');
  }

  if (!message) return false;

  return NETWORK_ERROR_HINTS.some((hint) => message?.toLowerCase().includes(hint.toLowerCase()));
}

function isSafeMessage(message: string): boolean {
  return !TECHNICAL_MESSAGE_PATTERNS.some((pattern) => pattern.test(message));
}

export async function toApiError(
  response: Response,
  fallbackMessage?: string,
): Promise<ApiError> {
  const error: ApiError = { status: response.status };
  const contentType = response.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const body = await response.json();
      if (body && typeof body === 'object') {
        const record = body as Record<string, unknown>;
        if (typeof record.message === 'string') {
          error.message = record.message;
        } else if (typeof record.error === 'string') {
          error.message = record.error;
        }
        if (typeof record.code === 'string') {
          error.code = record.code;
        } else if (typeof record.errorCode === 'string') {
          error.code = record.errorCode;
        } else if (typeof record.error_code === 'string') {
          error.code = record.error_code;
        }
        if (record.errors) {
          error.errors = record.errors as ApiError['errors'];
        } else if (record.details) {
          error.errors = record.details as ApiError['errors'];
        }
      }
    } else {
      const text = await response.text();
      if (text) {
        error.message = text;
      }
    }
  } catch (err) {
    error.cause = err;
  }

  if (!error.message && fallbackMessage) {
    error.message = fallbackMessage;
  }

  return error;
}

export function createClientError(
  message: string,
  overrides: Partial<ApiError> = {},
): ApiError {
  return {
    message,
    ...overrides,
  };
}

export function getUserMessage(
  error: ApiError | unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
): string {
  if (isLikelyNetworkError(error)) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (isApiError(error)) {
    const normalizedCode = normalizeCode(error.code);
    if (normalizedCode && CODE_MESSAGES[normalizedCode]) {
      return CODE_MESSAGES[normalizedCode];
    }

    if (typeof error.status === 'number') {
      if (error.status >= 500) {
        return STATUS_MESSAGES[500];
      }

      const statusMessage = STATUS_MESSAGES[error.status];
      if (statusMessage) {
        if (error.status === 422) {
          const validationMessage = extractValidationMessage(error.errors);
          if (validationMessage) {
            return validationMessage;
          }
        }
        return statusMessage;
      }

      if (error.status === 422) {
        const validationMessage = extractValidationMessage(error.errors);
        if (validationMessage) {
          return validationMessage;
        }
      }
    }

    if (error.message && error.message.trim()) {
      const trimmed = error.message.trim();
      if (isSafeMessage(trimmed)) {
        return trimmed;
      }
    }
  }

  if (error instanceof Response) {
    return getUserMessage({ status: error.status }, fallbackMessage);
  }

  if (error instanceof Error) {
    const trimmed = error.message?.trim();
    if (trimmed && isSafeMessage(trimmed)) {
      return trimmed;
    }
  }

  if (typeof error === 'string' && error.trim() && isSafeMessage(error)) {
    return error;
  }

  return fallbackMessage;
}

export { DEFAULT_ERROR_MESSAGE };
