import type {
  WPUser,
  WPUserParameters,
  WPUserCreate,
  WPUserUpdate,
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
 * Base path for WordPress users API endpoints
 */
const BASE_PATH = "/wp/v2/users";

/**
 * Users API endpoints configuration
 */
interface UsersEndpointsConfig {
  baseUrl: string;
  auth?: AuthResponse;
}

/**
 * Users API endpoints
 */
export const createUsersEndpoints = ({
  baseUrl,
  auth,
}: UsersEndpointsConfig) => {
  const endpoints = {
    /**
     * Get a list of users
     * @param params Optional parameters to filter, sort and paginate the users
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with an array of users
     * @example
     * // Get all users
     * const users = await api.users.list();
     *
     * // Get only authors
     * const authors = await api.users.list({ who: 'authors' });
     *
     * // Get users with abort signal
     * const controller = new AbortController();
     * const users = await api.users.list({}, { signal: controller.signal });
     */
    list: async (
      params?: WPUserParameters,
      options?: RequestOptions
    ): Promise<WPPaginatedResponse<WPUser>> => {
      return apiGetPaginated<WPUser>(
        baseUrl,
        BASE_PATH,
        params,
        auth,
        options?.signal
      );
    },

    /**
     * Get a single user by ID
     * @param id The user ID
     * @param context Optional context to determine fields in response
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the user data
     * @example
     * // Get user with ID 123
     * const user = await api.users.get(123);
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const user = await api.users.get(123, 'view', { signal: controller.signal });
     */
    get: async (
      id: number,
      context: "view" | "embed" | "edit" = "view",
      options?: RequestOptions
    ): Promise<WPUser> => {
      return apiGet<WPUser>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        { context },
        auth,
        options?.signal
      );
    },

    /**
     * Create a new user
     * @param data The user data
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the created user data
     * @example
     * // Create a new user
     * const user = await api.users.create({
     *   username: 'newuser',
     *   email: 'user@example.com',
     *   password: 'secure_password',
     *   roles: ['author']
     * });
     *
     * // Create with abort signal
     * const controller = new AbortController();
     * const user = await api.users.create(
     *   { username: 'newuser', email: 'user@example.com', password: 'pass' },
     *   { signal: controller.signal }
     * );
     */
    create: async (
      data: WPUserCreate,
      options?: RequestOptions
    ): Promise<WPUser> => {
      return apiPost<WPUser>(baseUrl, BASE_PATH, data, auth, options?.signal);
    },

    /**
     * Update an existing user
     * @param id The user ID to update
     * @param data The user data to update
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the updated user data
     * @example
     * // Update user's display name
     * const user = await api.users.update(123, { name: 'New Display Name' });
     *
     * // Update with abort signal
     * const controller = new AbortController();
     * const user = await api.users.update(
     *   123,
     *   { name: 'New Name' },
     *   { signal: controller.signal }
     * );
     */
    update: async (
      id: number,
      data: WPUserUpdate,
      options?: RequestOptions
    ): Promise<WPUser> => {
      return apiPut<WPUser>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        data,
        auth,
        options?.signal
      );
    },

    /**
     * Delete a user
     * @param id The user ID to delete
     * @param reassign Optional user ID to reassign posts to
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the deleted user data
     * @example
     * // Delete user and reassign their posts to user 456
     * await api.users.delete(123, 456);
     *
     * // Delete with abort signal
     * const controller = new AbortController();
     * await api.users.delete(123, 456, { signal: controller.signal });
     */
    delete: async (
      id: number,
      reassign?: number,
      options?: RequestOptions
    ): Promise<WPUser> => {
      const params = reassign ? { reassign } : undefined;
      return apiDelete<WPUser>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        params,
        auth,
        options?.signal
      );
    },

    /**
     * Get the current logged-in user
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the current user data
     * @example
     * // Get current user
     * const me = await api.users.me();
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const me = await api.users.me({ signal: controller.signal });
     */
    me: async (options?: RequestOptions): Promise<WPUser> => {
      return apiGet<WPUser>(
        baseUrl,
        `${BASE_PATH}/me`,
        {},
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
