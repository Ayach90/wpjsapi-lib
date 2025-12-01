// Base types for menu items
interface WPMenuItemBase {
  /**
   * The title for the menu item.
   */
  title: {
    rendered: string;
    raw?: string;
  };
  /**
   * The description for the menu item.
   */
  description: string;
  /**
   * The type of the menu item.
   */
  type: "custom" | "post_type" | "post_type_archive" | "taxonomy";
  /**
   * The URL for the menu item.
   */
  url: string;
  /**
   * The target attribute for the menu item link.
   */
  target: "" | "_blank" | "_self" | "_parent" | "_top";
  /**
   * CSS classes for the menu item.
   */
  classes: string[];
  /**
   * The XFN relationship for the menu item.
   */
  xfn: string[];
  /**
   * The status of the menu item.
   */
  status: "publish" | "draft";
  /**
   * The attribute title for the menu item link.
   */
  attr_title: string;
}

import { WPEmbeddable, WPBaseParameters } from "../types";

export type { RequestOptions } from "../types";

// GET response type for menu
export interface WPMenu extends WPEmbeddable {
  /**
   * Unique identifier for the menu.
   */
  id: number;
  /**
   * The description of the menu.
   */
  description: string;
  /**
   * The name of the menu.
   */
  name: string;
  /**
   * The slug of the menu.
   */
  slug: string;
  /**
   * Meta fields.
   */
  meta: Record<string, any>;
  /**
   * The locations assigned to the menu.
   */
  locations: string[];
  /**
   * Whether to automatically add new top-level pages to this menu.
   */
  auto_add: boolean;
}

// GET response type for menu item
export interface WPMenuItem extends WPMenuItemBase, WPEmbeddable {
  /**
   * Unique identifier for the menu item.
   */
  id: number;
  /**
   * The ID of the menu that contains the menu item.
   */
  menu_id: number;
  /**
   * The order of the menu item in relation to other menu items.
   */
  menu_order: number;
  /**
   * The DB ID of the parent menu item, if any.
   */
  parent: number;
  /**
   * The type of object connected to the menu item.
   */
  object: string;
  /**
   * The ID of the object connected to the menu item.
   */
  object_id: number;
  /**
   * Whether this menu item points to the currently displayed page.
   */
  current: boolean;
  /**
   * Whether the menu item represents the currently displayed object.
   */
  current_item_parent: boolean;
  /**
   * Whether the menu item represents an ancestor of the currently displayed object.
   */
  current_item_ancestor: boolean;
  /**
   * Invalid or corrupted menu item.
   */
  invalid: boolean;
}

// POST/CREATE request type for menu
export interface WPMenuCreate {
  /**
   * The name of the menu.
   */
  name: string;
  /**
   * The description of the menu.
   */
  description?: string;
  /**
   * The locations to assign the menu to.
   */
  locations?: string[];
  /**
   * Whether to automatically add new top-level pages to this menu.
   */
  auto_add?: boolean;
}

// PUT/PATCH/UPDATE request type for menu
export interface WPMenuUpdate extends Partial<WPMenuCreate> {}

// POST/CREATE request type for menu item
export interface WPMenuItemCreate extends WPMenuItemBase {
  /**
   * The ID of the menu that contains the menu item.
   */
  menu_id: number;
  /**
   * The DB ID of the parent menu item, if any.
   */
  parent?: number;
  /**
   * The order of the menu item in relation to other menu items.
   */
  menu_order?: number;
}

// PUT/PATCH/UPDATE request type for menu item
export interface WPMenuItemUpdate extends Partial<WPMenuItemCreate> {}

// GET parameters for listing menus
export interface WPMenuParameters extends WPBaseParameters {
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
   * Sort collection by menu attribute.
   */
  orderby?: "id" | "include" | "name" | "slug" | "count" | "term_group";
  /**
   * Limit result set to menus with specific slugs.
   */
  slug?: string[];
}

// GET parameters for listing menu items
export interface WPMenuItemParameters extends WPBaseParameters {
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
  orderby?: "id" | "include" | "title" | "slug" | "menu_order";
  /**
   * Limit result set to items with particular parent IDs.
   */
  parent?: number[];
  /**
   * Limit result set to all items except those of a particular parent ID.
   */
  parent_exclude?: number[];
  /**
   * Limit result set to items that are associated with a certain object.
   */
  menus?: number[];
}
