import { AuthConfig, AuthResponse } from "./types";
import { AuthProviders } from "./providers";

export * from "./types";

export function createAuth(config: AuthConfig): AuthResponse {
  const { method, credentials, onTokenRefresh } = config;

  switch (method) {
    case "none":
      return AuthProviders.none();

    case "basic":
      if (!credentials || "username" in credentials === false) {
        throw new Error("Basic auth requires username and password");
      }
      return AuthProviders.basic(credentials);

    case "bearer":
      if (!credentials || "token" in credentials === false) {
        throw new Error("Bearer auth requires a token");
      }
      return AuthProviders.bearer(credentials, onTokenRefresh);

    case "apiKey":
      if (!credentials || "apiKey" in credentials === false) {
        throw new Error("API Key auth requires an apiKey");
      }
      return AuthProviders.apiKey(credentials);

    case "hmac":
      if (
        !credentials ||
        "apiKey" in credentials === false ||
        "secret" in credentials === false
      ) {
        throw new Error("HMAC auth requires an apiKey and secret");
      }
      return AuthProviders.hmac(credentials);

    case "nonce":
      if (!credentials || "nonce" in credentials === false) {
        throw new Error("Nonce auth requires a nonce");
      }
      return AuthProviders.nonce(credentials);

    case "oauth2":
      if (
        !credentials ||
        "clientId" in credentials === false ||
        "clientSecret" in credentials === false
      ) {
        throw new Error("OAuth2 requires clientId and clientSecret");
      }
      return AuthProviders.oauth2(credentials, onTokenRefresh);

    default:
      throw new Error(`Unsupported auth method: ${method}`);
  }
}
