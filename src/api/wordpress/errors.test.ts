import { describe, it, expect } from "vitest";
import { WPApiError, handleApiError } from "./errors";

describe("WPApiError", () => {
  it("should create error with status code and message", () => {
    const error = new WPApiError("Not found", 404);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(WPApiError);
    expect(error.message).toBe("Not found");
    expect(error.status).toBe(404);
    expect(error.name).toBe("WPApiError");
  });

  it("should include WordPress error code when provided", () => {
    const error = new WPApiError("Invalid request", 400, {
      code: "rest_invalid_param",
    });

    expect(error.code).toBe("rest_invalid_param");
  });

  it("should include WordPress error data when provided", () => {
    const errorData = { params: { title: "required" }, details: {} };
    const error = new WPApiError("Invalid request", 400, {
      code: "rest_invalid_param",
      data: errorData,
    });

    expect(error.data).toEqual(errorData);
  });

  it("should generate user-friendly message for auth errors", () => {
    const error401 = new WPApiError("Unauthorized", 401);
    const error403 = new WPApiError("Forbidden", 403);

    expect(error401.userMessage).toContain("Authentication required");
    expect(error403.userMessage).toContain("permission");
  });

  it("should generate user-friendly message for not found errors", () => {
    const error = new WPApiError("Not found", 404);

    expect(error.userMessage).toContain("not found");
  });

  it("should generate user-friendly message for rate limit errors", () => {
    const error = new WPApiError("Too many requests", 429);

    expect(error.userMessage).toContain("Too many requests");
  });

  it("should detect client errors (4xx)", () => {
    const error400 = new WPApiError("Bad request", 400);
    const error404 = new WPApiError("Not found", 404);
    const error500 = new WPApiError("Server error", 500);

    expect(error400.isClientError).toBe(true);
    expect(error404.isClientError).toBe(true);
    expect(error500.isClientError).toBe(false);
  });

  it("should detect server errors (5xx)", () => {
    const error500 = new WPApiError("Internal error", 500);
    const error503 = new WPApiError("Service unavailable", 503);
    const error400 = new WPApiError("Bad request", 400);

    expect(error500.isServerError).toBe(true);
    expect(error503.isServerError).toBe(true);
    expect(error400.isServerError).toBe(false);
  });

  it("should detect auth errors", () => {
    const error401 = new WPApiError("Unauthorized", 401);
    const error403 = new WPApiError("Forbidden", 403);
    const error400 = new WPApiError("Bad request", 400);

    expect(error401.isAuthError).toBe(true);
    expect(error403.isAuthError).toBe(true);
    expect(error400.isAuthError).toBe(false);
  });

  it("should detect not found errors", () => {
    const error404 = new WPApiError("Not found", 404);
    const error500 = new WPApiError("Server error", 500);

    expect(error404.isNotFound).toBe(true);
    expect(error500.isNotFound).toBe(false);
  });

  it("should detect rate limit errors", () => {
    const error429 = new WPApiError("Too many requests", 429);
    const error500 = new WPApiError("Server error", 500);

    expect(error429.isRateLimitError).toBe(true);
    expect(error500.isRateLimitError).toBe(false);
  });

  it("should serialize to JSON correctly", () => {
    const error = new WPApiError("Not found", 404, {
      code: "rest_post_invalid_id",
    });
    const json = error.toJSON();

    expect(json).toEqual({
      name: "WPApiError",
      message: "Not found",
      status: 404,
      code: "rest_post_invalid_id",
      data: undefined,
      isClientError: true,
      isServerError: false,
      isAuthError: false,
      userMessage: "The requested resource was not found.",
    });
  });

  it("should create error from Response object", async () => {
    const mockResponse = new Response(
      JSON.stringify({
        code: "rest_invalid_param",
        message: "Invalid parameter",
        data: { status: 400 },
      }),
      {
        status: 400,
        statusText: "Bad Request",
        headers: { "content-type": "application/json" },
      }
    );

    const error = await WPApiError.fromResponse(mockResponse);

    expect(error).toBeInstanceOf(WPApiError);
    expect(error.message).toBe("Invalid parameter");
    expect(error.status).toBe(400);
    expect(error.code).toBe("rest_invalid_param");
  });

  it("should handle non-JSON responses", async () => {
    const mockResponse = new Response("Internal Server Error", {
      status: 500,
      statusText: "Internal Server Error",
    });

    const error = await WPApiError.fromResponse(mockResponse);

    expect(error).toBeInstanceOf(WPApiError);
    expect(error.message).toBe("Internal Server Error");
    expect(error.status).toBe(500);
  });
});

describe("handleApiError", () => {
  it("should throw WPApiError with status code and message", async () => {
    const mockResponse = new Response(
      JSON.stringify({ message: "Post not found" }),
      {
        status: 404,
        statusText: "Not Found",
        headers: { "content-type": "application/json" },
      }
    );

    try {
      await handleApiError(mockResponse);
      expect.fail("Should have thrown error");
    } catch (error) {
      expect(error).toBeInstanceOf(WPApiError);
      expect((error as WPApiError).message).toBe("Post not found");
      expect((error as WPApiError).status).toBe(404);
    }
  });

  it("should include WordPress error code from response", async () => {
    const mockResponse = new Response(
      JSON.stringify({
        code: "rest_invalid_param",
        message: "Invalid parameter",
        data: { status: 400 },
      }),
      {
        status: 400,
        statusText: "Bad Request",
        headers: { "content-type": "application/json" },
      }
    );

    try {
      await handleApiError(mockResponse);
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(WPApiError);
      if (error instanceof WPApiError) {
        expect(error.code).toBe("rest_invalid_param");
      }
    }
  });

  it("should use statusText when message is not in JSON", async () => {
    const mockResponse = new Response("{}", {
      status: 403,
      statusText: "Forbidden",
      headers: { "content-type": "application/json" },
    });

    try {
      await handleApiError(mockResponse);
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(WPApiError);
      if (error instanceof WPApiError) {
        expect(error.message).toBe("Forbidden");
      }
    }
  });
});
