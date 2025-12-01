import type { WPEmbeddable } from "../types";
import type { WPYoastHeadJson } from "../../plugins/yoast";
// Re-export shared types
export type { RequestOptions } from "../types";

// Base types for rendered content fields
export interface WPRenderedContent {
  rendered: string;
  raw?: string;
}

export interface WPRenderedContentProtected extends WPRenderedContent {
  protected: boolean;
}

// Base types for common fields
export interface WPPostBase {
  /**
   * The title for the object.
   */
  title: WPRenderedContent;
  /**
   * The content for the object.
   */
  content: WPRenderedContentProtected;
  /**
   * The excerpt for the object.
   */
  excerpt: WPRenderedContentProtected;
  /**
   * Type of Post for the object.
   */
  type: string;
  /**
   * The format for the object.
   */
  format:
    | "standard"
    | "aside"
    | "chat"
    | "gallery"
    | "link"
    | "image"
    | "quote"
    | "status"
    | "video"
    | "audio";
  /**
   * Meta fields.
   */
  meta: Record<string, any>;
}

// Base type for create/update operations
export interface WPPostWriteBase {
  /**
   * The title for the object.
   */
  title?: string;
  /**
   * The content for the object.
   */
  content?: string;
  /**
   * The excerpt for the object.
   */
  excerpt?: string;
  /**
   * The format for the object.
   */
  format?:
    | "standard"
    | "aside"
    | "chat"
    | "gallery"
    | "link"
    | "image"
    | "quote"
    | "status"
    | "video"
    | "audio";
  /**
   * Meta fields.
   */
  meta?: Record<string, any>;
  /**
   * The status of the object.
   */
  status?: "publish" | "future" | "draft" | "pending" | "private";
  /**
   * The ID for the author of the object.
   */
  author?: number;
  /**
   * The date the object was published.
   */
  date?: string;
  /**
   * A password to protect access to the content and excerpt.
   */
  password?: string;
  /**
   * An alphanumeric identifier for the object.
   */
  slug?: string;
  /**
   * The ID of the featured media.
   */
  featured_media?: number;
  /**
   * Whether comments are allowed.
   */
  comment_status?: "open" | "closed";
  /**
   * Whether pings are allowed.
   */
  ping_status?: "open" | "closed";
  /**
   * The terms assigned to the object in the category taxonomy.
   */
  categories?: number[];
  /**
   * The terms assigned to the object in the post_tag taxonomy.
   */
  tags?: number[];
  /**
   * Whether to stick the post to the front page.
   */
  sticky?: boolean;
  /**
   * The theme file to use to display the object.
   */
  template?: string;
}

// GET response type
export interface WPPost extends WPPostBase, WPEmbeddable {
  /**
   * The date the object was published, in the site's timezone.
   */
  date: string;
  /**
   * The date the object was published, as GMT.
   */
  date_gmt: string;
  /**
   * The globally unique identifier for the object.
   */
  guid: {
    rendered: string;
    raw?: string;
  };
  /**
   * Unique identifier for the object.
   */
  id: number;
  /**
   * URL to the object.
   */
  link: string;
  /**
   * The date the object was last modified, in the site's timezone.
   */
  modified: string;
  /**
   * The date the object was last modified, as GMT.
   */
  modified_gmt: string;
  /**
   * An alphanumeric identifier for the object unique to its type.
   */
  slug: string;
  /**
   * A named status for the object.
   */
  status: "publish" | "future" | "draft" | "pending" | "private";
  /**
   * A password to protect access to the content and excerpt.
   */
  password: string;
  /**
   * Permalink template for the object.
   */
  permalink_template: string;
  /**
   * Slug automatically generated from the object title.
   */
  generated_slug: string;
  /**
   * The ID for the author of the object.
   */
  author: number;
  /**
   * The ID of the featured media for the object.
   */
  featured_media: number;
  /**
   * Whether or not comments are open on the object.
   */
  comment_status: "open" | "closed";
  /**
   * Whether or not the object can be pinged.
   */
  ping_status: "open" | "closed";
  /**
   * Whether or not the object should be treated as sticky.
   */
  sticky: boolean;
  /**
   * The theme file to use to display the object.
   */
  template: string;
  /**
   * The terms assigned to the object in the category taxonomy.
   */
  categories: number[];
  /**
   * The terms assigned to the object in the post_tag taxonomy.
   */
  tags: number[];
  /**
   * Yoast SEO head data (when Yoast is active).
   */
  yoast_head_json?: WPYoastHeadJson;
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
    "wp:term"?: Array<
      Array<{
        id: number;
        link: string;
        name: string;
        slug: string;
        taxonomy: string;
        _links: WPEmbeddable["_links"];
      }>
    >;
  };
}

// POST/CREATE request type
export interface WPPostCreate extends WPPostWriteBase {
  /**
   * The title for the object (required for creation).
   */
  title: string;
  /**
   * The content for the object (required for creation).
   */
  content: string;
}

// PUT/PATCH/UPDATE request type - all fields are optional
export interface WPPostUpdate extends WPPostWriteBase {}

// GET parameters for listing posts
/**
 * Custom taxonomy filters keyed by their REST base.
 * WordPress core expects term IDs for these filters (e.g. { language: [123] }).
 * Some setups may accept slugs, but IDs are the most compatible option.
 */
export type WPCustomTaxonomyFilters = Record<
  string,
  string | number | Array<string | number>
>;

export interface WPPostParameters {
  /**
   * Scope under which the request is made; determines fields present in response.
   */
  context?: "view" | "embed" | "edit";
  /**
   * Current page of the collection.
   */
  page?: number;
  /**
   * Maximum number of items to be returned in result set.
   */
  per_page?: number;
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
   * Offset the result set by a specific number of items.
   */
  offset?: number;
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
    | "title";
  /**
   * Limit result set to posts with a specific slug.
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
   * Language code used by some multilingual plugins (e.g., Polylang).
   */
  lang?: string;
  /**
   * Limit result set to all items that have the specified term assigned in the categories taxonomy.
   */
  categories?: number[];
  /**
   * Limit result set to all items except those that have the specified term assigned in the categories taxonomy.
   */
  categories_exclude?: number[];
  /**
   * Limit result set to all items that have the specified term assigned in the tags taxonomy.
   */
  tags?: number[];
  /**
   * Limit result set to all items except those that have the specified term assigned in the tags taxonomy.
   */
  tags_exclude?: number[];
  /**
   * Limit result set to items that are sticky.
   */
  sticky?: boolean;
  /**
   * Embed related resources in the response.
   * This will include author, featured media, etc. in the response if set to true.
   */
  _embed?: boolean;
  /**
   * Limit response to specific fields.
   * Example: ['id', 'title', 'content'] to only return these fields
   */
  _fields?: string[];
  /**
   * Filter by custom taxonomy terms using the taxonomy REST base as the key.
   * Example: { taxonomies: { language: 'en' } } results in ?language=en
   */
  taxonomies?: WPCustomTaxonomyFilters;
  /**
   * Custom query parameters to pass through as-is (non-core).
   */
  custom?: Record<string, string | number | boolean | Array<string | number | boolean>>;
}
