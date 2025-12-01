import type { WPTaxonomy, WPTaxonomyParameters, RequestOptions } from "./types";
import type { AuthResponse } from "../../../auth";
import { WPPaginatedResponse } from "../types";
import { createPaginationHelpers } from "../utils";
import { handleApiError } from "../errors";
import { apiGet } from "../http";

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

      const items: Record<string, WPTaxonomy> = await processedResponse.json();
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
