export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

interface ApiErrorOptions {
  status?: number;
  code?: string;
  details?: unknown;
  fallbackMessage?: string;
}

function createApiError(message: string, options: ApiErrorOptions = {}): ApiError {
  const error = new Error(message) as ApiError;
  error.name = 'ApiError';
  error.status = options.status;
  error.code = options.code;
  error.details = options.details;
  return error;
}

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string' &&
    (error as { name?: unknown }).name === 'ApiError'
  );
};

export async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch (error) {
    throw createApiError('Network request failed', {
      code: 'network_error',
      details: error,
    });
  }

  let rawBody = '';
  try {
    rawBody = response.status === 204 ? '' : await response.text();
  } catch (error) {
    throw createApiError('Failed to read response body', {
      status: response.status,
      code: 'response_read_error',
      details: error,
    });
  }

  let parsedBody: unknown = undefined;
  let parseError: unknown = undefined;

  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (error) {
      parseError = error;
    }
  }

  if (!response.ok) {
    const bodyAsRecord = (parsedBody && typeof parsedBody === 'object') ? (parsedBody as Record<string, unknown>) : undefined;
    const messageFromBody = bodyAsRecord && typeof bodyAsRecord.message === 'string' ? bodyAsRecord.message : undefined;
    const codeFromBody = bodyAsRecord && typeof bodyAsRecord.code === 'string' ? bodyAsRecord.code : undefined;

    throw createApiError(
      messageFromBody ?? `Request failed with status ${response.status}`,
      {
        status: response.status,
        code: codeFromBody ?? `http_${response.status}`,
        details: parsedBody ?? rawBody || undefined,
      }
    );
  }

  if (parseError) {
    throw createApiError('Failed to parse response', {
      status: response.status,
      code: 'invalid_json',
      details: { error: parseError, body: rawBody },
    });
  }

  return parsedBody as T;
}
