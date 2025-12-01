/**
 * Custom error class for WordPress REST API errors
 */
export class WPApiError extends Error {
  /**
   * HTTP status code
   */
  public readonly status: number;

  /**
   * WordPress error code (e.g., 'rest_post_invalid_id')
   */
  public readonly code?: string;

  /**
   * Original response from the API
   */
  public readonly response?: Response;

  /**
   * Additional data from the WordPress error response
   */
  public readonly data?: {
    status?: number;
    params?: Record<string, unknown>;
    details?: Record<string, unknown>;
  };

  constructor(
    message: string,
    status: number,
    options?: {
      code?: string;
      response?: Response;
      data?: WPApiError["data"];
    }
  ) {
    super(message);
    this.name = "WPApiError";
    this.status = status;
    this.code = options?.code;
    this.response = options?.response;
    this.data = options?.data;

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WPApiError);
    }
  }

  /**
   * Check if error is a client error (4xx)
   */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Check if error is an authentication error
   */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if error is a not found error
   */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Check if error is a rate limit error
   */
  get isRateLimitError(): boolean {
    return this.status === 429;
  }

  /**
   * Get a user-friendly error message
   */
  get userMessage(): string {
    switch (this.status) {
      case 400:
        return "Invalid request. Please check your parameters.";
      case 401:
        return "Authentication required. Please check your credentials.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Internal server error. Please try again later.";
      case 502:
        return "Bad gateway. The server is temporarily unavailable.";
      case 503:
        return "Service unavailable. Please try again later.";
      default:
        return this.message;
    }
  }

  /**
   * Create WPApiError from Response object
   */
  static async fromResponse(response: Response): Promise<WPApiError> {
    let errorData: {
      code?: string;
      message?: string;
      data?: WPApiError["data"];
    } = {};

    try {
      // Try to parse WordPress error response
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        errorData = await response.json();
      }
    } catch {
      // If parsing fails, use generic error
    }

    const message = errorData.message || response.statusText || "Unknown error";

    return new WPApiError(message, response.status, {
      code: errorData.code,
      response,
      data: errorData.data,
    });
  }

  /**
   * Convert error to JSON for logging/debugging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      data: this.data,
      isClientError: this.isClientError,
      isServerError: this.isServerError,
      isAuthError: this.isAuthError,
      userMessage: this.userMessage,
    };
  }
}

/**
 * Helper function to handle API errors consistently
 */
export async function handleApiError(response: Response): Promise<never> {
  const error = await WPApiError.fromResponse(response);
  throw error;
}
