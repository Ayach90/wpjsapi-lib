import type {
  WPSettings,
  WPSettingsUpdate,
  WPSettingsParameters,
  RequestOptions,
} from "./types";
import type { AuthResponse } from "../../../auth";
import { apiGet, apiPut } from "../http";

/**
 * Base path for WordPress settings API endpoints
 */
const BASE_PATH = "/wp/v2/settings";

/**
 * Settings API endpoints configuration
 */
interface SettingsEndpointsConfig {
  baseUrl: string;
  auth?: AuthResponse;
}

/**
 * Settings API endpoints
 */
export const createSettingsEndpoints = ({
  baseUrl,
  auth,
}: SettingsEndpointsConfig) => {
  const endpoints = {
    /**
     * Get all WordPress settings
     * @param params Optional parameters
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the settings data
     * @example
     * // Get all settings
     * const settings = await api.settings.get();
     *
     * // Get with abort signal
     * const controller = new AbortController();
     * const settings = await api.settings.get({}, { signal: controller.signal });
     */
    get: async (
      params?: WPSettingsParameters,
      options?: RequestOptions
    ): Promise<WPSettings> => {
      return apiGet<WPSettings>(
        baseUrl,
        BASE_PATH,
        params || {},
        auth,
        options?.signal
      );
    },

    /**
     * Update WordPress settings
     * @param data The settings to update
     * @param options Optional request options (e.g., signal for aborting)
     * @returns Promise with the updated settings data
     * @example
     * // Update site title and tagline
     * const settings = await api.settings.update({
     *   title: 'My Site',
     *   description: 'Just another WordPress site'
     * });
     *
     * // Update with abort signal
     * const controller = new AbortController();
     * const settings = await api.settings.update(
     *   { title: 'My Site' },
     *   { signal: controller.signal }
     * );
     */
    update: async (
      data: WPSettingsUpdate,
      options?: RequestOptions
    ): Promise<WPSettings> => {
      return apiPut<WPSettings>(
        baseUrl,
        BASE_PATH,
        data,
        auth,
        options?.signal
      );
    },
  };

  return endpoints;
};
