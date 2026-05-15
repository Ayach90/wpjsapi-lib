import {
  AuthResponse,
  BasicAuthCredentials,
  BearerAuthCredentials,
  ApiKeyAuthCredentials,
  HmacAuthCredentials,
  NonceAuthCredentials,
  OAuth2Credentials,
} from "./types";

export class AuthProviders {
  static none(): AuthResponse {
    return {
      headers: {},
    };
  }

  static basic(credentials: BasicAuthCredentials): AuthResponse {
    // Use btoa() instead of Buffer for browser compatibility
    // btoa() is available in browsers and Node.js 16+
    const base64Credentials = btoa(
      `${credentials.username}:${credentials.password}`
    );

    return {
      headers: {
        Authorization: `Basic ${base64Credentials}`,
      },
    };
  }

  static bearer(
    credentials: BearerAuthCredentials
  ): AuthResponse {
    return {
      headers: {
        Authorization: `Bearer ${credentials.token}`,
      },
    };
  }

  static apiKey(credentials: ApiKeyAuthCredentials): AuthResponse {
    return {
      headers: {
        "X-API-Key": credentials.apiKey,
      },
    };
  }

  static hmac(credentials: HmacAuthCredentials): AuthResponse {
    void credentials;
    throw new Error("HMAC auth is not implemented yet");
  }

  static nonce(credentials: NonceAuthCredentials): AuthResponse {
    return {
      headers: {
        "X-WP-Nonce": credentials.nonce,
      },
    };
  }

  static oauth2(
    credentials: OAuth2Credentials
  ): AuthResponse {
    if (!credentials.accessToken) {
      throw new Error("OAuth2 auth requires an accessToken");
    }

    return {
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
      },
    };
  }
}
