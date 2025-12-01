// Base types for common fields
interface WPTagBase {
  /**
   * The description of the tag.
   */
  description: string;
  /**
   * The name of the tag.
   */
  name: string;
  /**
   * An alphanumeric identifier for the tag.
   */
  slug: string;
}

import { WPEmbeddable, WPBaseParameters } from "../types";

export type { RequestOptions } from "../types";

// GET response type
export interface WPTag extends WPTagBase, WPEmbeddable {
  /**
   * Unique identifier for the tag.
   */
  id: number;
  /**
   * The number of published posts for the tag.
   */
  count: number;
  /**
   * URL to the tag.
   */
  link: string;
  /**
   * Meta fields.
   */
  meta: Record<string, any>;
}

// POST/CREATE request type
export interface WPTagCreate extends WPTagBase {}

// PUT/PATCH/UPDATE request type
export interface WPTagUpdate extends Partial<WPTagCreate> {}

// GET parameters for listing tags
export interface WPTagParameters extends WPBaseParameters {
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
   * Ensure result set excludes specific IDs.
   */
  exclude?: number[];
  /**
   * Limit result set to specific IDs.
   */
  include?: number[];
  /**
   * Order sort attribute ascending or descending.
   */
  order?: "asc" | "desc";
  /**
   * Sort collection by term attribute.
   */
  orderby?:
    | "id"
    | "include"
    | "name"
    | "slug"
    | "term_group"
    | "description"
    | "count";
  /**
   * Whether to hide tags not assigned to any posts.
   */
  hide_empty?: boolean;
  /**
   * Limit result set to tags assigned to a specific post.
   */
  post?: number;
  /**
   * Limit result set to tags with a specific slug.
   */
  slug?: string;
}
