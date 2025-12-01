import type {
  WPMedia,
  WPMediaParameters,
  WPMediaCreate,
  WPMediaUpdate,
  RequestOptions,
} from "./types";
import type { AuthResponse } from "../../../auth";
import { WPPaginatedResponse } from "../types";
import { createPaginationHelpers } from "../utils";
import { handleApiError } from "../errors";
import { apiGet, apiGetPaginated, apiPut, apiDelete, buildResourcePath } from "../http";

/**
 * Base path for WordPress media API endpoints
 */
const BASE_PATH = "/wp/v2/media";

/**
 * Media API endpoints configuration
 */
interface MediaEndpointsConfig {
  baseUrl: string;
  auth?: AuthResponse;
}

/**
 * Media API endpoints
 */
export const createMediaEndpoints = ({
  baseUrl,
  auth,
}: MediaEndpointsConfig) => {
  const endpoints = {
    /**
     * Get a list of media items
     * @param params Optional parameters to filter, sort and paginate the media items
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with an array of media items
     * @example
     * // Get all media
     * const media = await api.media.list();
     *
     * // Get only images
     * const images = await api.media.list({ media_type: 'image' });
     *
     * // Get media with abort signal
     * const controller = new AbortController();
     * const media = await api.media.list({}, { signal: controller.signal });
     */
    list: async (
      params?: WPMediaParameters,
      options?: RequestOptions
    ): Promise<WPPaginatedResponse<WPMedia>> => {
      return apiGetPaginated<WPMedia>(
        baseUrl,
        BASE_PATH,
        params,
        auth,
        options?.signal
      );
    },

    /**
     * Get a single media item by ID
     * @param id The media ID
     * @param context Optional context to determine fields in response
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the media item data
     * @example
     * // Get media with ID 123
     * const media = await api.media.get(123);
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const media = await api.media.get(123, 'view', { signal: controller.signal });
     */
    get: async (
      id: number,
      context: "view" | "embed" | "edit" = "view",
      options?: RequestOptions
    ): Promise<WPMedia> => {
      return apiGet<WPMedia>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        { context },
        auth,
        options?.signal
      );
    },

    /**
     * Create a new media item
     * @param data The media data including the file to upload
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the created media item data
     * @example
     * // Upload an image
     * const formData = new FormData();
     * formData.append('file', imageFile);
     * formData.append('title', 'My Image');
     * const media = await api.media.create({
     *   file: imageFile,
     *   title: 'My Image',
     *   alt_text: 'An example image'
     * });
     *
     * // Upload with abort signal
     * const controller = new AbortController();
     * const media = await api.media.create(
     *   { file: imageFile, title: 'Image' },
     *   { signal: controller.signal }
     * );
     */
    create: async (
      data: WPMediaCreate,
      options?: RequestOptions
    ): Promise<WPMedia> => {
      const url = `${baseUrl}${BASE_PATH}`;
      const formData = new FormData();
      formData.append("file", data.file);

      // Add other fields to formData
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "file" && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      await auth?.beforeRequest?.();

      const response = await fetch(url, {
        method: "POST",
        headers: auth?.headers || {},
        body: formData,
        signal: options?.signal,
      });

      if (!response.ok) {
        if (auth?.shouldRefresh && (await auth.shouldRefresh(response))) {
          await auth.refresh?.();
          return endpoints.create(data, options);
        }
        await handleApiError(response);
      }

      const processedResponse = auth?.afterRequest
        ? await auth.afterRequest(response)
        : response;
      return processedResponse.json();
    },

    /**
     * Update an existing media item
     * @param id The media ID to update
     * @param data The media data to update
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the updated media item data
     * @example
     * // Update media title and alt text
     * const media = await api.media.update(123, {
     *   title: 'Updated Title',
     *   alt_text: 'Updated alt text'
     * });
     *
     * // Update with abort signal
     * const controller = new AbortController();
     * const media = await api.media.update(
     *   123,
     *   { title: 'Updated' },
     *   { signal: controller.signal }
     * );
     */
    update: async (
      id: number,
      data: WPMediaUpdate,
      options?: RequestOptions
    ): Promise<WPMedia> => {
      return apiPut<WPMedia>(
        baseUrl,
        buildResourcePath(BASE_PATH, id),
        data,
        auth,
        options?.signal
      );
    },

    /**
     * Delete a media item
     * @param id The media ID to delete
     * @param force Whether to bypass trash and force deletion
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the deleted media item data
     * @example
     * // Delete media
     * await api.media.delete(123);
     *
     * // Permanently delete media
     * await api.media.delete(123, true);
     *
     * // Delete with abort signal
     * const controller = new AbortController();
     * await api.media.delete(123, false, { signal: controller.signal });
     */
    delete: async (
      id: number,
      force: boolean = false,
      options?: RequestOptions
    ): Promise<WPMedia> => {
      const params = force ? { force: true } : undefined;
      return apiDelete<WPMedia>(
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
