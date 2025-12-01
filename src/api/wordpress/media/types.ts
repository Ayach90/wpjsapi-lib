import { WPBaseParameters, WPEmbeddable } from "../types";

export type { RequestOptions } from "../types";

// Base types for common fields
interface WPMediaDetailsSize {
  file: string;
  width: number;
  height: number;
  mime_type: string;
  source_url: string;
}

interface WPMediaDetails {
  width: number;
  height: number;
  file: string;
  sizes: Record<string, WPMediaDetailsSize>;
  image_meta: {
    aperture: string;
    credit: string;
    camera: string;
    caption: string;
    created_timestamp: string;
    copyright: string;
    focal_length: string;
    iso: string;
    shutter_speed: string;
    title: string;
    orientation: string;
    keywords: string[];
  };
}

// GET response type
export interface WPMedia extends WPEmbeddable {
  /**
   * The date the media was published, in the site's timezone.
   */
  date: string;
  /**
   * The date the media was published, as GMT.
   */
  date_gmt: string;
  /**
   * The globally unique identifier for the media.
   */
  guid: {
    rendered: string;
    raw?: string;
  };
  /**
   * Unique identifier for the media.
   */
  id: number;
  /**
   * URL to the media.
   */
  link: string;
  /**
   * The date the media was last modified, in the site's timezone.
   */
  modified: string;
  /**
   * The date the media was last modified, as GMT.
   */
  modified_gmt: string;
  /**
   * An alphanumeric identifier for the media.
   */
  slug: string;
  /**
   * Status of the media.
   */
  status: "publish" | "future" | "draft" | "pending" | "private";
  /**
   * Type of media.
   */
  type: string;
  /**
   * The title for the media.
   */
  title: {
    rendered: string;
    raw?: string;
  };
  /**
   * The ID for the author of the media.
   */
  author: number;
  /**
   * Whether or not comments are open on the media.
   */
  comment_status: "open" | "closed";
  /**
   * Whether or not the media can be pinged.
   */
  ping_status: "open" | "closed";
  /**
   * Alternative text to display when media is not displayed.
   */
  alt_text: string;
  /**
   * The caption for the media.
   */
  caption: {
    rendered: string;
    raw?: string;
  };
  /**
   * The description for the media.
   */
  description: {
    rendered: string;
    raw?: string;
  };
  /**
   * Media type.
   */
  media_type: "image" | "file" | "video" | "audio";
  /**
   * MIME type of the media.
   */
  mime_type: string;
  /**
   * Meta fields.
   */
  meta: Record<string, any>;
  /**
   * The ID for the associated post of the media.
   */
  post?: number;
  /**
   * Source URL of the media.
   */
  source_url: string;
  /**
   * Media details.
   */
  media_details: WPMediaDetails;
}

// POST/CREATE request type
export interface WPMediaCreate {
  /**
   * The file to upload.
   */
  file: File | Blob;
  /**
   * The title for the media.
   */
  title?: string;
  /**
   * Alternative text to display when media is not displayed.
   */
  alt_text?: string;
  /**
   * The caption for the media.
   */
  caption?: string;
  /**
   * The description for the media.
   */
  description?: string;
  /**
   * The ID for the associated post of the media.
   */
  post?: number;
}

// PUT/PATCH/UPDATE request type
export interface WPMediaUpdate extends Omit<Partial<WPMediaCreate>, "file"> {
  /**
   * The ID for the author of the media.
   */
  author?: number;
  /**
   * Whether or not comments are open on the media.
   */
  comment_status?: "open" | "closed";
  /**
   * Whether or not the media can be pinged.
   */
  ping_status?: "open" | "closed";
  /**
   * An alphanumeric identifier for the media.
   */
  slug?: string;
  /**
   * Status of the media.
   */
  status?: "publish" | "future" | "draft" | "pending" | "private";
}

// GET parameters for listing media
export interface WPMediaParameters extends WPBaseParameters {
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
   * Sort collection by media attribute.
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
   * Limit result set to attachments of a particular parent ID.
   */
  parent?: number[];
  /**
   * Limit result set to all items except those of a particular parent ID.
   */
  parent_exclude?: number[];
  /**
   * Limit result set to media items with a specific slug.
   */
  slug?: string;
  /**
   * Limit result set to media items with a specific status.
   */
  status?: string;
  /**
   * Limit result set to media items with a specific media type.
   */
  media_type?: "image" | "video" | "audio" | "application";
  /**
   * Limit result set to media items with a specific MIME type.
   */
  mime_type?: string;
}
