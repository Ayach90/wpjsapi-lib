import { WPBaseParameters, WPEmbeddable } from "../types";

export type { RequestOptions } from "../types";

// Base types for common fields
interface WPPostTypeBase {
  /**
   * A human-readable description of the post type.
   */
  description: string;
  /**
   * Whether or not the post type should have children.
   */
  hierarchical: boolean;
  /**
   * The title for the post type.
   */
  name: string;
  /**
   * An alphanumeric identifier for the post type.
   */
  slug: string;
}

// GET response type
export interface WPPostType extends WPPostTypeBase, WPEmbeddable {
  /**
   * All capabilities used by the post type.
   */
  capabilities: Record<string, string>;
  /**
   * Labels used by the post type.
   */
  labels: Record<string, string>;
  /**
   * Whether or not the post type is publicly queryable.
   */
  public: boolean;
  /**
   * REST base route for the post type.
   */
  rest_base: string;
  /**
   * REST namespace route for the post type.
   */
  rest_namespace: string;
  /**
   * Whether or not the post type has archives.
   */
  has_archive: boolean;
  /**
   * Whether or not the post type is exportable.
   */
  can_export: boolean;
  /**
   * Whether or not the post type is excluded from search.
   */
  exclude_from_search: boolean;
  /**
   * Whether or not the post type is shown in the admin UI.
   */
  show_ui: boolean;
  /**
   * Whether or not the post type is available for selection in navigation menus.
   */
  show_in_nav_menus: boolean;
  /**
   * Whether or not the post type is shown in the admin menu.
   */
  show_in_menu: boolean;
  /**
   * Whether or not the post type is available for selection in the REST API.
   */
  show_in_rest: boolean;
  /**
   * Menu position for the post type.
   */
  menu_position: number;
  /**
   * Menu icon for the post type.
   */
  menu_icon: string;
  /**
   * Features supported by the post type.
   */
  supports: string[];
  /**
   * Taxonomies associated with the post type.
   */
  taxonomies: string[];
  /**
   * Template hierarchy used by the post type.
   */
  template: string[];
}

// GET parameters for listing post types
export interface WPPostTypeParameters extends WPBaseParameters {
  /**
   * Scope under which the request is made; determines fields present in response.
   */
  context?: "view" | "embed" | "edit";
}
