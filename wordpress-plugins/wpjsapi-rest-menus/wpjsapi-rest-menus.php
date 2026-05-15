<?php
/**
 * Plugin Name: WPJS API REST Menus
 * Description: Exposes WordPress navigation menus and menu items through wp/v2 REST endpoints compatible with wpjsapi-lib.
 * Version: 1.0.0
 * Author: wpjsapi-lib
 * License: GPL-2.0-or-later
 */

if (!defined('ABSPATH')) {
    exit;
}

final class WPJS_API_REST_Menus
{
    private const NAMESPACE = 'wp/v2';

    public static function register(): void
    {
        add_action('rest_api_init', [self::class, 'register_routes']);
    }

    public static function register_routes(): void
    {
        register_rest_route(self::NAMESPACE, '/menus', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [self::class, 'get_menus'],
                'permission_callback' => '__return_true',
                'args'                => self::collection_args([
                    'orderby' => [
                        'default' => 'name',
                        'enum'    => ['id', 'include', 'name', 'slug', 'count', 'term_group'],
                    ],
                    'slug' => [],
                ]),
            ],
        ]);

        register_rest_route(self::NAMESPACE, '/menus/(?P<id>[\d]+)', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [self::class, 'get_menu'],
                'permission_callback' => '__return_true',
                'args'                => [
                    'id' => [
                        'required'          => true,
                        'sanitize_callback' => 'absint',
                    ],
                    'context' => [
                        'default' => 'view',
                    ],
                ],
            ],
        ]);

        register_rest_route(self::NAMESPACE, '/menu-items', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [self::class, 'get_menu_items'],
                'permission_callback' => '__return_true',
                'args'                => self::collection_args([
                    'orderby' => [
                        'default' => 'menu_order',
                        'enum'    => ['id', 'include', 'title', 'slug', 'menu_order'],
                    ],
                    'parent'         => [],
                    'parent_exclude' => [],
                    'menus'          => [],
                ]),
            ],
        ]);

        register_rest_route(self::NAMESPACE, '/menu-items/(?P<id>[\d]+)', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [self::class, 'get_menu_item'],
                'permission_callback' => '__return_true',
                'args'                => [
                    'id' => [
                        'required'          => true,
                        'sanitize_callback' => 'absint',
                    ],
                    'context' => [
                        'default' => 'view',
                    ],
                ],
            ],
        ]);
    }

    public static function get_menus(WP_REST_Request $request): WP_REST_Response
    {
        $menus = wp_get_nav_menus([
            'hide_empty' => false,
            'orderby'    => self::normalize_menu_orderby($request->get_param('orderby')),
            'order'      => self::normalize_order($request->get_param('order')),
        ]);

        $menus = array_values(array_filter($menus, static function (WP_Term $menu) use ($request): bool {
            $include = self::ids_from_param($request->get_param('include'));
            $exclude = self::ids_from_param($request->get_param('exclude'));
            $slugs   = self::strings_from_param($request->get_param('slug'));
            $search  = trim((string) $request->get_param('search'));

            if ($include && !in_array((int) $menu->term_id, $include, true)) {
                return false;
            }

            if ($exclude && in_array((int) $menu->term_id, $exclude, true)) {
                return false;
            }

            if ($slugs && !in_array($menu->slug, $slugs, true)) {
                return false;
            }

            if ($search !== '' && stripos($menu->name, $search) === false && stripos($menu->slug, $search) === false) {
                return false;
            }

            return true;
        }));

        if ($request->get_param('orderby') === 'include') {
            $menus = self::sort_by_include($menus, self::ids_from_param($request->get_param('include')), 'term_id');
        }

        return self::paginated_response(
            array_map([self::class, 'prepare_menu'], $menus),
            $request
        );
    }

    public static function get_menu(WP_REST_Request $request)
    {
        $menu = wp_get_nav_menu_object((int) $request['id']);

        if (!$menu) {
            return new WP_Error('rest_menu_invalid_id', __('Menu not found.'), ['status' => 404]);
        }

        return rest_ensure_response(self::prepare_menu($menu));
    }

    public static function get_menu_items(WP_REST_Request $request): WP_REST_Response
    {
        $menu_ids = self::ids_from_param($request->get_param('menus'));
        $items    = [];

        if ($menu_ids) {
            foreach ($menu_ids as $menu_id) {
                $menu_items = wp_get_nav_menu_items($menu_id, [
                    'post_status' => 'publish',
                    'orderby'     => 'menu_order',
                    'order'       => 'ASC',
                ]);

                if (is_array($menu_items)) {
                    foreach ($menu_items as $item) {
                        $items[(int) $item->ID] = self::prepare_menu_item($item, $menu_id);
                    }
                }
            }
        } else {
            $posts = get_posts([
                'post_type'      => 'nav_menu_item',
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'orderby'        => 'menu_order',
                'order'          => 'ASC',
            ]);

            foreach ($posts as $post) {
                $items[(int) $post->ID] = self::prepare_menu_item(wp_setup_nav_menu_item($post));
            }
        }

        $items = array_values(array_filter($items, static function (array $item) use ($request): bool {
            $include        = self::ids_from_param($request->get_param('include'));
            $exclude        = self::ids_from_param($request->get_param('exclude'));
            $parent         = self::ids_from_param($request->get_param('parent'));
            $parent_exclude = self::ids_from_param($request->get_param('parent_exclude'));

            if ($include && !in_array((int) $item['id'], $include, true)) {
                return false;
            }

            if ($exclude && in_array((int) $item['id'], $exclude, true)) {
                return false;
            }

            if ($parent && !in_array((int) $item['parent'], $parent, true)) {
                return false;
            }

            if ($parent_exclude && in_array((int) $item['parent'], $parent_exclude, true)) {
                return false;
            }

            return true;
        }));

        self::sort_menu_items($items, $request);

        return self::paginated_response($items, $request);
    }

    public static function get_menu_item(WP_REST_Request $request)
    {
        $post = get_post((int) $request['id']);

        if (!$post || $post->post_type !== 'nav_menu_item') {
            return new WP_Error('rest_menu_item_invalid_id', __('Menu item not found.'), ['status' => 404]);
        }

        return rest_ensure_response(self::prepare_menu_item(wp_setup_nav_menu_item($post)));
    }

    private static function prepare_menu(WP_Term $menu): array
    {
        return [
            'id'          => (int) $menu->term_id,
            'description' => (string) $menu->description,
            'name'        => (string) $menu->name,
            'slug'        => (string) $menu->slug,
            'meta'        => [],
            'locations'   => self::menu_locations((int) $menu->term_id),
            'auto_add'    => self::menu_auto_adds_pages((int) $menu->term_id),
        ];
    }

    private static function prepare_menu_item($item, ?int $menu_id = null): array
    {
        $classes = is_array($item->classes ?? null) ? array_values(array_filter($item->classes)) : [];
        $xfn     = is_array($item->xfn ?? null) ? array_values(array_filter($item->xfn)) : preg_split('/\s+/', (string) ($item->xfn ?? ''), -1, PREG_SPLIT_NO_EMPTY);
        $menu_id = $menu_id ?: self::menu_id_for_item((int) $item->ID);

        return [
            'id'                    => (int) $item->ID,
            'menu_id'               => (int) $menu_id,
            'menu_order'            => (int) $item->menu_order,
            'parent'                => (int) ($item->menu_item_parent ?? 0),
            'title'                 => [
                'rendered' => html_entity_decode(wp_strip_all_tags((string) ($item->title ?? '')), ENT_QUOTES, get_bloginfo('charset')),
                'raw'      => (string) ($item->title ?? ''),
            ],
            'description'           => (string) ($item->description ?? ''),
            'type'                  => self::normalize_menu_item_type((string) ($item->type ?? 'custom')),
            'url'                   => (string) ($item->url ?? ''),
            'target'                => self::normalize_target((string) ($item->target ?? '')),
            'classes'               => $classes,
            'xfn'                   => $xfn,
            'status'                => ($item->post_status ?? 'publish') === 'publish' ? 'publish' : 'draft',
            'attr_title'            => (string) ($item->attr_title ?? ''),
            'object'                => (string) ($item->object ?? ''),
            'object_id'             => (int) ($item->object_id ?? 0),
            'current'               => false,
            'current_item_parent'   => false,
            'current_item_ancestor' => false,
            'invalid'               => !empty($item->_invalid),
        ];
    }

    private static function collection_args(array $extra): array
    {
        return array_merge([
            'page' => [
                'default'           => 1,
                'sanitize_callback' => 'absint',
            ],
            'per_page' => [
                'default'           => 10,
                'sanitize_callback' => 'absint',
            ],
            'search' => [
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'include' => [],
            'exclude' => [],
            'offset'  => [
                'sanitize_callback' => 'absint',
            ],
            'order' => [
                'default' => 'asc',
                'enum'    => ['asc', 'desc'],
            ],
        ], $extra);
    }

    private static function paginated_response(array $items, WP_REST_Request $request): WP_REST_Response
    {
        $total    = count($items);
        $per_page = max(1, min(100, (int) ($request->get_param('per_page') ?: 10)));
        $page     = max(1, (int) ($request->get_param('page') ?: 1));
        $offset   = $request->get_param('offset');
        $start    = $offset !== null ? max(0, (int) $offset) : ($page - 1) * $per_page;

        $response = rest_ensure_response(array_slice($items, $start, $per_page));
        $response->header('X-WP-Total', (string) $total);
        $response->header('X-WP-TotalPages', (string) max(1, (int) ceil($total / $per_page)));

        return $response;
    }

    private static function sort_menu_items(array &$items, WP_REST_Request $request): void
    {
        $orderby = (string) ($request->get_param('orderby') ?: 'menu_order');
        $order   = self::normalize_order($request->get_param('order'));

        if ($orderby === 'include') {
            $items = self::sort_by_include($items, self::ids_from_param($request->get_param('include')), 'id');
            return;
        }

        usort($items, static function (array $a, array $b) use ($orderby, $order): int {
            $field = 'menu_order';
            if ($orderby === 'id') {
                $field = 'id';
            } elseif ($orderby === 'title') {
                $field = 'title';
            } elseif ($orderby === 'slug') {
                $field = 'url';
            }

            $a_value = $field === 'title' ? $a['title']['rendered'] : $a[$field];
            $b_value = $field === 'title' ? $b['title']['rendered'] : $b[$field];
            $result  = is_numeric($a_value) && is_numeric($b_value)
                ? ((int) $a_value <=> (int) $b_value)
                : strcasecmp((string) $a_value, (string) $b_value);

            return $order === 'DESC' ? -$result : $result;
        });
    }

    private static function sort_by_include(array $items, array $include, string $field): array
    {
        if (!$include) {
            return $items;
        }

        $positions = array_flip($include);

        usort($items, static function ($a, $b) use ($positions, $field): int {
            $a_id = is_array($a) ? (int) $a[$field] : (int) $a->{$field};
            $b_id = is_array($b) ? (int) $b[$field] : (int) $b->{$field};

            return ($positions[$a_id] ?? PHP_INT_MAX) <=> ($positions[$b_id] ?? PHP_INT_MAX);
        });

        return $items;
    }

    private static function ids_from_param($value): array
    {
        if ($value === null || $value === '') {
            return [];
        }

        if (is_array($value)) {
            return array_values(array_filter(array_map('absint', $value)));
        }

        return wp_parse_id_list((string) $value);
    }

    private static function strings_from_param($value): array
    {
        if ($value === null || $value === '') {
            return [];
        }

        $values = is_array($value) ? $value : explode(',', (string) $value);

        return array_values(array_filter(array_map('sanitize_title', $values)));
    }

    private static function menu_locations(int $menu_id): array
    {
        $locations = [];

        foreach (get_nav_menu_locations() as $location => $assigned_menu_id) {
            if ((int) $assigned_menu_id === $menu_id) {
                $locations[] = (string) $location;
            }
        }

        return $locations;
    }

    private static function menu_auto_adds_pages(int $menu_id): bool
    {
        $options = get_option('nav_menu_options');

        return is_array($options)
            && isset($options['auto_add'])
            && in_array($menu_id, array_map('absint', (array) $options['auto_add']), true);
    }

    private static function menu_id_for_item(int $item_id): int
    {
        $menus = wp_get_object_terms($item_id, 'nav_menu', ['fields' => 'ids']);

        if (is_wp_error($menus) || !$menus) {
            return 0;
        }

        return (int) $menus[0];
    }

    private static function normalize_menu_orderby($orderby): string
    {
        $orderby = (string) $orderby;

        if ($orderby === 'id') {
            return 'term_id';
        }

        if ($orderby === 'slug') {
            return 'slug';
        }

        if ($orderby === 'count') {
            return 'count';
        }

        if ($orderby === 'term_group') {
            return 'term_group';
        }

        return 'name';
    }

    private static function normalize_order($order): string
    {
        return strtolower((string) $order) === 'desc' ? 'DESC' : 'ASC';
    }

    private static function normalize_menu_item_type(string $type): string
    {
        return in_array($type, ['custom', 'post_type', 'post_type_archive', 'taxonomy'], true) ? $type : 'custom';
    }

    private static function normalize_target(string $target): string
    {
        return in_array($target, ['', '_blank', '_self', '_parent', '_top'], true) ? $target : '';
    }
}

WPJS_API_REST_Menus::register();
