import type {
  WPCategory,
  WPCategoryParameters,
  WPCategoryCreate,
  WPCategoryUpdate,
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

/**
 * Base path for WordPress categories API endpoints
 */
const BASE_PATH = "/wp/v2/categories";

/**
 * Categories API endpoints configuration
 */
interface CategoriesEndpointsConfig {
  baseUrl: string;
  auth?: AuthResponse;
}

/**
 * Categories API endpoints
 */
export const createCategoryEndpoints = ({
  baseUrl,
  auth,
}: CategoriesEndpointsConfig) => {
  const endpoints = {
    /**
     * Get a list of categories
     * @param params Optional parameters to filter, sort and paginate the categories
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with an array of categories
     * @example
     * // Get all categories
     * const categories = await api.categories.list();
     *
     * // Get categories with specific parameters
     * const categories = await api.categories.list({ per_page: 100, orderby: 'name' });
     *
     * // Get categories with abort signal
     * const controller = new AbortController();
     * const categories = await api.categories.list({}, { signal: controller.signal });
     */
    list: async (
      params?: WPCategoryParameters,
      options?: RequestOptions
    ): Promise<WPPaginatedResponse<WPCategory>> => {
      return apiGetPaginated<WPCategory>(
        baseUrl,
        BASE_PATH,
        params,
        auth,
        options?.signal
      );
    },

    /**
     * Get all categories by automatically handling pagination
     * @param params Optional parameters to filter and sort categories (page and per_page will be overridden)
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with an array of all matching categories
     * @example
     * // Get all categories
     * const allCategories = await api.categories.listAll();
     *
     * // Get all child categories of a specific parent
     * const allCategories = await api.categories.listAll({ parent: 123 });
     *
     * // Get all with abort signal
     * const controller = new AbortController();
     * const allCategories = await api.categories.listAll({}, { signal: controller.signal });
     */
    listAll: async (
      params?: Omit<WPCategoryParameters, "page" | "per_page">,
      options?: RequestOptions
    ): Promise<WPCategory[]> => {
      const allCategories: WPCategory[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await endpoints.list(
          {
            ...params,
            page: currentPage,
            per_page: 100, // Maximum allowed by WordPress
          },
          options
        );

        allCategories.push(...response.items);
        hasMore = response.pagination.hasMore;
        currentPage++;
      }

      return allCategories;
    },

    /**
     * Create an async iterator to process categories page by page
     * @param params Optional parameters to filter and sort categories
     * @param options Optional request options (e.g., signal for aborting)
     * @returns AsyncIterator that yields each page of categories with pagination info
     * @example
     * // Process all categories page by page
     * for await (const page of api.categories.pages()) {
     *   console.log(`Processing page ${page.pagination.currentPage} of ${page.pagination.totalPages}`);
     *   for (const category of page.items) {
     *     // Process each category
     *   }
     * }
     */
    pages: (params?: WPCategoryParameters, options?: RequestOptions) => ({
      async *[Symbol.asyncIterator]() {
        let currentPage = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await endpoints.list(
            {
              ...params,
              page: currentPage,
            },
            options
          );

          yield response;
          hasMore = response.pagination.hasMore;
          currentPage++;
        }
      },
    }),

    /**
     * Get a single category by ID
     * @param id The category ID
     * @param context Optional context to determine fields in response
     * @param embed Whether to embed related resources
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the category data
     * @example
     * // Get category with ID 123
     * const category = await api.categories.get(123);
     *
     * // Get category with embedded data
     * const category = await api.categories.get(123, 'view', true);
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const category = await api.categories.get(123, 'view', false, { signal: controller.signal });
     */
    get: async (
      id: number,
      context: "view" | "embed" | "edit" = "view",
      embed: boolean = false,
      options?: RequestOptions
    ): Promise<WPCategory> => {
      const params = { context, ...(embed && { _embed: true }) };
      return apiGet<WPCategory>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        params,
        auth,
        options?.signal
      );
    },

    /**
     * Create a new category
     * @param data The category data
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the created category data
     * @example
     * // Create a new category
     * const category = await api.categories.create({
     *   name: 'My New Category',
     *   description: 'Category description'
     * });
     *
     * // Create with abort signal
     * const controller = new AbortController();
     * const category = await api.categories.create(
     *   { name: 'New Category' },
     *   { signal: controller.signal }
     * );
     */
    create: async (
      data: WPCategoryCreate,
      options?: RequestOptions
    ): Promise<WPCategory> => {
      return apiPost<WPCategory>(
        baseUrl,
        BASE_PATH,
        data,
        auth,
        options?.signal
      );
    },

    /**
     * Update an existing category
     * @param id The category ID to update
     * @param data The category data to update
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the updated category data
     * @example
     * // Update category name
     * const category = await api.categories.update(123, { name: 'Updated Name' });
     *
     * // Update with abort signal
     * const controller = new AbortController();
     * const category = await api.categories.update(
     *   123,
     *   { name: 'Updated Name' },
     *   { signal: controller.signal }
     * );
     */
    update: async (
      id: number,
      data: WPCategoryUpdate,
      options?: RequestOptions
    ): Promise<WPCategory> => {
      return apiPut<WPCategory>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        data,
        auth,
        options?.signal
      );
    },

    /**
     * Delete a category
     * @param id The category ID to delete
     * @param force Whether to bypass trash and force deletion
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the deleted category data
     * @example
     * // Delete category
     * await api.categories.delete(123);
     *
     * // Delete with abort signal
     * const controller = new AbortController();
     * await api.categories.delete(123, false, { signal: controller.signal });
     */
    delete: async (
      id: number,
      force: boolean = false,
      options?: RequestOptions
    ): Promise<WPCategory> => {
      const params = force ? { force: true } : undefined;
      return apiDelete<WPCategory>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        params,
        auth,
        options?.signal
      );
    },
  };

  return endpoints;
};
