/**
 * WordPress pagination response headers
 */
export interface WPPaginationInfo {
  /**
   * Total number of items available
   */
  total: number;
  /**
   * Total number of pages available
   */
  totalPages: number;
  /**
   * Current page number
   */
  currentPage: number;
  /**
   * Number of items per page
   */
  perPage: number;
  /**
   * Has more pages available
   */
  hasMore: boolean;
}

/**
 * WordPress paginated response
 */
export interface WPPaginatedResponse<T> {
  /**
   * Array of items in the current page
   */
  items: T[];
  /**
   * Pagination information
   */
  pagination: WPPaginationInfo;
}

/**
 * Base type for embeddable resources
 */
export interface WPEmbeddable {
  /**
   * Links to related resources
   */
  _links: {
    self?: { href: string }[];
    collection?: { href: string }[];
    about?: { href: string }[];
    author?: { href: string; embeddable?: boolean }[];
    replies?: { href: string; embeddable?: boolean }[];
    "version-history"?: { count?: number; href: string }[];
    "predecessor-version"?: { id: number; href: string }[];
    "wp:featuredmedia"?: { href: string; embeddable?: boolean }[];
    "wp:attachment"?: { href: string }[];
    "wp:term"?: { taxonomy: string; href: string; embeddable?: boolean }[];
    curies?: { name: string; href: string; templated: boolean }[];
  };
}

/**
 * Base parameters for WordPress REST API endpoints
 */
export interface WPBaseParameters {
  /**
   * Current page of the collection.
   */
  page?: number;
  /**
   * Maximum number of items to be returned in result set.
   */
  per_page?: number;
  /**
   * Scope under which the request is made; determines fields present in response.
   */
  context?: "view" | "embed" | "edit";
  /**
   * Embed related resources in the response.
   */
  _embed?: boolean;
  /**
   * Limit response to specific fields.
   * Example: ['id', 'title', 'content']
   */
  _fields?: string[];
  /**
   * Custom query parameters (non-core). These are merged into the request as-is.
   */
  custom?: Record<string, string | number | boolean | Array<string | number | boolean>>;
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  /**
   * AbortSignal to cancel the request
   */
  signal?: AbortSignal;
}
