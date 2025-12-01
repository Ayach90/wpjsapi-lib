import type { WPPostType, WPPostTypeParameters, RequestOptions } from "./types";
import type { AuthResponse } from "../../../auth";
import { WPPaginatedResponse } from "../types";
import { createPaginationHelpers } from "../utils";
import { apiGet } from "../http";
import { handleApiError } from "../errors";

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

      const items: Record<string, WPPostType> = await processedResponse.json();
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
