import { WPBaseParameters, WPEmbeddable } from "../types";

export type { RequestOptions } from "../types";

// Base types for rendered content
interface WPRenderedContent {
  rendered: string;
  raw?: string;
}

// Base types for common fields
interface WPCommentBase {
  /**
   * The content for the comment.
   */
  content: WPRenderedContent;
  /**
   * The date the comment was published.
   */
  date: string;
  /**
   * The date the comment was published, as GMT.
   */
  date_gmt: string;
  /**
   * Meta fields.
   */
  meta: Record<string, any>;
}

// GET response type
export interface WPComment extends WPCommentBase, WPEmbeddable {
  /**
   * Unique identifier for the comment.
   */
  id: number;
  /**
   * The ID of the user object, if author was a user.
   */
  author: number;
  /**
   * Email address for the comment author.
   */
  author_email: string;
  /**
   * IP address for the comment author.
   */
  author_ip?: string;
  /**
   * Display name for the comment author.
   */
  author_name: string;
  /**
   * URL for the comment author.
   */
  author_url: string;
  /**
   * User agent for the comment author.
   */
  author_user_agent?: string;
  /**
   * The ID for the parent of the comment.
   */
  parent: number;
  /**
   * The ID of the associated post object.
   */
  post: number;
  /**
   * State of the comment.
   */
  status: "approved" | "hold" | "spam" | "trash";
  /**
   * Type of the comment.
   */
  type: string;
  /**
   * URL to the comment.
   */
  link: string;
}

// POST/CREATE request type
export interface WPCommentCreate {
  /**
   * The content for the comment.
   */
  content: string;
  /**
   * The ID of the associated post object.
   */
  post: number;
  /**
   * The ID of the user object, if author was a user.
   */
  author?: number;
  /**
   * Email address for the comment author.
   */
  author_email?: string;
  /**
   * Display name for the comment author.
   */
  author_name?: string;
  /**
   * URL for the comment author.
   */
  author_url?: string;
  /**
   * The ID for the parent of the comment.
   */
  parent?: number;
}

// PUT/PATCH/UPDATE request type
export interface WPCommentUpdate extends Partial<WPCommentCreate> {
  /**
   * State of the comment.
   */
  status?: "approved" | "hold" | "spam" | "trash";
}

// GET parameters for listing comments
export interface WPCommentParameters extends WPBaseParameters {
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
   * Limit results to comments published after a given ISO8601 compliant date.
   */
  after?: string;
  /**
   * Limit results to comments published before a given ISO8601 compliant date.
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
   * Offset the result set by a specific number of comments.
   */
  offset?: number;
  /**
   * Order sort attribute ascending or descending.
   */
  order?: "asc" | "desc";
  /**
   * Sort collection by comment attribute.
   */
  orderby?: "date" | "date_gmt" | "id" | "include" | "post" | "parent" | "type";
  /**
   * Limit result set to comments assigned to specific post IDs.
   */
  post?: number[];
  /**
   * Limit result set to comments assigned to a specific user ID.
   */
  author?: number[];
  /**
   * Ensure result set excludes comments assigned to specific user IDs.
   */
  author_exclude?: number[];
  /**
   * Limit result set to that from a specific author email.
   */
  author_email?: string;
  /**
   * Limit result set to comments of specific parent IDs.
   */
  parent?: number[];
  /**
   * Ensure result set excludes specific parent IDs.
   */
  parent_exclude?: number[];
  /**
   * Limit result set to comments in a specific post type.
   */
  post_type?: string;
  /**
   * Limit result set to comments with a specific approval status.
   */
  status?: "hold" | "approve" | "spam" | "trash";
  /**
   * Limit result set to comments of a specific type.
   */
  comment_type?: string;
  /**
   * Limit result set to users matching at least one specific permission.
   */
  password?: string;
}
