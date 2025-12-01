import type {
  WPPostStatus,
  WPPostStatusParameters,
  RequestOptions,
} from "./types";
import type { AuthResponse } from "../../../auth";
import { WPPaginatedResponse } from "../types";
import { createPaginationHelpers } from "../utils";
import { apiGet } from "../http";
import { handleApiError } from "../errors";

/**
 * Base path for WordPress post statuses API endpoints
 */
const BASE_PATH = "/wp/v2/statuses";

/**
 * Post Statuses API endpoints configuration
 */
interface PostStatusesEndpointsConfig {
  baseUrl: string;
  auth?: AuthResponse;
}

/**
 * Post Statuses API endpoints
 */
export const createPostStatusesEndpoints = ({
  baseUrl,
  auth,
}: PostStatusesEndpointsConfig) => {
  const endpoints = {
    /**
     * Get a list of post statuses
     * @param params Optional parameters
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with an object of post statuses
     * @example
     * // Get all post statuses
     * const statuses = await api.postStatuses.list();
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const statuses = await api.postStatuses.list({}, { signal: controller.signal });
     */
    list: async (
      params?: WPPostStatusParameters,
      options?: RequestOptions
    ): Promise<WPPaginatedResponse<WPPostStatus>> => {
      const searchParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }

      const queryString = searchParams.toString();
      const url = `${baseUrl}${BASE_PATH}${
        queryString ? `?${queryString}` : ""
      }`;

      await auth?.beforeRequest?.();

      const response = await fetch(url, {
        headers: auth?.headers || {},
        signal: options?.signal,
      });

      if (!response.ok) {
        if (auth?.shouldRefresh && (await auth.shouldRefresh(response))) {
          await auth.refresh?.();
          return endpoints.list(params, options);
        }
        await handleApiError(response);
      }

      const processedResponse = auth?.afterRequest
        ? await auth.afterRequest(response)
        : response;

      const items: Record<string, WPPostStatus> =
        await processedResponse.json();
      // Convert record to array
      const itemsArray = Object.values(items);
      const total = response.headers.get("X-WP-Total");
      const totalPages = response.headers.get("X-WP-TotalPages");

      return {
        items: itemsArray,
        pagination: {
          total: total ? parseInt(total, 10) : itemsArray.length,
          totalPages: totalPages ? parseInt(totalPages, 10) : 1,
          currentPage: params?.page || 1,
          perPage: params?.per_page || itemsArray.length,
          hasMore: false, // Post statuses are always returned in a single page
        },
      };
    },

    /**
     * Get a single post status by slug
     * @param slug The status slug (e.g., 'publish', 'draft')
     * @param context Optional context to determine fields in response
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the post status data
     * @example
     * // Get information about published status
     * const status = await api.postStatuses.get('publish');
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const status = await api.postStatuses.get('publish', 'view', { signal: controller.signal });
     */
    get: async (
      slug: string,
      context: "view" | "embed" | "edit" = "view",
      options?: RequestOptions
    ): Promise<WPPostStatus> => {
      return apiGet<WPPostStatus>(
        baseUrl,
        `${BASE_PATH}/${slug}`,
        { context },
        auth,
        options?.signal
      );
    },
  };

  // Add pagination helpers
  const paginationHelpers = createPaginationHelpers(endpoints.list);
  return {
    ...endpoints,
    ...paginationHelpers,
  };
};
