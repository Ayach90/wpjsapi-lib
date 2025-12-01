// Base types for common fields
interface WPCategoryBase {
  /**
   * The description of the category.
   */
  description: string;
  /**
   * The name of the category.
   */
  name: string;
  /**
   * An alphanumeric identifier for the category.
   */
  slug: string;
}

import { WPEmbeddable, WPBaseParameters } from "../types";

export type { RequestOptions } from "../types";

export interface WPCategoryMeta {
  /**
   * Language code stored as term meta (if provided by multilingual setup).
   */
  lang?: string;
  [key: string]: any;
}

// GET response type
export interface WPCategory extends WPCategoryBase, WPEmbeddable {
  /**
   * Unique identifier for the category.
   */
  id: number;
  /**
   * The number of published posts for the category.
   */
  count: number;
  /**
   * URL to the category.
   */
  link: string;
  /**
   * The parent category ID.
   */
  parent: number;
  /**
   * Meta fields.
   */
  meta: WPCategoryMeta;
}

// POST/CREATE request type
export interface WPCategoryCreate extends WPCategoryBase {
  /**
   * The parent category ID.
   */
  parent?: number;
  /**
   * Meta fields.
   */
  meta?: WPCategoryMeta;
}

// PUT/PATCH/UPDATE request type
export interface WPCategoryUpdate extends Partial<WPCategoryCreate> {}

// GET parameters for listing categories
export interface WPCategoryParameters extends WPBaseParameters {
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
   * Sort collection by category attribute.
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
   * Whether to hide categories not assigned to any posts.
   */
  hide_empty?: boolean;
  /**
   * Limit result set to categories assigned to a specific parent ID.
   */
  parent?: number;
  /**
   * Limit result set to categories assigned to a specific post.
   */
  post?: number;
  /**
   * Limit result set to categories with a specific slug.
   */
  slug?: string;
  /**
   * Language code filter (non-core, for setups that store term meta like `lang`).
   */
  lang?: string;
}
