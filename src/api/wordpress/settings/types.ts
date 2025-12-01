import { WPBaseParameters, WPEmbeddable } from "../types";

export type { RequestOptions } from "../types";

// GET response type
export interface WPSettings extends WPEmbeddable {
  /**
   * Site title.
   */
  title: string;
  /**
   * Site tagline.
   */
  description: string;
  /**
   * Site URL.
   */
  url: string;
  /**
   * This address is used for admin purposes, like new user notification.
   */
  email: string;
  /**
   * A city in the same timezone as you.
   */
  timezone: string;
  /**
   * A date format for all date strings.
   */
  date_format: string;
  /**
   * A time format for all time strings.
   */
  time_format: string;
  /**
   * A day number of the week that the week should start on.
   */
  start_of_week: number;
  /**
   * WordPress locale code.
   */
  language: string;
  /**
   * Convert emoticons like :-) and :-P to graphics on display.
   */
  use_smilies: boolean;
  /**
   * Default post category.
   */
  default_category: number;
  /**
   * Default post format.
   */
  default_post_format: string;
  /**
   * Blog pages show at most.
   */
  posts_per_page: number;
  /**
   * Default ping status for new posts.
   */
  default_ping_status: "open" | "closed";
  /**
   * Default comment status for new posts.
   */
  default_comment_status: "open" | "closed";
}

// PUT/PATCH/UPDATE request type
export interface WPSettingsUpdate extends Partial<WPSettings> {}

// GET parameters for retrieving settings
export interface WPSettingsParameters extends WPBaseParameters {
  /**
   * Scope under which the request is made; determines fields present in response.
   */
  context?: "view" | "embed" | "edit";
}
