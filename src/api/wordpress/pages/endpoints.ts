import type {
  WPPage,
  WPPageParameters,
  WPPageCreate,
  WPPageUpdate,
  RequestOptions,
} from "./types";
import type { WPPaginatedResponse } from "../types";
import type { AuthResponse } from "../../../auth";
import {
  apiGet,
  apiGetPaginated,
  apiPost,
  apiPut,
  apiDelete,
  buildResourcePath,
} from "../http";
import { createPaginationHelpers } from "../utils";

/**
 * Base path for WordPress pages API endpoints
 */
const BASE_PATH = "/wp/v2/pages";

/**
 * Pages API endpoints configuration
 */
interface PagesEndpointsConfig {
  baseUrl: string;
  auth?: AuthResponse;
}

/**
 * Pages API endpoints
 */
export const createPageEndpoints = ({
  baseUrl,
  auth,
}: PagesEndpointsConfig) => {
  const buildPageQueryParams = (params?: WPPageParameters) => {
    if (!params) return undefined;

    const { custom, ...rest } = params;
    return {
      ...rest,
      ...(custom || {}),
    };
  };

  const endpoints = {
    /**
     * Get a list of pages
     * @param params Optional parameters to filter, sort and paginate the pages
     * @param options Optional request options (e.g., AbortSignal)
     * @returns Promise with an array of pages
     * @example
     * // Get all published pages
     * const pages = await api.pages.list();
     *
     * // Get child pages of a specific parent
     * const pages = await api.pages.list({ parent: [123] });
     */
    list: async (
      params?: WPPageParameters,
      options?: RequestOptions
    ): Promise<WPPaginatedResponse<WPPage>> => {
      return apiGetPaginated<WPPage>(
        baseUrl,
        BASE_PATH,
        buildPageQueryParams(params),
        auth,
        options?.signal
      );
    },

    /**
     * Get a single page by ID
     * @param id The page ID
     * @param context Optional context to determine fields in response
     * @param embed Whether to embed related resources
     * @param options Optional request options (e.g., AbortSignal)
     * @returns Promise with the page data
     * @example
     * // Get page with ID 123
     * const page = await api.pages.get(123);
     */
    get: async (
      id: number,
      context: "view" | "embed" | "edit" = "view",
      embed: boolean = false,
      options?: RequestOptions
    ): Promise<WPPage> => {
      const params = { context, ...(embed && { _embed: true }) };
      return apiGet<WPPage>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        params,
        auth,
        options?.signal
      );
    },

    /**
     * Create a new page
     * @param data The page data
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the created page data
     * @example
     * // Create a new page
     * const page = await api.pages.create({
     *   title: 'My New Page',
     *   content: 'Page content here',
     *   status: 'publish'
     * });
     *
     * // Create with abort signal
     * const controller = new AbortController();
     * const page = await api.pages.create(
     *   { title: 'Page Title' },
     *   { signal: controller.signal }
     * );
     */
    create: async (
      data: WPPageCreate,
      options?: RequestOptions
    ): Promise<WPPage> => {
      return apiPost<WPPage>(baseUrl, BASE_PATH, data, auth, options?.signal);
    },

    /**
     * Update an existing page
     * @param id The page ID to update
     * @param data The page data to update
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the updated page data
     * @example
     * // Update page title
     * const page = await api.pages.update(123, { title: 'Updated Title' });
     *
     * // Change page template
     * const page = await api.pages.update(123, { template: 'full-width' });
     *
     * // Update with abort signal
     * const controller = new AbortController();
     * const page = await api.pages.update(
     *   123,
     *   { title: 'New Title' },
     *   { signal: controller.signal }
     * );
     */
    update: async (
      id: number,
      data: WPPageUpdate,
      options?: RequestOptions
    ): Promise<WPPage> => {
      return apiPut<WPPage>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        data,
        auth,
        options?.signal
      );
    },

    /**
     * Delete a page
     * @param id The page ID to delete
     * @param force Whether to bypass trash and force deletion
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the deleted page data
     * @example
     * // Move page to trash
     * await api.pages.delete(123);
     *
     * // Permanently delete page
     * await api.pages.delete(123, true);
     *
     * // Delete with abort signal
     * const controller = new AbortController();
     * await api.pages.delete(123, false, { signal: controller.signal });
     */
    delete: async (
      id: number,
      force: boolean = false,
      options?: RequestOptions
    ): Promise<WPPage> => {
      const params = force ? { force: true } : undefined;
      return apiDelete<WPPage>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        params,
        auth,
        options?.signal
      );
    },

    /**
     * Get a list of revisions for a specific page
     * @param id The page ID
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with an array of page revisions
     * @example
     * // Get all revisions for page 123
     * const revisions = await api.pages.getRevisions(123);
     *
     * // Get revisions with abort signal
     * const controller = new AbortController();
     * const revisions = await api.pages.getRevisions(123, { signal: controller.signal });
     */
    getRevisions: async (
      id: number,
      options?: RequestOptions
    ): Promise<WPPage[]> => {
      return apiGet<WPPage[]>(
        baseUrl,
        `${BASE_PATH}/${id}/revisions`,
        {},
        auth,
        options?.signal
      );
    },
  };

  const paginationHelpers = createPaginationHelpers(endpoints.list);
  return {
    ...endpoints,
    ...paginationHelpers,
  };
};
