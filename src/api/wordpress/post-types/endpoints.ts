import type { WPPostType, WPPostTypeParameters, RequestOptions } from "./types";
import type { AuthResponse } from "../../../auth";
import { WPPaginatedResponse } from "../types";
import { createPaginationHelpers } from "../utils";
import { apiGet, makeApiRequest, extractPaginationInfo } from "../http";

/**
 * Base path for WordPress post types API endpoints
 */
const BASE_PATH = "/wp/v2/types";

/**
 * Post Types API endpoints configuration
 */
interface PostTypesEndpointsConfig {
  baseUrl: string;
  auth?: AuthResponse;
}

/**
 * Post Types API endpoints
 */
export const createPostTypesEndpoints = ({
  baseUrl,
  auth,
}: PostTypesEndpointsConfig) => {
  const endpoints = {
    /**
     * Get a list of post types
     * @param params Optional parameters
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with an object of post types
     * @example
     * // Get all post types
     * const postTypes = await api.postTypes.list();
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const postTypes = await api.postTypes.list({}, { signal: controller.signal });
     */
    list: async (
      params?: WPPostTypeParameters,
      options?: RequestOptions
    ): Promise<WPPaginatedResponse<WPPostType>> => {
      const response = await makeApiRequest({
        baseUrl,
        path: BASE_PATH,
        params,
        auth,
        signal: options?.signal,
      });

      const items: Record<string, WPPostType> = await response.json();
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
          hasMore: false, // Post types are always returned in a single page
        },
      };
    },

    /**
     * Get a single post type by slug
     * @param slug The post type slug (e.g., 'post', 'page')
     * @param context Optional context to determine fields in response
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the post type data
     * @example
     * // Get post type information
     * const postType = await api.postTypes.get('post');
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const postType = await api.postTypes.get('post', 'view', { signal: controller.signal });
     */
    get: async (
      slug: string,
      context: "view" | "embed" | "edit" = "view",
      options?: RequestOptions
    ): Promise<WPPostType> => {
      return apiGet<WPPostType>(
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
