import type {
  WPComment,
  WPCommentParameters,
  WPCommentCreate,
  WPCommentUpdate,
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
 * Base path for WordPress comments API endpoints
 */
const BASE_PATH = "/wp/v2/comments";

/**
 * Comments API endpoints configuration
 */
interface CommentsEndpointsConfig {
  baseUrl: string;
  auth?: AuthResponse;
}

/**
 * Comments API endpoints
 */
export const createCommentsEndpoints = ({
  baseUrl,
  auth,
}: CommentsEndpointsConfig) => {
  const endpoints = {
    /**
     * Get a list of comments
     * @param params Optional parameters to filter, sort and paginate the comments
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with an array of comments
     * @example
     * // Get all approved comments
     * const comments = await api.comments.list({ status: 'approve' });
     *
     * // Get comments for a specific post
     * const comments = await api.comments.list({ post: [123] });
     *
     * // Get comments with abort signal
     * const controller = new AbortController();
     * const comments = await api.comments.list({}, { signal: controller.signal });
     */
    list: async (
      params?: WPCommentParameters,
      options?: RequestOptions
    ): Promise<WPPaginatedResponse<WPComment>> => {
      return apiGetPaginated<WPComment>(
        baseUrl,
        BASE_PATH,
        params,
        auth,
        options?.signal
      );
    },

    /**
     * Get a single comment by ID
     * @param id The comment ID
     * @param context Optional context to determine fields in response
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the comment data
     * @example
     * // Get comment with ID 123
     * const comment = await api.comments.get(123);
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const comment = await api.comments.get(123, 'view', { signal: controller.signal });
     */
    get: async (
      id: number,
      context: "view" | "embed" | "edit" = "view",
      options?: RequestOptions
    ): Promise<WPComment> => {
      return apiGet<WPComment>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        { context },
        auth,
        options?.signal
      );
    },

    /**
     * Create a new comment
     * @param data The comment data
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the created comment data
     * @example
     * // Create a new comment
     * const comment = await api.comments.create({
     *   post: 123,
     *   content: 'Great article!',
     *   author_name: 'John Doe',
     *   author_email: 'john@example.com'
     * });
     *
     * // Create with abort signal
     * const controller = new AbortController();
     * const comment = await api.comments.create(
     *   { post: 123, content: 'Great!' },
     *   { signal: controller.signal }
     * );
     */
    create: async (
      data: WPCommentCreate,
      options?: RequestOptions
    ): Promise<WPComment> => {
      return apiPost<WPComment>(
        baseUrl,
        BASE_PATH,
        data,
        auth,
        options?.signal
      );
    },

    /**
     * Update an existing comment
     * @param id The comment ID to update
     * @param data The comment data to update
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the updated comment data
     * @example
     * // Update comment content
     * const comment = await api.comments.update(123, { content: 'Updated comment' });
     *
     * // Approve a comment
     * const comment = await api.comments.update(123, { status: 'approve' });
     *
     * // Update with abort signal
     * const controller = new AbortController();
     * const comment = await api.comments.update(
     *   123,
     *   { content: 'Updated' },
     *   { signal: controller.signal }
     * );
     */
    update: async (
      id: number,
      data: WPCommentUpdate,
      options?: RequestOptions
    ): Promise<WPComment> => {
      return apiPut<WPComment>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        data,
        auth,
        options?.signal
      );
    },

    /**
     * Delete a comment
     * @param id The comment ID to delete
     * @param force Whether to bypass trash and force deletion
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the deleted comment data
     * @example
     * // Move comment to trash
     * await api.comments.delete(123);
     *
     * // Permanently delete comment
     * await api.comments.delete(123, true);
     *
     * // Delete with abort signal
     * const controller = new AbortController();
     * await api.comments.delete(123, false, { signal: controller.signal });
     */
    delete: async (
      id: number,
      force: boolean = false,
      options?: RequestOptions
    ): Promise<WPComment> => {
      const params = force ? { force: true } : undefined;
      return apiDelete<WPComment>(
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
