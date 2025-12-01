import { describe, it, expect } from "vitest";
import { createPostsEndpoints } from "./api/wordpress/posts";
import { createPageEndpoints } from "./api/wordpress/pages";
import { createMediaEndpoints } from "./api/wordpress/media";
import { WPApiError } from "./api/wordpress/errors";

describe("API Endpoints Integration", () => {
  const baseUrl = "https://example.com";

  describe("createPostsEndpoints", () => {
    it("should create posts endpoints with all methods", () => {
      const posts = createPostsEndpoints({ baseUrl });

      expect(posts.list).toBeTypeOf("function");
      expect(posts.get).toBeTypeOf("function");
      expect(posts.create).toBeTypeOf("function");
      expect(posts.update).toBeTypeOf("function");
      expect(posts.delete).toBeTypeOf("function");
      expect(posts.getRevisions).toBeTypeOf("function");
      expect(posts.listAll).toBeTypeOf("function");
      expect(posts.pages).toBeTypeOf("function");
    });
  });

  describe("createPageEndpoints", () => {
    it("should create pages endpoints with all methods", () => {
      const pages = createPageEndpoints({ baseUrl });

      expect(pages.list).toBeTypeOf("function");
      expect(pages.get).toBeTypeOf("function");
      expect(pages.create).toBeTypeOf("function");
      expect(pages.update).toBeTypeOf("function");
      expect(pages.delete).toBeTypeOf("function");
      expect(pages.getRevisions).toBeTypeOf("function");
    });
  });
  describe("createMediaEndpoints", () => {
    it("should create media endpoints with all methods", () => {
      const media = createMediaEndpoints({ baseUrl });

      expect(media.list).toBeTypeOf("function");
      expect(media.get).toBeTypeOf("function");
      expect(media.create).toBeTypeOf("function");
      expect(media.update).toBeTypeOf("function");
      expect(media.delete).toBeTypeOf("function");
      expect(media.listAll).toBeTypeOf("function");
      expect(media.pages).toBeTypeOf("function");
    });
  });

  describe("WPApiError", () => {
    it("should be exported and usable", () => {
      const error = new WPApiError("Test error", 404);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(WPApiError);
      expect(error.status).toBe(404);
      expect(error.isNotFound).toBe(true);
    });
  });

  describe("Exports", () => {
    it("should export error handling", async () => {
      const { WPApiError, handleApiError } = await import(
        "./api/wordpress/errors"
      );

      expect(WPApiError).toBeDefined();
      expect(handleApiError).toBeTypeOf("function");
    });

    it("should export HTTP helpers", async () => {
      const { buildUrl, buildSearchParams, buildResourcePath } = await import(
        "./api/wordpress/http"
      );

      expect(buildUrl).toBeTypeOf("function");
      expect(buildSearchParams).toBeTypeOf("function");
      expect(buildResourcePath).toBeTypeOf("function");
    });

    it("should export all endpoint creators", async () => {
      const {
        createPostsEndpoints,
        createPageEndpoints,
        createMediaEndpoints,
        createCommentsEndpoints,
        createCategoryEndpoints,
        createTagsEndpoints,
        createTaxonomiesEndpoints,
        createUsersEndpoints,
        createMenuEndpoints,
        createSettingsEndpoints,
        createPostTypesEndpoints,
        createPostStatusesEndpoints,
      } = await import("./api");

      expect(createPostsEndpoints).toBeTypeOf("function");
      expect(createPageEndpoints).toBeTypeOf("function");
      expect(createMediaEndpoints).toBeTypeOf("function");
      expect(createCommentsEndpoints).toBeTypeOf("function");
      expect(createCategoryEndpoints).toBeTypeOf("function");
      expect(createTagsEndpoints).toBeTypeOf("function");
      expect(createTaxonomiesEndpoints).toBeTypeOf("function");
      expect(createUsersEndpoints).toBeTypeOf("function");
      expect(createMenuEndpoints).toBeTypeOf("function");
      expect(createSettingsEndpoints).toBeTypeOf("function");
      expect(createPostTypesEndpoints).toBeTypeOf("function");
      expect(createPostStatusesEndpoints).toBeTypeOf("function");
    });
  });
});
