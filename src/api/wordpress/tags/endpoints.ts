import type {
  WPTag,
  WPTagParameters,
  WPTagCreate,
  WPTagUpdate,
  RequestOptions,
} from "./types";
import type { AuthResponse } from "../../../auth";
import { WPPaginatedResponse } from "../types";
import { createPaginationHelpers } from "../utils";
import {
  apiGet,
  apiGetPaginated,
  apiPost,
  apiPut,
  apiDelete,
  buildResourcePath,
} from "../http";

/**
 * Base path for WordPress tags API endpoints
 */
const BASE_PATH = "/wp/v2/tags";

/**
 * Tags API endpoints configuration
 */
interface TagsEndpointsConfig {
  baseUrl: string;
  auth?: AuthResponse;
}

/**
 * Tags API endpoints
 */
export const createTagsEndpoints = ({ baseUrl, auth }: TagsEndpointsConfig) => {
  const endpoints = {
    /**
     * Get a list of tags
     * @param params Optional parameters to filter, sort and paginate the tags
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with an array of tags
     * @example
     * // Get all tags
     * const tags = await api.tags.list();
     *
     * // Get tags with specific parameters
     * const tags = await api.tags.list({ per_page: 100, orderby: 'name' });
     *
     * // Get tags with abort signal
     * const controller = new AbortController();
     * const tags = await api.tags.list({}, { signal: controller.signal });
     */
    list: async (
      params?: WPTagParameters,
      options?: RequestOptions
    ): Promise<WPPaginatedResponse<WPTag>> => {
      return apiGetPaginated<WPTag>(
        baseUrl,
        BASE_PATH,
        params,
        auth,
        options?.signal
      );
    },

    /**
     * Get a single tag by ID
     * @param id The tag ID
     * @param context Optional context to determine fields in response
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the tag data
     * @example
     * // Get tag with ID 123
     * const tag = await api.tags.get(123);
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const tag = await api.tags.get(123, 'view', { signal: controller.signal });
     */
    get: async (
      id: number,
      context: "view" | "embed" | "edit" = "view",
      options?: RequestOptions
    ): Promise<WPTag> => {
      return apiGet<WPTag>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        { context },
        auth,
        options?.signal
      );
    },

    /**
     * Create a new tag
     * @param data The tag data
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the created tag data
     * @example
     * // Create a new tag
     * const tag = await api.tags.create({
     *   name: 'My New Tag',
     *   description: 'Tag description'
     * });
     *
     * // Create with abort signal
     * const controller = new AbortController();
     * const tag = await api.tags.create(
     *   { name: 'New Tag' },
     *   { signal: controller.signal }
     * );
     */
    create: async (
      data: WPTagCreate,
      options?: RequestOptions
    ): Promise<WPTag> => {
      return apiPost<WPTag>(baseUrl, BASE_PATH, data, auth, options?.signal);
    },

    /**
     * Update an existing tag
     * @param id The tag ID to update
     * @param data The tag data to update
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the updated tag data
     * @example
     * // Update tag name
     * const tag = await api.tags.update(123, { name: 'Updated Name' });
     *
     * // Update with abort signal
     * const controller = new AbortController();
     * const tag = await api.tags.update(
     *   123,
     *   { name: 'Updated Name' },
     *   { signal: controller.signal }
     * );
     */
    update: async (
      id: number,
      data: WPTagUpdate,
      options?: RequestOptions
    ): Promise<WPTag> => {
      return apiPut<WPTag>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        data,
        auth,
        options?.signal
      );
    },

    /**
     * Delete a tag
     * @param id The tag ID to delete
     * @param force Whether to bypass trash and force deletion
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the deleted tag data
     * @example
     * // Delete tag
     * await api.tags.delete(123);
     *
     * // Delete with abort signal
     * const controller = new AbortController();
     * await api.tags.delete(123, false, { signal: controller.signal });
     */
    delete: async (
      id: number,
      force: boolean = false,
      options?: RequestOptions
    ): Promise<WPTag> => {
      const params = force ? { force: true } : undefined;
      return apiDelete<WPTag>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        params,
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
