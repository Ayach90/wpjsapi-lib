import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildSearchParams,
  buildUrl,
  buildResourcePath,
  normalizeUrl,
} from "./http";

describe("normalizeUrl", () => {
  it("should handle baseUrl with trailing slash and path with leading slash", () => {
    const result = normalizeUrl("https://site.com/", "/wp/v2/posts");
    expect(result).toBe("https://site.com/wp/v2/posts");
  });

  it("should handle baseUrl without trailing slash and path with leading slash", () => {
    const result = normalizeUrl("https://site.com", "/wp/v2/posts");
    expect(result).toBe("https://site.com/wp/v2/posts");
  });

  it("should handle baseUrl with trailing slash and path without leading slash", () => {
    const result = normalizeUrl("https://site.com/", "wp/v2/posts");
    expect(result).toBe("https://site.com/wp/v2/posts");
  });

  it("should handle baseUrl without trailing slash and path without leading slash", () => {
    const result = normalizeUrl("https://site.com", "wp/v2/posts");
    expect(result).toBe("https://site.com/wp/v2/posts");
  });

  it("should preserve protocol double slashes (https://)", () => {
    const result = normalizeUrl("https://site.com/", "/wp/v2/posts");
    expect(result).toBe("https://site.com/wp/v2/posts");
    expect(result).toContain("https://");
  });

  it("should handle complex paths with multiple segments", () => {
    const result = normalizeUrl(
      "https://api.wordpress.com/",
      "/wp/v2/posts/123/revisions"
    );
    expect(result).toBe("https://api.wordpress.com/wp/v2/posts/123/revisions");
  });

  it("should handle localhost URLs", () => {
    const result = normalizeUrl("http://localhost:8080/", "/api/posts");
    expect(result).toBe("http://localhost:8080/api/posts");
  });

  it("should handle baseUrl with subdirectory", () => {
    const result = normalizeUrl("https://site.com/wordpress", "/wp/v2/posts");
    expect(result).toBe("https://site.com/wordpress/wp/v2/posts");
  });

  it("should handle baseUrl with subdirectory and trailing slash", () => {
    const result = normalizeUrl("https://site.com/wordpress/", "/wp/v2/posts");
    expect(result).toBe("https://site.com/wordpress/wp/v2/posts");
  });

  it("should handle empty path", () => {
    const result = normalizeUrl("https://site.com/", "");
    expect(result).toBe("https://site.com/");
  });

  it("should handle root path", () => {
    const result = normalizeUrl("https://site.com", "/");
    expect(result).toBe("https://site.com/");
  });
});

describe("buildSearchParams", () => {
  it("should build empty URLSearchParams for empty object", () => {
    const params = buildSearchParams({});
    expect(params.toString()).toBe("");
  });

  it("should handle simple key-value pairs", () => {
    const params = buildSearchParams({ page: 1, per_page: 10 });
    expect(params.toString()).toBe("page=1&per_page=10");
  });

  it("should handle array values", () => {
    const params = buildSearchParams({ categories: [1, 2, 3] });
    const result = params.toString();
    expect(result).toContain("categories=1");
    expect(result).toContain("categories=2");
    expect(result).toContain("categories=3");
  });

  it("should skip undefined values", () => {
    const params = buildSearchParams({ page: 1, status: undefined });
    expect(params.toString()).toBe("page=1");
  });

  it("should handle boolean _embed parameter", () => {
    const params = buildSearchParams({ _embed: true });
    expect(params.toString()).toBe("_embed=true");
  });

  it("should handle array _fields parameter", () => {
    const params = buildSearchParams({ _fields: ["id", "title", "content"] });
    // _fields should be comma-joined as per WordPress REST API spec
    expect(params.get("_fields")).toBe("id,title,content");
    expect(params.toString()).toBe("_fields=id%2Ctitle%2Ccontent");
  });

  it("should handle mixed parameters", () => {
    const params = buildSearchParams({
      page: 2,
      per_page: 20,
      categories: [5, 10],
      _embed: true,
      _fields: ["id", "title"],
      status: undefined,
    });

    const result = params.toString();
    expect(result).toContain("page=2");
    expect(result).toContain("per_page=20");
    expect(result).toContain("categories=5");
    expect(result).toContain("categories=10");
    expect(result).toContain("_embed=true");
    // _fields should be comma-joined
    expect(params.get("_fields")).toBe("id,title");
    expect(result).not.toContain("status");
  });

  it("should convert numbers to strings", () => {
    const params = buildSearchParams({ id: 123, page: 1 });
    expect(params.get("id")).toBe("123");
    expect(params.get("page")).toBe("1");
  });

  it("should handle empty arrays", () => {
    const params = buildSearchParams({ categories: [] });
    expect(params.toString()).toBe("");
  });

  it("should handle empty _fields array", () => {
    const params = buildSearchParams({ _fields: [] });
    expect(params.toString()).toBe("");
  });

  it("should handle _fields with single field", () => {
    const params = buildSearchParams({ _fields: ["id"] });
    expect(params.get("_fields")).toBe("id");
  });

  it("should handle _fields with special characters", () => {
    const params = buildSearchParams({ _fields: ["id", "meta.custom_field"] });
    expect(params.get("_fields")).toBe("id,meta.custom_field");
  });
});

describe("buildUrl", () => {
  it("should build URL without parameters", () => {
    const url = buildUrl("https://example.com", "/wp/v2/posts", {});
    expect(url).toBe("https://example.com/wp/v2/posts");
  });

  it("should build URL with parameters", () => {
    const url = buildUrl("https://example.com", "/wp/v2/posts", {
      page: 1,
      per_page: 10,
    });
    expect(url).toBe("https://example.com/wp/v2/posts?page=1&per_page=10");
  });

  it("should normalize baseUrl with trailing slash", () => {
    const url = buildUrl("https://example.com/", "/wp/v2/posts", {});
    expect(url).toBe("https://example.com/wp/v2/posts");
    expect(url).not.toContain("//wp");
  });

  it("should normalize path without leading slash", () => {
    const url = buildUrl("https://example.com", "wp/v2/posts", {});
    expect(url).toBe("https://example.com/wp/v2/posts");
  });

  it("should handle all slash combinations correctly", () => {
    // All combinations should produce the same normalized result
    const url1 = buildUrl("https://example.com", "/wp/v2/posts", {});
    const url2 = buildUrl("https://example.com/", "/wp/v2/posts", {});
    const url3 = buildUrl("https://example.com/", "wp/v2/posts", {});
    const url4 = buildUrl("https://example.com", "wp/v2/posts", {});

    expect(url1).toBe("https://example.com/wp/v2/posts");
    expect(url2).toBe("https://example.com/wp/v2/posts");
    expect(url3).toBe("https://example.com/wp/v2/posts");
    expect(url4).toBe("https://example.com/wp/v2/posts");
  });

  it("should handle array parameters correctly", () => {
    const url = buildUrl("https://example.com", "/wp/v2/posts", {
      categories: [1, 2],
    });
    expect(url).toContain("categories=1");
    expect(url).toContain("categories=2");
  });

  it("should normalize URLs with subdirectories", () => {
    const url = buildUrl("https://example.com/wordpress/", "/wp/v2/posts", {});
    expect(url).toBe("https://example.com/wordpress/wp/v2/posts");
  });

  it("should preserve protocol slashes", () => {
    const url = buildUrl("https://example.com/", "/wp/v2/posts", {});
    expect(url).toContain("https://");
    expect(url).toBe("https://example.com/wp/v2/posts");
  });

  it("should handle localhost URLs", () => {
    const url = buildUrl("http://localhost:8080/", "/api/posts", {
      page: 1,
    });
    expect(url).toBe("http://localhost:8080/api/posts?page=1");
  });
});

describe("buildResourcePath", () => {
  it("should build path with numeric ID", () => {
    const path = buildResourcePath("/wp/v2/posts", 123);
    expect(path).toBe("/wp/v2/posts/123");
  });

  it("should build path with string slug", () => {
    const path = buildResourcePath("/wp/v2/types", "post");
    expect(path).toBe("/wp/v2/types/post");
  });

  it("should handle base path with trailing slash", () => {
    // Current implementation doesn't normalize slashes
    const path = buildResourcePath("/wp/v2/posts/", 123);
    expect(path).toBe("/wp/v2/posts//123");
  });

  it("should handle base path without leading slash", () => {
    const path = buildResourcePath("wp/v2/posts", 123);
    expect(path).toBe("wp/v2/posts/123");
  });

  it("should handle complex paths", () => {
    const path1 = buildResourcePath("/wp/v2/posts", "123");
    const path2 = buildResourcePath("/wp/v2/posts", "revisions");

    expect(path1).toBe("/wp/v2/posts/123");
    expect(path2).toBe("/wp/v2/posts/revisions");
  });
});
