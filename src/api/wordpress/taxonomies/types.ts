import { WPBaseParameters, WPEmbeddable } from "../types";

export type { RequestOptions } from "../types";

// Base types for common fields
interface WPTaxonomyBase {
  /**
   * A human-readable description of the taxonomy.
   */
  description: string;
  /**
   * Whether or not the taxonomy should have children.
   */
  hierarchical: boolean;
  /**
   * The title for the taxonomy.
   */
  name: string;
  /**
   * An alphanumeric identifier for the taxonomy.
   */
  slug: string;
  /**
   * Whether or not the term cloud should be displayed.
   */
  show_cloud: boolean;
  /**
   * Types associated with the taxonomy.
   */
  types: string[];
}

// GET response type
export interface WPTaxonomy extends WPTaxonomyBase, WPEmbeddable {
  /**
   * All capabilities used by the taxonomy.
   */
  capabilities: Record<string, string>;
  /**
   * Labels used by the taxonomy.
   */
  labels: Record<string, string>;
  /**
   * Whether or not the taxonomy is publicly queryable.
   */
  public: boolean;
  /**
   * REST base route for the taxonomy.
   */
  rest_base: string;
  /**
   * REST namespace route for the taxonomy.
   */
  rest_namespace: string;
  /**
   * Whether or not the taxonomy is available for selection in navigation menus.
   */
  show_in_nav_menus: boolean;
  /**
   * Whether or not the taxonomy is shown in the admin UI.
   */
  show_in_quick_edit: boolean;
  /**
   * Whether or not the taxonomy is available for selection in the REST API.
   */
  show_in_rest: boolean;
  /**
   * Whether or not the taxonomy is visible to authors.
   */
  visibility: Record<string, boolean>;
}

// GET parameters for listing taxonomies
export interface WPTaxonomyParameters extends WPBaseParameters {
  /**
   * Scope under which the request is made; determines fields present in response.
   */
  context?: "view" | "embed" | "edit";
  /**
   * Limit results to taxonomies associated with a specific post type.
   */
  type?: string;
}
