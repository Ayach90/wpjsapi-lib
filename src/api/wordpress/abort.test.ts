import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { apiGet, apiPost, apiPut, apiDelete } from "./http";

describe("AbortController Support", () => {
  const baseUrl = "https://example.com/wp-json";
  const path = "/wp/v2/posts";

  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("apiGet", () => {
    it("should pass signal to fetch", async () => {
      const controller = new AbortController();
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 1, title: "Test" }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await apiGet(baseUrl, path, {}, undefined, controller.signal);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: controller.signal,
        })
      );
    });

    it("should work without signal", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 1, title: "Test" }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await apiGet(baseUrl, path, {});

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: undefined,
        })
      );
    });

    it("should throw AbortError when aborted", async () => {
      const controller = new AbortController();

      (global.fetch as any).mockImplementation(() => {
        return Promise.reject(new DOMException("Aborted", "AbortError"));
      });

      controller.abort();

      await expect(
        apiGet(baseUrl, path, {}, undefined, controller.signal)
      ).rejects.toThrow("Aborted");
    });
  });

  describe("apiPost", () => {
    it("should pass signal to fetch", async () => {
      const controller = new AbortController();
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 1, title: "Created" }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await apiPost(
        baseUrl,
        path,
        { title: "New Post" },
        undefined,
        controller.signal
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: controller.signal,
          method: "POST",
        })
      );
    });
  });

  describe("apiPut", () => {
    it("should pass signal to fetch", async () => {
      const controller = new AbortController();
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 1, title: "Updated" }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await apiPut(
        baseUrl,
        path,
        { title: "Updated Post" },
        undefined,
        controller.signal
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: controller.signal,
        })
      );
    });
  });

  describe("apiDelete", () => {
    it("should pass signal to fetch", async () => {
      const controller = new AbortController();
      const mockResponse = {
        ok: true,
        json: async () => ({ deleted: true }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await apiDelete(baseUrl, path, {}, undefined, controller.signal);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: controller.signal,
          method: "DELETE",
        })
      );
    });
  });

  describe("Real-world scenarios", () => {
    it("should handle abort before request completes", async () => {
      const controller = new AbortController();

      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new DOMException("Aborted", "AbortError"));
            }, 100);
          })
      );

      // Abort after 50ms
      setTimeout(() => controller.abort(), 50);

      await expect(
        apiGet(baseUrl, path, {}, undefined, controller.signal)
      ).rejects.toThrow();
    });

    it("should allow multiple requests with same controller", async () => {
      const controller = new AbortController();
      const mockResponse = {
        ok: true,
        json: async () => ({ data: "test" }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      // Make multiple requests
      await Promise.all([
        apiGet(baseUrl, "/wp/v2/posts", {}, undefined, controller.signal),
        apiGet(baseUrl, "/wp/v2/pages", {}, undefined, controller.signal),
      ]);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("should handle abort after request completes", async () => {
      const controller = new AbortController();
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 1 }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await apiGet(
        baseUrl,
        path,
        {},
        undefined,
        controller.signal
      );

      // Abort after completion - should not throw
      controller.abort();

      expect(result).toEqual({ id: 1 });
    });
  });

  describe("Error handling", () => {
    it("should distinguish abort errors from other errors", async () => {
      const controller = new AbortController();

      (global.fetch as any).mockRejectedValue(
        new DOMException("Aborted", "AbortError")
      );

      controller.abort();

      try {
        await apiGet(baseUrl, path, {}, undefined, controller.signal);
        expect.fail("Should have thrown");
      } catch (error: any) {
        expect(error.name).toBe("AbortError");
        expect(error.message).toContain("Aborted");
      }
    });

    it("should handle network errors separately from abort", async () => {
      const controller = new AbortController();

      (global.fetch as any).mockRejectedValue(new Error("Network error"));

      try {
        await apiGet(baseUrl, path, {}, undefined, controller.signal);
        expect.fail("Should have thrown");
      } catch (error: any) {
        expect(error.name).not.toBe("AbortError");
        expect(error.message).toBe("Network error");
      }
    });
  });
});
