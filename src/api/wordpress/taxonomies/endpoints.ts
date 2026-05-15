import type { WPTaxonomy, WPTaxonomyParameters, RequestOptions } from "./types";
import type { AuthResponse } from "../../../auth";
import { WPPaginatedResponse } from "../types";
import { createPaginationHelpers } from "../utils";
import { apiGet, makeApiRequest, extractPaginationInfo } from "../http";

/**
 * Base path for WordPress taxonomies API endpoints
 */
const BASE_PATH = "/wp/v2/taxonomies";

/**
 * Taxonomies API endpoints configuration
 */
interface TaxonomiesEndpointsConfig {
  baseUrl: string;
  auth?: AuthResponse;
}

/**
 * Taxonomies API endpoints
 */
export const createTaxonomiesEndpoints = ({
  baseUrl,
  auth,
}: TaxonomiesEndpointsConfig) => {
  const endpoints = {
    /**
     * Get a list of taxonomies
     * @param params Optional parameters to filter the taxonomies
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with an array of taxonomies
     * @example
     * // Get all taxonomies
     * const taxonomies = await api.taxonomies.list();
     *
     * // Get taxonomies for a specific post type
     * const taxonomies = await api.taxonomies.list({ type: 'post' });
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const taxonomies = await api.taxonomies.list({}, { signal: controller.signal });
     */
    list: async (
      params?: WPTaxonomyParameters,
      options?: RequestOptions
    ): Promise<WPPaginatedResponse<WPTaxonomy>> => {
      const response = await makeApiRequest({
        baseUrl,
        path: BASE_PATH,
        params,
        auth,
        signal: options?.signal,
      });

      const items: Record<string, WPTaxonomy> = await response.json();
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
          hasMore: false, // Taxonomies are always returned in a single page
        },
      };
    },

    /**
     * Get a single taxonomy by slug
     * @param slug The taxonomy slug (e.g., 'category', 'post_tag')
     * @param context Optional context to determine fields in response
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the taxonomy data
     * @example
     * // Get category taxonomy
     * const taxonomy = await api.taxonomies.get('category');
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const taxonomy = await api.taxonomies.get('category', 'view', { signal: controller.signal });
     */
    get: async (
      slug: string,
      context: "view" | "embed" | "edit" = "view",
      options?: RequestOptions
    ): Promise<WPTaxonomy> => {
      return apiGet<WPTaxonomy>(
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
