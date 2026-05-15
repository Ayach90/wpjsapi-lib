import { describe, it, expect } from "vitest";
import { AuthProviders } from "./providers";

describe("AuthProviders", () => {
  describe("none", () => {
    it("should return empty headers", () => {
      const auth = AuthProviders.none();
      expect(auth.headers).toEqual({});
    });
  });

  describe("basic", () => {
    it("should create Basic Auth header with correct base64 encoding", () => {
      const auth = AuthProviders.basic({
        username: "admin",
        password: "secret123",
      });

      const headers = auth.headers as Record<string, string>;
      expect(headers).toHaveProperty("Authorization");
      expect(headers.Authorization).toMatch(/^Basic /);

      // Verify base64 encoding is correct
      const base64Part = headers.Authorization.replace("Basic ", "");
      const decoded = atob(base64Part);
      expect(decoded).toBe("admin:secret123");
    });

    it("should handle special characters in credentials", () => {
      const auth = AuthProviders.basic({
        username: "user@example.com",
        password: "p@ssw0rd!#$%",
      });

      const headers = auth.headers as Record<string, string>;
      const base64Part = headers.Authorization.replace("Basic ", "");
      const decoded = atob(base64Part);
      expect(decoded).toBe("user@example.com:p@ssw0rd!#$%");
    });

    it("should handle empty password", () => {
      const auth = AuthProviders.basic({
        username: "admin",
        password: "",
      });

      const headers = auth.headers as Record<string, string>;
      const base64Part = headers.Authorization.replace("Basic ", "");
      const decoded = atob(base64Part);
      expect(decoded).toBe("admin:");
    });

    it("should be compatible with browser btoa()", () => {
      // This test ensures we're using btoa() not Buffer
      const auth = AuthProviders.basic({
        username: "test",
        password: "pass",
      });

      const headers = auth.headers as Record<string, string>;
      // btoa() should produce the same result as Buffer.from().toString('base64')
      const expected = btoa("test:pass");
      expect(headers.Authorization).toBe(`Basic ${expected}`);
    });
  });

  describe("bearer", () => {
    it("should create Bearer token header", () => {
      const auth = AuthProviders.bearer({
        token: "abc123xyz",
      });

      const headers = auth.headers as Record<string, string>;
      expect(headers).toHaveProperty("Authorization");
      expect(headers.Authorization).toBe("Bearer abc123xyz");
    });

    it("should not expose refresh behavior without an implementation", () => {
      const auth = AuthProviders.bearer({
        token: "abc123",
      });

      expect(auth.refresh).toBeUndefined();
    });
  });

  describe("apiKey", () => {
    it("should create API key header", () => {
      const auth = AuthProviders.apiKey({
        apiKey: "my-secret-api-key",
      });

      const headers = auth.headers as Record<string, string>;
      expect(headers).toHaveProperty("X-API-Key");
      expect(headers["X-API-Key"]).toBe("my-secret-api-key");
    });
  });

  describe("nonce", () => {
    it("should create WordPress nonce header", () => {
      const auth = AuthProviders.nonce({
        nonce: "abc123nonce",
      });

      const headers = auth.headers as Record<string, string>;
      expect(headers).toHaveProperty("X-WP-Nonce");
      expect(headers["X-WP-Nonce"]).toBe("abc123nonce");
    });
  });

  describe("hmac", () => {
    it("should throw because HMAC signing is not implemented", () => {
      expect(() =>
        AuthProviders.hmac({
          apiKey: "key123",
          secret: "secret456",
        })
      ).toThrow("HMAC auth is not implemented yet");
    });
  });

  describe("oauth2", () => {
    it("should create OAuth2 auth with access token", () => {
      const auth = AuthProviders.oauth2({
        clientId: "client123",
        clientSecret: "secret456",
        accessToken: "access123",
      });

      const headers = auth.headers as Record<string, string>;
      expect(headers).toHaveProperty("Authorization");
      expect(headers.Authorization).toBe("Bearer access123");
    });

    it("should reject missing access token", () => {
      expect(() =>
        AuthProviders.oauth2({
          clientId: "client123",
          clientSecret: "secret456",
          accessToken: "",
        })
      ).toThrow("OAuth2 auth requires an accessToken");
    });

    it("should not expose refresh behavior without an implementation", () => {
      const auth = AuthProviders.oauth2({
        clientId: "client123",
        clientSecret: "secret456",
        accessToken: "access123",
      });

      expect(auth.refresh).toBeUndefined();
    });
  });
});
