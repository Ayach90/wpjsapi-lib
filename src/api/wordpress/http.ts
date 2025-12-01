import { WPPaginatedResponse, WPPaginationInfo } from "./types";
import { handleApiError } from "./errors";
import type { AuthResponse } from "../../auth";

/**
 * Normalize URL by handling trailing/leading slashes
 * Prevents double slashes while preserving protocol slashes (https://)
 *
 * @param baseUrl - Base URL (e.g., "https://site.com" or "https://site.com/")
 * @param path - Path to append (e.g., "/wp/v2/posts" or "wp/v2/posts")
 * @returns Normalized URL without double slashes
 *
 * @example
 * normalizeUrl("https://site.com", "/wp/v2/posts") // "https://site.com/wp/v2/posts"
 * normalizeUrl("https://site.com/", "/wp/v2/posts") // "https://site.com/wp/v2/posts"
 * normalizeUrl("https://site.com/", "wp/v2/posts") // "https://site.com/wp/v2/posts"
 * normalizeUrl("https://site.com", "wp/v2/posts") // "https://site.com/wp/v2/posts"
 */
export function normalizeUrl(baseUrl: string, path: string): string {
  // Remove trailing slash from baseUrl if present
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // Ensure path starts with a slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}

/**
 * Build URL search parameters from an object
 * Handles arrays, undefined values, and special WordPress parameters
 */
export function buildSearchParams(
  params?: Record<string, any>
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (!params) return searchParams;

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // Handle _fields parameter (array of field names) - must be comma-joined
    if (key === "_fields" && Array.isArray(value)) {
      if (value.length > 0) {
        searchParams.append("_fields", value.join(","));
      }
      return;
    }

    // Handle _embed parameter
    if (key === "_embed" && value === true) {
      searchParams.append("_embed", "true");
      return;
    }

    // Handle arrays (used for multi-value parameters like categories, tags)
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v.toString()));
      return;
    }

    // Handle all other parameters
    searchParams.append(key, value.toString());
  });

  return searchParams;
}

/**
 * Build a complete URL with query parameters
 * Automatically normalizes slashes to prevent double slashes
 */
export function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, any>
): string {
  const normalizedUrl = normalizeUrl(baseUrl, path);
  const searchParams = buildSearchParams(params);
  const queryString = searchParams.toString();
  return `${normalizedUrl}${queryString ? `?${queryString}` : ""}`;
}

/**
 * Configuration for making API requests
 */
export interface ApiRequestConfig {
  baseUrl: string;
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  params?: Record<string, any>;
  body?: any;
  auth?: AuthResponse;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

/**
 * Make an API request with authentication and error handling
 */
export async function makeApiRequest(config: ApiRequestConfig): Promise<Response> {
  const {
    baseUrl,
    path,
    method = "GET",
    params,
    body,
    auth,
    headers = {},
    signal,
  } = config;

  const url = buildUrl(baseUrl, path, params);

  // Call beforeRequest hook if available
  await auth?.beforeRequest?.();

  const requestInit: RequestInit = {
    method,
    headers: {
      ...headers,
      ...auth?.headers,
    },
    signal,
  };

  // Add body for POST/PUT/PATCH requests
  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    requestInit.body = JSON.stringify(body);
    const headersObj = headers as Record<string, string>;
    if (!headersObj["Content-Type"]) {
      requestInit.headers = {
        ...requestInit.headers,
        "Content-Type": "application/json",
      };
    }
  }

  const response = await fetch(url, requestInit);

  // Handle errors
  if (!response.ok) {
    if (auth?.shouldRefresh && (await auth.shouldRefresh(response))) {
      await auth.refresh?.();
      // Retry the request after refresh
      return makeApiRequest(config);
    }
    await handleApiError(response);
  }

  // Call afterRequest hook if available
  const processedResponse = auth?.afterRequest
    ? await auth.afterRequest(response)
    : response;

  return processedResponse;
}

/**
 * Make a GET request and return JSON response
 */
export async function apiGet<T>(
  baseUrl: string,
  path: string,
  params?: Record<string, any>,
  auth?: AuthResponse,
  signal?: AbortSignal
): Promise<T> {
  const response = await makeApiRequest({
    baseUrl,
    path,
    method: "GET",
    params,
    auth,
    signal,
  });

  return response.json();
}

/**
 * Make a GET request and return paginated response
 */
export async function apiGetPaginated<T>(
  baseUrl: string,
  path: string,
  params?: Record<string, any>,
  auth?: AuthResponse,
  signal?: AbortSignal
): Promise<WPPaginatedResponse<T>> {
  const response = await makeApiRequest({
    baseUrl,
    path,
    method: "GET",
    params,
    auth,
    signal,
  });

  const items = await response.json();
  const pagination = extractPaginationInfo(response, params);

  return { items, pagination };
}

/**
 * Make a POST request and return JSON response
 */
export async function apiPost<T>(
  baseUrl: string,
  path: string,
  body: any,
  auth?: AuthResponse,
  signal?: AbortSignal
): Promise<T> {
  const response = await makeApiRequest({
    baseUrl,
    path,
    method: "POST",
    body,
    auth,
    signal,
  });

  return response.json();
}

/**
 * Make a PUT request and return JSON response
 */
export async function apiPut<T>(
  baseUrl: string,
  path: string,
  body: any,
  auth?: AuthResponse,
  signal?: AbortSignal
): Promise<T> {
  const response = await makeApiRequest({
    baseUrl,
    path,
    method: "POST", // WordPress REST API uses POST with X-HTTP-Method-Override
    body,
    auth,
    signal,
    headers: {
      "X-HTTP-Method-Override": "PUT",
    },
  });

  return response.json();
}

/**
 * Make a DELETE request and return JSON response
 */
export async function apiDelete<T>(
  baseUrl: string,
  path: string,
  params?: Record<string, any>,
  auth?: AuthResponse,
  signal?: AbortSignal
): Promise<T> {
  const response = await makeApiRequest({
    baseUrl,
    path,
    method: "DELETE",
    params,
    auth,
    signal,
  });

  return response.json();
}

/**
 * Extract pagination information from response headers
 */
export function extractPaginationInfo(
  response: Response,
  params?: Record<string, any>
): WPPaginationInfo {
  const total = parseInt(response.headers.get("X-WP-Total") || "0", 10);
  const totalPages = parseInt(
    response.headers.get("X-WP-TotalPages") || "0",
    10
  );
  const currentPage = params?.page || 1;
  const perPage = params?.per_page || 10;

  return {
    total,
    totalPages,
    currentPage,
    perPage,
    hasMore: currentPage < totalPages,
  };
}

/**
 * Helper to build a resource path with ID
 */
export function buildResourcePath(
  basePath: string,
  id?: number | string
): string {
  return id !== undefined ? `${basePath}/${id}` : basePath;
}
