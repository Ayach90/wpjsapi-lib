import type { AuthResponse } from "../../../auth";
import { apiGet } from "../../wordpress/http";
import type { RequestOptions } from "../../wordpress/types";
import type { WPYoastHeadResponse } from "./types";

const YOAST_GET_HEAD_PATH = "/yoast/v1/get_head";

interface YoastEndpointsConfig {
  /**
   * WordPress REST base URL (e.g., https://site.com/wp-json).
   */
  baseUrl: string;
  auth?: AuthResponse;
  /**
   * Optional site base URL used to resolve sitemap URLs.
   * Defaults to baseUrl without the trailing /wp-json segment.
   */
  siteBaseUrl?: string;
}

export interface YoastGetHeadParams {
  /**
   * Absolute URL to fetch metadata for (Yoast will resolve it).
   */
  url?: string;
  /**
   * Route/path relative to the site root (e.g., "/").
   */
  route?: string;
}

const stripWpJson = (restBase: string): string => {
  try {
    const url = new URL(restBase);
    const strippedPath = url.pathname.replace(/\/?wp-json\/?$/, "") || "/";
    const normalizedPath = strippedPath.endsWith("/")
      ? strippedPath.slice(0, -1) || "/"
      : strippedPath;
    return `${url.origin}${normalizedPath === "/" ? "" : normalizedPath}`;
  } catch {
    return restBase.replace(/\/?wp-json\/?$/, "");
  }
};

export const createYoastEndpoints = ({
  baseUrl,
  auth,
  siteBaseUrl,
}: YoastEndpointsConfig) => {
  const resolvedSiteBase = siteBaseUrl || stripWpJson(baseUrl);

  return {
    /**
     * Fetch Yoast head metadata via the official REST endpoint.
     * If neither url nor route is provided, Yoast resolves the site front page.
     */
    head: async (
      params?: YoastGetHeadParams,
      options?: RequestOptions
    ): Promise<WPYoastHeadResponse> => {
      return apiGet<WPYoastHeadResponse>(
        baseUrl,
        YOAST_GET_HEAD_PATH,
        params,
        auth,
        options?.signal
      );
    },
    /**
     * Fetch the Yoast sitemap index XML (public endpoint, not REST).
     */
    sitemapIndex: async (options?: RequestOptions): Promise<string> => {
      const url = `${resolvedSiteBase}/sitemap_index.xml`;
      const response = await fetch(url, { signal: options?.signal });
      return response.text();
    },
    /**
     * Fetch a specific sitemap XML by path (e.g., "post-sitemap.xml" or "/category-sitemap.xml").
     */
    sitemap: async (path: string, options?: RequestOptions): Promise<string> => {
      const normalized =
        path.startsWith("/") || path.startsWith("http")
          ? path
          : `/${path}`;
      const url = normalized.startsWith("http")
        ? normalized
        : `${resolvedSiteBase}${normalized}`;
      const response = await fetch(url, { signal: options?.signal });
      return response.text();
    },
  };
};
