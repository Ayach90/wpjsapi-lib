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
    credentials: BearerAuthCredentials,
    onRefresh?: (newToken: string) => void | Promise<void>
  ): AuthResponse {
    return {
      headers: {
        Authorization: `Bearer ${credentials.token}`,
      },
      refresh: async () => {
        if (credentials.refreshToken && onRefresh) {
          // Here you would implement the refresh token logic
          // const newToken = await refreshTokenRequest(credentials.refreshToken);
          // await onRefresh(newToken);
          // credentials.token = newToken;
        }
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
    // Placeholder use until HMAC signing is implemented
    void credentials;
    return {
      headers: {},
      beforeRequest: async () => {
        // Implement HMAC signature generation here
        // const signature = generateHmacSignature(credentials.apiKey, credentials.secret);
        // headers['X-Signature'] = signature;
      },
    };
  }

  static nonce(credentials: NonceAuthCredentials): AuthResponse {
    return {
      headers: {
        "X-WP-Nonce": credentials.nonce,
      },
    };
  }

  static oauth2(
    credentials: OAuth2Credentials,
    onRefresh?: (newToken: string) => void | Promise<void>
  ): AuthResponse {
    return {
      headers: credentials.accessToken
        ? {
            Authorization: `Bearer ${credentials.accessToken}`,
          }
        : {},
      refresh: async () => {
        if (credentials.refreshToken && onRefresh) {
          // Implement OAuth2 refresh token flow here
          // const newToken = await refreshOAuth2Token(credentials);
          // await onRefresh(newToken);
          // credentials.accessToken = newToken;
        }
      },
    };
  }
}
