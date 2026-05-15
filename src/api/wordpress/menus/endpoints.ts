import type {
  WPMenu,
  WPMenuItem,
  WPMenuParameters,
  WPMenuItemParameters,
  WPMenuCreate,
  WPMenuUpdate,
  WPMenuItemCreate,
  WPMenuItemUpdate,
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
 * Base paths for WordPress menus API endpoints
 */
const MENUS_PATH = "/wp/v2/menus";
const MENU_ITEMS_PATH = "/wp/v2/menu-items";

/**
 * Menus API endpoints configuration
 */
interface MenusEndpointsConfig {
  baseUrl: string;
  auth?: AuthResponse;
}

/**
 * Menus API endpoints
 */
interface MenuBaseEndpoints {
  list: (
    params?: WPMenuParameters,
    options?: RequestOptions
  ) => Promise<WPPaginatedResponse<WPMenu>>;
  get: (
    id: number,
    context?: "view" | "embed" | "edit",
    embed?: boolean,
    options?: RequestOptions
  ) => Promise<WPMenu>;
  create: (data: WPMenuCreate, options?: RequestOptions) => Promise<WPMenu>;
  update: (
    id: number,
    data: WPMenuUpdate,
    options?: RequestOptions
  ) => Promise<WPMenu>;
  delete: (id: number, options?: RequestOptions) => Promise<WPMenu>;
  items: {
    list: (
      params?: WPMenuItemParameters,
      options?: RequestOptions
    ) => Promise<WPPaginatedResponse<WPMenuItem>>;
    get: (
      id: number,
      context?: "view" | "embed" | "edit",
      embed?: boolean,
      options?: RequestOptions
    ) => Promise<WPMenuItem>;
    create: (
      data: WPMenuItemCreate,
      options?: RequestOptions
    ) => Promise<WPMenuItem>;
    update: (
      id: number,
      data: WPMenuItemUpdate,
      options?: RequestOptions
    ) => Promise<WPMenuItem>;
    delete: (id: number, options?: RequestOptions) => Promise<WPMenuItem>;
  };
}

export const createMenuEndpoints = ({
  baseUrl,
  auth,
}: MenusEndpointsConfig) => {
  const endpoints: MenuBaseEndpoints = {
    /**
     * Get a list of menus
     * @param params Optional parameters to filter, sort and paginate the menus
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with an array of menus
     * @example
     * // Get all menus
     * const menus = await api.menus.list();
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const menus = await api.menus.list({}, { signal: controller.signal });
     */
    list: async (
      params?: WPMenuParameters,
      options?: RequestOptions
    ): Promise<WPPaginatedResponse<WPMenu>> => {
      return apiGetPaginated<WPMenu>(
        baseUrl,
        MENUS_PATH,
        params,
        auth,
        options?.signal
      );
    },

    /**
     * Get a single menu by ID
     * @param id The menu ID
     * @param context Optional context to determine fields in response
     * @param embed Whether to embed related resources
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the menu data
     * @example
     * // Get menu with ID 123
     * const menu = await api.menus.get(123);
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const menu = await api.menus.get(123, 'view', false, { signal: controller.signal });
     */
    get: async (
      id: number,
      context: "view" | "embed" | "edit" = "view",
      embed: boolean = false,
      options?: RequestOptions
    ): Promise<WPMenu> => {
      const params = { context, ...(embed && { _embed: true }) };
      return apiGet<WPMenu>(
        baseUrl,
        buildResourcePath(MENUS_PATH, id),
        params,
        auth,
        options?.signal
      );
    },

    /**
     * Create a new menu
     * @param data The menu data
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the created menu data
     * @example
     * // Create a new menu
     * const menu = await api.menus.create({
     *   name: 'Main Menu',
     *   locations: ['primary']
     * });
     *
     * // Create with abort signal
     * const controller = new AbortController();
     * const menu = await api.menus.create(
     *   { name: 'Main Menu' },
     *   { signal: controller.signal }
     * );
     */
    create: async (
      data: WPMenuCreate,
      options?: RequestOptions
    ): Promise<WPMenu> => {
      return apiPost<WPMenu>(baseUrl, MENUS_PATH, data, auth, options?.signal);
    },

    /**
     * Update an existing menu
     * @param id The menu ID to update
     * @param data The menu data to update
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the updated menu data
     * @example
     * // Update menu name
     * const menu = await api.menus.update(123, { name: 'Updated Menu Name' });
     *
     * // Update with abort signal
     * const controller = new AbortController();
     * const menu = await api.menus.update(
     *   123,
     *   { name: 'Updated Name' },
     *   { signal: controller.signal }
     * );
     */
    update: async (
      id: number,
      data: WPMenuUpdate,
      options?: RequestOptions
    ): Promise<WPMenu> => {
      return apiPut<WPMenu>(
        baseUrl,
        buildResourcePath(MENUS_PATH, id),
        data,
        auth,
        options?.signal
      );
    },

    /**
     * Delete a menu
     * @param id The menu ID to delete
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the deleted menu data
     * @example
     * // Delete menu
     * await api.menus.delete(123);
     *
     * // Delete with abort signal
     * const controller = new AbortController();
     * await api.menus.delete(123, { signal: controller.signal });
     */
    delete: async (id: number, options?: RequestOptions): Promise<WPMenu> => {
      return apiDelete<WPMenu>(
        baseUrl,
        buildResourcePath(MENUS_PATH, id),
        undefined,
        auth,
        options?.signal
      );
    },

    items: {
      /**
       * Get a list of menu items
       * @param params Optional parameters to filter, sort and paginate the menu items
       * @param options Optional request options (e.g., signal for aborting)
       * @returns Promise with an array of menu items
       * @example
       * // Get all items from menu 123
       * const items = await api.menus.items.list({ menus: [123] });
       *
       * // Get with abort signal
       * const controller = new AbortController();
       * const items = await api.menus.items.list({ menus: [123] }, { signal: controller.signal });
       */
      list: async (
        params?: WPMenuItemParameters,
        options?: RequestOptions
      ): Promise<WPPaginatedResponse<WPMenuItem>> => {
        return apiGetPaginated<WPMenuItem>(
          baseUrl,
          MENU_ITEMS_PATH,
          params,
          auth,
          options?.signal
        );
      },

      /**
       * Get a single menu item by ID
       * @param id The menu item ID
       * @param context Optional context to determine fields in response
       * @param embed Whether to embed related resources
       * @param options Optional request options (e.g., signal for aborting)
       * @returns Promise with the menu item data
       * @example
       * // Get menu item with ID 456
       * const item = await api.menus.items.get(456);
       *
       * // Get with abort signal
       * const controller = new AbortController();
       * const item = await api.menus.items.get(456, 'view', false, { signal: controller.signal });
       */
      get: async (
        id: number,
        context: "view" | "embed" | "edit" = "view",
        embed: boolean = false,
        options?: RequestOptions
      ): Promise<WPMenuItem> => {
        const params = { context, ...(embed && { _embed: true }) };
        return apiGet<WPMenuItem>(
          baseUrl,
          buildResourcePath(MENU_ITEMS_PATH, id),
          params,
          auth,
          options?.signal
        );
      },

      /**
       * Create a new menu item
       * @param data The menu item data
       * @param options Optional request options (e.g., signal for aborting)
       * @returns Promise with the created menu item data
       * @example
       * // Create a new menu item
       * const item = await api.menus.items.create({
       *   title: 'Home',
       *   menu_id: 123,
       *   url: '/',
       *   type: 'custom'
       * });
       *
       * // Create with abort signal
       * const controller = new AbortController();
       * const item = await api.menus.items.create(
       *   { title: 'Home', menu_id: 123, url: '/', type: 'custom' },
       *   { signal: controller.signal }
       * );
       */
      create: async (
        data: WPMenuItemCreate,
        options?: RequestOptions
      ): Promise<WPMenuItem> => {
        return apiPost<WPMenuItem>(
          baseUrl,
          MENU_ITEMS_PATH,
          data,
          auth,
          options?.signal
        );
      },

      /**
       * Update an existing menu item
       * @param id The menu item ID to update
       * @param data The menu item data to update
       * @param options Optional request options (e.g., signal for aborting)
       * @returns Promise with the updated menu item data
       * @example
       * // Update menu item title
       * const item = await api.menus.items.update(456, { title: 'New Title' });
       *
       * // Update with abort signal
       * const controller = new AbortController();
       * const item = await api.menus.items.update(
       *   456,
       *   { title: 'New Title' },
       *   { signal: controller.signal }
       * );
       */
      update: async (
        id: number,
        data: WPMenuItemUpdate,
        options?: RequestOptions
      ): Promise<WPMenuItem> => {
        return apiPut<WPMenuItem>(
          baseUrl,
          buildResourcePath(MENU_ITEMS_PATH, id),
          data,
          auth,
          options?.signal
        );
      },

      /**
       * Delete a menu item
       * @param id The menu item ID to delete
       * @param options Optional request options (e.g., signal for aborting)
       * @returns Promise with the deleted menu item data
       * @example
       * // Delete menu item
       * await api.menus.items.delete(456);
       *
       * // Delete with abort signal
       * const controller = new AbortController();
       * await api.menus.items.delete(456, { signal: controller.signal });
       */
      delete: async (
        id: number,
        options?: RequestOptions
      ): Promise<WPMenuItem> => {
        return apiDelete<WPMenuItem>(
          baseUrl,
          buildResourcePath(MENU_ITEMS_PATH, id),
          undefined,
          auth,
          options?.signal
        );
      },
    },
  };

  const menuPaginationHelpers = createPaginationHelpers(endpoints.list);
  const itemPaginationHelpers = createPaginationHelpers(endpoints.items.list);

  return {
    ...endpoints,
    ...menuPaginationHelpers,
    items: {
      ...endpoints.items,
      ...itemPaginationHelpers,
    },
  };
};
