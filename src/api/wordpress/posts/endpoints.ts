import type {
  WPPost,
  WPPostParameters,
  WPPostCreate,
  WPPostUpdate,
  RequestOptions,
} from "./types";
import type { AuthResponse } from "../../../auth";
import { WPPaginatedResponse } from "../types";
import {
  apiGet,
  apiGetPaginated,
  apiPost,
  apiPut,
  apiDelete,
  buildResourcePath,
} from "../http";

/**
 * Base path for WordPress posts API endpoints
 */
const BASE_PATH = "/wp/v2/posts";

/**
 * Posts API endpoints configuration
 */
interface PostsEndpointsConfig {
  baseUrl: string;
  auth?: AuthResponse;
}

/**
 * Posts API endpoints
 */
export const createPostsEndpoints = ({
  baseUrl,
  auth,
}: PostsEndpointsConfig) => {
  const buildPostQueryParams = (params?: WPPostParameters) => {
    if (!params) return undefined;

    const { taxonomies, custom, ...rest } = params;
    return {
      ...rest,
      ...(taxonomies || {}),
      ...(custom || {}),
    };
  };

  const endpoints = {
    /**
     * Get a list of posts
     * @param params Optional parameters to filter, sort and paginate the posts
     * @param options Optional request options (e.g., AbortSignal)
     * @returns Promise with an array of posts
     * @example
     * // Get all published posts
     * const posts = await api.posts.list();
     *
     * // Get 10 latest posts
     * const posts = await api.posts.list({ per_page: 10, orderby: 'date', order: 'desc' });
     *
     * // Get posts from a specific category
     * const posts = await api.posts.list({ categories: [123] });
     *
     * // Filter by custom taxonomy (e.g. language)
     * const englishPosts = await api.posts.list({
     *   taxonomies: { language: 'en' },
     * });
     *
     * // Get only specific fields from posts
     * const posts = await api.posts.list({ _fields: ['id', 'title', 'content'] });
     *
     * // With abort signal to cancel the request
     * const controller = new AbortController();
     * const posts = await api.posts.list({}, { signal: controller.signal });
     * // Later: controller.abort();
     */
    list: async (
      params?: WPPostParameters,
      options?: RequestOptions
    ): Promise<WPPaginatedResponse<WPPost>> => {
      return apiGetPaginated<WPPost>(
        baseUrl,
        BASE_PATH,
        buildPostQueryParams(params),
        auth,
        options?.signal
      );
    },

    /**
     * Get all posts by automatically handling pagination
     * @param params Optional parameters to filter and sort posts (page and per_page will be overridden)
     * @param options Optional request options (e.g., AbortSignal)
     * @returns Promise with an array of all matching posts
     * @example
     * // Get all published posts
     * const allPosts = await api.posts.listAll();
     *
     * // Get all posts from a specific category
     * const allPosts = await api.posts.listAll({ categories: [123] });
     *
     * // With abort signal
     * const controller = new AbortController();
     * const allPosts = await api.posts.listAll({}, { signal: controller.signal });
     */
    listAll: async (
      params?: Omit<WPPostParameters, "page" | "per_page">,
      options?: RequestOptions
    ): Promise<WPPost[]> => {
      const allPosts: WPPost[] = [];
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

        allPosts.push(...response.items);
        hasMore = response.pagination.hasMore;
        currentPage++;
      }

      return allPosts;
    },

    /**
     * Create an async iterator to process posts page by page
     * @param params Optional parameters to filter and sort posts
     * @param options Optional request options (e.g., AbortSignal)
     * @returns AsyncIterator that yields each page of posts with pagination info
     * @example
     * // Process all posts page by page
     * for await (const page of api.posts.pages()) {
     *   console.log(`Processing page ${page.pagination.currentPage} of ${page.pagination.totalPages}`);
     *   for (const post of page.items) {
     *     // Process each post
     *   }
     * }
     *
     * // With abort signal
     * const controller = new AbortController();
     * for await (const page of api.posts.pages({}, { signal: controller.signal })) {
     *   // Process page...
     * }
     */
    pages: (params?: WPPostParameters, options?: RequestOptions) => ({
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
     * Get a single post by ID
     * @param id The post ID
     * @param context Optional context to determine fields in response
     * @param embed Whether to embed related resources like author, featured media, etc.
     * @param options Optional request options (e.g., AbortSignal)
     * @returns Promise with the post data
     * @example
     * // Get post with ID 123
     * const post = await api.posts.get(123);
     *
     * // Get post with edit context (includes raw content)
     * const post = await api.posts.get(123, 'edit');
     *
     * // Get post with embedded related resources
     * const post = await api.posts.get(123, 'view', true);
     *
     * // With abort signal
     * const controller = new AbortController();
     * const post = await api.posts.get(123, 'view', false, { signal: controller.signal });
     */
    get: async (
      id: number,
      context: "view" | "embed" | "edit" = "view",
      embed: boolean = false,
      options?: RequestOptions
    ): Promise<WPPost> => {
      const params = { context, ...(embed && { _embed: true }) };
      return apiGet<WPPost>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        params,
        auth,
        options?.signal
      );
    },

    /**
     * Create a new post
     * @param data The post data
     * @param options Optional request options (e.g., AbortSignal)
     * @returns Promise with the created post data
     * @example
     * // Create a new draft post
     * const post = await api.posts.create({
     *   title: 'My New Post',
     *   content: 'Post content here',
     *   status: 'draft'
     * });
     *
     * // With abort signal
     * const controller = new AbortController();
     * const post = await api.posts.create({ title: 'New Post' }, { signal: controller.signal });
     */
    create: async (
      data: WPPostCreate,
      options?: RequestOptions
    ): Promise<WPPost> => {
      return apiPost<WPPost>(baseUrl, BASE_PATH, data, auth, options?.signal);
    },

    /**
     * Update an existing post
     * @param id The post ID to update
     * @param data The post data to update
     * @param options Optional request options (e.g., AbortSignal)
     * @returns Promise with the updated post data
     * @example
     * // Update post title
     * const post = await api.posts.update(123, { title: 'Updated Title' });
     *
     * // Publish a draft post
     * const post = await api.posts.update(123, { status: 'publish' });
     *
     * // With abort signal
     * const controller = new AbortController();
     * const post = await api.posts.update(123, { title: 'Updated' }, { signal: controller.signal });
     */
    update: async (
      id: number,
      data: WPPostUpdate,
      options?: RequestOptions
    ): Promise<WPPost> => {
      return apiPut<WPPost>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        data,
        auth,
        options?.signal
      );
    },

    /**
     * Delete a post
     * @param id The post ID to delete
     * @param force Whether to bypass trash and force deletion
     * @param options Optional request options (e.g., AbortSignal)
     * @returns Promise with the deleted post data
     * @example
     * // Move post to trash
     * await api.posts.delete(123);
     *
     * // Permanently delete post
     * await api.posts.delete(123, true);
     *
     * // With abort signal
     * const controller = new AbortController();
     * await api.posts.delete(123, false, { signal: controller.signal });
     */
    delete: async (
      id: number,
      force: boolean = false,
      options?: RequestOptions
    ): Promise<WPPost> => {
      const params = force ? { force: true } : undefined;
      return apiDelete<WPPost>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        params,
        auth,
        options?.signal
      );
    },

    /**
     * Get a list of revisions for a specific post
     * @param id The post ID
     * @param options Optional request options (e.g., AbortSignal)
     * @returns Promise with an array of post revisions
     * @example
     * // Get all revisions for post 123
     * const revisions = await api.posts.getRevisions(123);
     *
     * // With abort signal
     * const controller = new AbortController();
     * const revisions = await api.posts.getRevisions(123, { signal: controller.signal });
     */
    getRevisions: async (
      id: number,
      options?: RequestOptions
    ): Promise<WPPost[]> => {
      return apiGet<WPPost[]>(
        baseUrl,
        `${BASE_PATH}/${id}/revisions`,
        {},
        auth,
        options?.signal
      );
    },
  };

  return endpoints;
};
