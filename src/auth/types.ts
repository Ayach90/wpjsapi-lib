/**
 * Available authentication methods
 */
export type AuthMethod =
  | "none"
  | "nonce"
  | "basic"
  | "bearer"
  | "apiKey"
  | "hmac"
  | "oauth2";

/**
 * Basic authentication credentials
 */
export interface BasicAuthCredentials {
  username: string;
  password: string;
}

/**
 * Bearer token authentication credentials
 */
export interface BearerAuthCredentials {
  token: string;
  refreshToken?: string;
}

/**
 * API Key authentication credentials
 */
export interface ApiKeyAuthCredentials {
  apiKey: string;
}

/**
 * HMAC authentication credentials
 */
export interface HmacAuthCredentials {
  apiKey: string;
  secret: string;
}

/**
 * Nonce authentication credentials
 */
export interface NonceAuthCredentials {
  nonce: string;
}

/**
 * OAuth2 authentication credentials
 */
export interface OAuth2Credentials {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
  scope?: string[];
}

/**
 * Combined authentication configuration
 */
export interface AuthConfig {
  method: AuthMethod;
  credentials?:
    | BasicAuthCredentials
    | BearerAuthCredentials
    | ApiKeyAuthCredentials
    | HmacAuthCredentials
    | NonceAuthCredentials
    | OAuth2Credentials;
  onTokenRefresh?: (newToken: string) => void | Promise<void>;
}

/**
 * Authentication provider response
 */
export interface AuthResponse {
  headers: HeadersInit;
  beforeRequest?: () => Promise<void>;
  afterRequest?: (response: Response) => Promise<Response>;
  shouldRefresh?: (response: Response) => Promise<boolean>;
  refresh?: () => Promise<void>;
}
