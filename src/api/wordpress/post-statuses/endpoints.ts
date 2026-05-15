import type {
  WPPostStatus,
  WPPostStatusParameters,
  RequestOptions,
} from "./types";
import type { AuthResponse } from "../../../auth";
import { WPPaginatedResponse } from "../types";
import { createPaginationHelpers } from "../utils";
import { apiGet, extractPaginationInfo, makeApiRequest } from "../http";

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
      const response = await makeApiRequest({
        baseUrl,
        path: BASE_PATH,
        params,
        auth,
        signal: options?.signal,
      });

      const items: Record<string, WPPostStatus> =
        await response.json();
      // Convert record to array
      const itemsArray = Object.values(items);
      const pagination = extractPaginationInfo(response, params);

      return {
        items: itemsArray,
        pagination: {
          ...pagination,
          total: pagination.total || itemsArray.length,
          totalPages: pagination.totalPages || 1,
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
