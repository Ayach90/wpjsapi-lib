# WPJS API REST Menus

Small WordPress plugin that exposes read-only navigation menu endpoints compatible with `wpjsapi-lib`.

## Endpoints

- `GET /wp-json/wp/v2/menus`
- `GET /wp-json/wp/v2/menus/{id}`
- `GET /wp-json/wp/v2/menu-items`
- `GET /wp-json/wp/v2/menu-items/{id}`

The menu items endpoint supports the query used by `wpheadless-lib`:

```txt
/wp-json/wp/v2/menu-items?menus=3&per_page=100&orderby=menu_order&order=asc
```

Responses include `X-WP-Total` and `X-WP-TotalPages` headers so `wpjsapi-lib` pagination helpers keep working.

## Install

Copy the `wpjsapi-rest-menus` directory into `wp-content/plugins/` and activate **WPJS API REST Menus** in the WordPress admin.

Your frontend `WP_API_URL` should be the REST root:

```env
WP_API_URL="https://api.example.com/wp-json"
```

`wpjsapi-lib` appends `/wp/v2/...` internally.
