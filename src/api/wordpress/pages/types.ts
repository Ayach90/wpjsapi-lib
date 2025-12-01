import { WPEmbeddable, WPBaseParameters } from "../types";
import type { WPYoastHeadJson } from "../../plugins/yoast";

// Re-export shared types
export type { RequestOptions } from "../types";

// Base types for rendered content
interface WPRenderedContent {
  rendered: string;
  raw?: string;
}

interface WPRenderedContentProtected extends WPRenderedContent {
  protected: boolean;
}

// Base types for common fields
interface WPPageBase {
  /**
   * The title for the page.
   */
  title: WPRenderedContent;
  /**
   * The content for the page.
   */
  content: WPRenderedContentProtected;
  /**
   * The excerpt for the page.
   */
  excerpt: WPRenderedContentProtected;
  /**
   * Meta fields.
   */
  meta: Record<string, any>;
}

// Base type for create/update operations
interface WPPageWriteBase {
  /**
   * The title for the page.
   */
  title?: string;
  /**
   * The content for the page.
   */
  content?: string;
  /**
   * The excerpt for the page.
   */
  excerpt?: string;
  /**
   * The ID for the author of the page.
   */
  author?: number;
  /**
   * The ID for the parent of the page.
   */
  parent?: number;
  /**
   * The order of the page in relation to other pages.
   */
  menu_order?: number;
  /**
   * The comment status for the page.
   */
  comment_status?: "open" | "closed";
  /**
   * The ping status for the page.
   */
  ping_status?: "open" | "closed";
  /**
   * A password to protect access to the content and excerpt.
   */
  password?: string;
  /**
   * The slug of the page.
   */
  slug?: string;
  /**
   * The status of the page.
   */
  status?: "publish" | "future" | "draft" | "pending" | "private";
  /**
   * The theme file to use to display the page.
   */
  template?: string;
}

// GET response type
export interface WPPage extends WPPageBase, WPEmbeddable {
  /**
   * The date the page was published, in the site's timezone.
   */
  date: string;
  /**
   * The date the page was published, as GMT.
   */
  date_gmt: string;
  /**
   * The globally unique identifier for the page.
   */
  guid: WPRenderedContent;
  /**
   * Unique identifier for the page.
   */
  id: number;
  /**
   * URL to the page.
   */
  link: string;
  /**
   * The date the page was last modified, in the site's timezone.
   */
  modified: string;
  /**
   * The date the page was last modified, as GMT.
   */
  modified_gmt: string;
  /**
   * An alphanumeric identifier for the page unique to its type.
   */
  slug: string;
  /**
   * A named status for the page.
   */
  status: "publish" | "future" | "draft" | "pending" | "private";
  /**
   * The ID for the author of the page.
   */
  author: number;
  /**
   * The ID of the featured media for the page.
   */
  featured_media: number;
  /**
   * The ID for the parent of the page.
   */
  parent: number;
  /**
   * Whether or not comments are open on the page.
   */
  comment_status: "open" | "closed";
  /**
   * Whether or not the page can be pinged.
   */
  ping_status: "open" | "closed";
  /**
   * The order of the page in relation to other pages.
   */
  menu_order: number;
  /**
   * The theme file to use to display the page.
   */
  template: string;
  /**
   * Embedded resources, only present when _embed=true is requested
   */
  _embedded?: {
    author?: Array<{
      id: number;
      name: string;
      url: string;
      description: string;
      link: string;
      slug: string;
      avatar_urls: Record<string, string>;
      _links: WPEmbeddable["_links"];
    }>;
    "wp:featuredmedia"?: Array<{
      id: number;
      date: string;
      slug: string;
      type: string;
      link: string;
      title: WPRenderedContent;
      author: number;
      caption: WPRenderedContent;
      alt_text: string;
      media_type: string;
      mime_type: string;
      media_details: {
        width: number;
        height: number;
        file: string;
        sizes: Record<
          string,
          {
            file: string;
            width: number;
            height: number;
            mime_type: string;
            source_url: string;
          }
        >;
      };
      source_url: string;
      _links: WPEmbeddable["_links"];
    }>;
  };
  /**
   * Yoast SEO head data (when Yoast is active).
   */
  yoast_head_json?: WPYoastHeadJson;
}

// POST/CREATE request type
export interface WPPageCreate extends WPPageWriteBase {
  /**
   * The title for the page (required for creation).
   */
  title: string;
  /**
   * The content for the page (required for creation).
   */
  content: string;
}

// PUT/PATCH/UPDATE request type - all fields are optional
export interface WPPageUpdate extends WPPageWriteBase {}

// GET parameters for listing pages
export interface WPPageParameters extends WPBaseParameters {
  /**
   * Limit results to those matching a string.
   */
  search?: string;
  /**
   * Limit results to items published after a given ISO8601 compliant date.
   */
  after?: string;
  /**
   * Limit results to items published before a given ISO8601 compliant date.
   */
  before?: string;
  /**
   * Ensure result set excludes specific IDs.
   */
  exclude?: number[];
  /**
   * Limit result set to specific IDs.
   */
  include?: number[];
  /**
   * Limit result set to items with particular parent IDs.
   */
  parent?: number[];
  /**
   * Limit result set to all items except those of a particular parent ID.
   */
  parent_exclude?: number[];
  /**
   * Limit result set to pages with a specific slug.
   */
  slug?: string;
  /**
   * Limit result set to posts assigned one or more statuses.
   */
  status?: string | string[];
  /**
   * Filter by custom field key (requires proper REST permissions).
   */
  meta_key?: string;
  /**
   * Filter by custom field value (matched against meta_key).
   */
  meta_value?: string | number | boolean;
  /**
   * Custom query parameters to pass through as-is (non-core).
   */
  custom?: Record<string, string | number | boolean | Array<string | number | boolean>>;
  /**
   * Order sort attribute ascending or descending.
   */
  order?: "asc" | "desc";
  /**
   * Sort collection by object attribute.
   */
  orderby?:
    | "author"
    | "date"
    | "id"
    | "include"
    | "modified"
    | "parent"
    | "relevance"
    | "slug"
    | "include_slugs"
    | "title"
    | "menu_order";
  /**
   * Use menu_order to sort collection.
   */
  menu_order?: number;
}
