import { WPBaseParameters, WPEmbeddable } from "../types";

export type { RequestOptions } from "../types";

// Base types for common fields
interface WPUserBase {
  /**
   * Display name for the user.
   */
  name: string;
  /**
   * An alphanumeric identifier for the user.
   */
  slug: string;
  /**
   * Description of the user.
   */
  description: string;
  /**
   * URL of the user.
   */
  url: string;
}

// GET response type
export interface WPUser extends WPUserBase, WPEmbeddable {
  /**
   * Unique identifier for the user.
   */
  id: number;
  /**
   * Login name for the user.
   */
  username: string;
  /**
   * First name for the user.
   */
  first_name: string;
  /**
   * Last name for the user.
   */
  last_name: string;
  /**
   * Email address of the user.
   */
  email: string;
  /**
   * URL of the user's website.
   */
  url: string;
  /**
   * Registration date for the user.
   */
  registered_date: string;
  /**
   * Roles assigned to the user.
   */
  roles: string[];
  /**
   * Meta fields.
   */
  meta: Record<string, any>;
  /**
   * Author avatar URLs.
   */
  avatar_urls: Record<string, string>;
  /**
   * Links to related resources.
   */
  _links: Record<string, any>;
}

// POST/CREATE request type
export interface WPUserCreate {
  /**
   * Login name for the user.
   */
  username: string;
  /**
   * Email address of the user.
   */
  email: string;
  /**
   * Password for the user (never returned).
   */
  password: string;
  /**
   * Display name for the user.
   */
  name?: string;
  /**
   * First name for the user.
   */
  first_name?: string;
  /**
   * Last name for the user.
   */
  last_name?: string;
  /**
   * Description of the user.
   */
  description?: string;
  /**
   * URL of the user's website.
   */
  url?: string;
  /**
   * Locale for the user.
   */
  locale?: string;
  /**
   * Roles assigned to the user.
   */
  roles?: string[];
}

// PUT/PATCH/UPDATE request type
export interface WPUserUpdate extends Partial<Omit<WPUserCreate, "username">> {}

// GET parameters for listing users
export interface WPUserParameters extends WPBaseParameters {
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
   * Offset the result set by a specific number of items.
   */
  offset?: number;
  /**
   * Order sort attribute ascending or descending.
   */
  order?: "asc" | "desc";
  /**
   * Sort collection by user attribute.
   */
  orderby?:
    | "id"
    | "include"
    | "name"
    | "registered_date"
    | "slug"
    | "email"
    | "url";
  /**
   * Limit result set to users with a specific slug.
   */
  slug?: string;
  /**
   * Limit result set to users with one or more specific roles.
   */
  roles?: string[];
  /**
   * Limit result set to users who are considered authors.
   */
  who?: "authors";
}
