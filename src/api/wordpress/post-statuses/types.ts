import { WPBaseParameters, WPEmbeddable } from "../types";

export type { RequestOptions } from "../types";

// Base types for common fields
interface WPPostStatusBase {
  /**
   * A human-readable description of the status.
   */
  name: string;
  /**
   * Whether posts of this status should be private.
   */
  private: boolean;
  /**
   * Whether posts with this status should be protected.
   */
  protected: boolean;
  /**
   * Whether posts of this status should be publicly-queryable.
   */
  public: boolean;
  /**
   * Whether to include posts in the edit listing for their post type.
   */
  queryable: boolean;
  /**
   * Whether posts of this status should be shown in the front end of the site.
   */
  show_in_list: boolean;
  /**
   * An alphanumeric identifier for the status.
   */
  slug: string;
}

// GET response type
export interface WPPostStatus extends WPPostStatusBase, WPEmbeddable {
  /**
   * Labels used by the status.
   */
  label: string;
  /**
   * Default status labels.
   */
  labels: {
    name: string;
    singular_name: string;
  };
}

// GET parameters for listing post statuses
export interface WPPostStatusParameters extends WPBaseParameters {
  /**
   * Scope under which the request is made; determines fields present in response.
   */
  context?: "view" | "embed" | "edit";
}
