# wpjs-api

Typed utilities to interact with the WordPress REST API from any JavaScript/TypeScript project. The library ships resource-focused endpoint factories, rich type definitions, pagination helpers, and pluggable authentication so you can build WordPress integrations without rewriting boilerplate fetch logic.

## Highlights

- ✅ **Fully typed** endpoint factories for core WordPress resources (posts, pages, media, comments, terms, users, menus, settings, etc.).
- ✅ **Robust error handling** with custom `WPApiError` class providing detailed error information and user-friendly messages.
- ✅ **Browser compatible** authentication using standard Web APIs (`btoa()` instead of Node.js-only `Buffer`).
- ✅ **Request cancellation** support via `AbortController` for better UX and performance.
- ✅ **Automatic URL normalization** handles trailing/leading slashes consistently, preventing double-slash errors and invalid URLs.
- ✅ **Comprehensive test coverage** with 85+ tests ensuring reliability (89% coverage on core API).
- ✅ **Shared pagination helpers** that expose both `listAll()` and async iterator workflows.
- ✅ **Authentication helpers** covering Basic, Bearer, API key, Nonce, HMAC (custom hook), and OAuth2 token refresh flows.
- ✅ **First-class support** for REST query controls like `_fields`, `_embed`, filtering, and ordering parameters across every endpoint.
- ✅ **Rich response and request types** (`WPPaginatedResponse`, `WPPost`, `WPUser`, ...) generated from the official REST schema.
- ✅ **Hooks to customise request lifecycles** (`beforeRequest`, `afterRequest`, `shouldRefresh`, `refresh`) so you can plug in logging, caching, or token refresh logic.
- ✅ **Written end-to-end in TypeScript** to maximise autocomplete, type safety, and DX.
- ✅ **Isomorphic design**: works in modern browsers and Node.js runtimes that expose (or polyfill) `fetch`.

> **Requires a global `fetch` implementation.** Node.js 18+ has native `fetch`; older runtimes must polyfill (e.g. with [`undici`](https://github.com/nodejs/undici)).

## Installation

```bash
npm install wpjs-api
# or
pnpm add wpjs-api
# or
yarn add wpjs-api
```

## Quick Start

```ts
import {
  createAuth,
  createPostsEndpoints,
  type WPPostParameters,
} from "wpjs-api";

const auth = createAuth({
  method: "basic",
  credentials: {
    username: process.env.WP_USER!,
    password: process.env.WP_PASS!,
  },
});

const posts = createPostsEndpoints({
  baseUrl: "https://example.com/wp-json",
  auth,
});

// Basic list with pagination
const { items, pagination } = await posts.list({
  per_page: 5,
  order: "desc",
  orderby: "date",
} satisfies WPPostParameters);

console.log(`Fetched ${items.length} posts out of ${pagination.total}.`);
console.log(`Page ${pagination.currentPage} of ${pagination.totalPages}`);
console.log(`Has more pages: ${pagination.hasMore}`);

// Fetch the entire collection with automatic pagination handling
const allPosts = await posts.listAll();

// Or iterate page by page
for await (const page of posts.pages({ per_page: 10 })) {
  console.log(`Processing page ${page.pagination.currentPage}`);
  for (const post of page.items) {
    console.log(`- ${post.title.rendered}`);
  }
}

// With request cancellation support
const controller = new AbortController();
const cancelablePosts = await posts.list(
  { per_page: 100 },
  { signal: controller.signal }
);
// Later: controller.abort(); // Cancels the request
```

> Every endpoint factory only needs a `baseUrl` (your WordPress REST root) and an optional `auth` object. You are free to compose the factories you need.

## REST Query Options

The client mirrors native WordPress REST query parameters, including:

- **`_embed`** to eagerly expand related resources (authors, media, terms, etc.):

  ```ts
  const post = await posts.get(123, "view", true); // Includes _embedded data
  console.log(post._embedded?.author); // Author details
  console.log(post._embedded?.["wp:featuredmedia"]); // Featured image
  ```

- **`_fields`** to limit payload shape and reduce over-the-wire data:

  ```ts
  const { items } = await posts.list({
    _fields: ["id", "title", "excerpt"],
    per_page: 100,
  });
  // Only fetches specified fields, reducing response size
  ```

- **Filtering capabilities** such as `search`, `slug`, taxonomy filters, date ranges, and status constraints:

  ```ts
  // Search posts
  const results = await posts.list({ search: "wordpress" });

  // Filter by category
  const categoryPosts = await posts.list({ categories: [42] });

  // Date range filtering
  const recentPosts = await posts.list({
    after: "2024-01-01T00:00:00",
    before: "2024-12-31T23:59:59",
  });

  // Filter by custom taxonomy (e.g. language taxonomy with rest base "language")
  // Use term IDs for best compatibility (fetch term via /wp/v2/language?slug=en to get its ID)
  const englishPosts = await posts.list({ taxonomies: { language: [123] } });

  // Polylang-style language filter (uses ?lang=en instead of ?language=en)
  const englishPostsPoly = await posts.list({ lang: "en" });
```

- **Ordering controls** (`order`, `orderby`) with the same enum safety found in the REST docs:
  ```ts
  const ordered = await posts.list({
    orderby: "date",
    order: "desc",
    per_page: 10,
  });
  ```

All factories accept typed parameter objects (for example `WPPostParameters`, `WPCategoryParameters`, `WPCommentParameters`) so TypeScript can autocomplete valid options and prevent unsupported combinations.

## Authentication

The `createAuth` helper builds the `AuthResponse` object consumed by all endpoint factories. It exposes extension points to hook into each request:

- `headers`: injected into every fetch call.
- `beforeRequest()`: async hook that runs before each request (e.g. refresh nonce).
- `afterRequest(response)`: transform or cache the response.
- `shouldRefresh(response)`: mark when a refresh is required (e.g. 401).
- `refresh()`: invoked automatically when `shouldRefresh` returns `true`.

### Browser Compatibility

All authentication methods are **fully compatible with modern browsers** using standard Web APIs. The library uses `btoa()` for Base64 encoding instead of Node.js-only `Buffer`, ensuring it works seamlessly in:

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Node.js 16+ (has global `btoa()`)
- ✅ React, Vue, Angular, Svelte applications
- ✅ Web Workers and Service Workers

### Supported strategies:

| Method   | Credentials shape                                                 | Notes                                                                              |
| -------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `none`   | —                                                                 | For public endpoints.                                                              |
| `basic`  | `{ username, password }`                                          | Sends `Authorization: Basic ...`. Browser-compatible using `btoa()`.               |
| `bearer` | `{ token, refreshToken? }`                                        | Optional `onTokenRefresh` callback invoked from `refresh()`.                       |
| `apiKey` | `{ apiKey }`                                                      | Sends `X-API-Key`.                                                                 |
| `hmac`   | `{ apiKey, secret }`                                              | Ships an empty hook to plug your own signature generator inside `beforeRequest()`. |
| `nonce`  | `{ nonce }`                                                       | Sends `X-WP-Nonce`.                                                                |
| `oauth2` | `{ clientId, clientSecret, accessToken?, refreshToken?, scope? }` | Refresh flow stubbed for you to extend; pair with `onTokenRefresh`.                |

### Example: Basic Auth in Browser

```ts
import { createAuth, createPostsEndpoints } from "wpjs-api";

// Works in browsers! No Buffer dependency
const auth = createAuth({
  method: "basic",
  credentials: {
    username: "admin",
    password: "my-app-password",
  },
});

const posts = createPostsEndpoints({
  baseUrl: "https://mysite.com/wp-json",
  auth,
});

// Use in your React/Vue/Angular app
const { items } = await posts.list({ per_page: 10 });
```

## API Surface

Each factory returns a collection of typed methods matching the WordPress REST API behaviour. All list operations return `Promise<WPPaginatedResponse<T>>` and most resources expose `listAll()` and `pages()` helpers to iterate through the whole collection. Supported endpoints include:

| Resource      | Factory                       | Core methods                                                    | Extras                                                               |
| ------------- | ----------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| Posts         | `createPostsEndpoints`        | `list`, `listAll`, `pages`, `get`, `create`, `update`, `delete` | `getRevisions` for historical versions.                              |
| Pages         | `createPageEndpoints`         | `list`, `listAll`, `pages`, `get`, `create`, `update`, `delete` | `getRevisions`.                                                      |
| Media         | `createMediaEndpoints`        | `list`, `listAll`, `pages`, `get`, `create`, `update`, `delete` | `create` expects `File`/`Blob`; handles multipart form.              |
| Comments      | `createCommentsEndpoints`     | `list`, `listAll`, `pages`, `get`, `create`, `update`, `delete` | Status transitions (hold/approve/spam/trash).                        |
| Categories    | `createCategoryEndpoints`     | `list`, `listAll`, `pages`, `get`, `create`, `update`, `delete` | `_embed` support on single fetch.                                    |
| Tags          | `createTagsEndpoints`         | `list`, `listAll`, `pages`, `get`, `create`, `update`, `delete` | Pagination helpers via `createPaginationHelpers`.                    |
| Taxonomies    | `createTaxonomiesEndpoints`   | `list`, `listAll`, `pages`, `get`                               | Normalises REST object responses to arrays.                          |
| Users         | `createUsersEndpoints`        | `list`, `listAll`, `pages`, `get`, `create`, `update`, `delete` | `me()` for the authenticated principal.                              |
| Menus         | `createMenuEndpoints`         | `list`, `listAll`, `pages`, `get`, `create`, `update`, `delete` | Nested `items` namespace with full CRUD on menu items.               |
| Settings      | `createSettingsEndpoints`     | `get`, `update`                                                 | Full site setting snapshot with `WPSettings` typing.                 |
| Post Types    | `createPostTypesEndpoints`    | `list`, `listAll`, `pages`, `get`                               | Converts REST objects to arrays; includes capability/label metadata. |
| Post Statuses | `createPostStatusesEndpoints` | `list`, `listAll`, `pages`, `get`                               | Useful when building status-aware dashboards.                        |

### Pagination helpers

The shared `createPaginationHelpers` utility powers the `listAll()` and `pages()` helpers above. You can reuse it for custom endpoints:

```ts
import { createPaginationHelpers } from "wpjs-api";

const customList = async (params?: { page?: number; per_page?: number }) => {
  /* fetch your data */
};

const { listAll, pages } = createPaginationHelpers(customList);
```

#### Pagination response structure

All list operations return a `WPPaginatedResponse<T>` with the following structure:

```ts
interface WPPaginatedResponse<T> {
  items: T[]; // Array of resources
  pagination: {
    total: number; // Total number of items available
    totalPages: number; // Total number of pages
    currentPage: number; // Current page number (1-based)
    perPage: number; // Items per page
    hasMore: boolean; // Whether there are more pages available
  };
}
```

#### Choosing the right pagination method

- **`list()`**: Use when you need a specific page of results with full control over pagination parameters.

  ```ts
  const page1 = await posts.list({ page: 1, per_page: 10 });
  const page2 = await posts.list({ page: 2, per_page: 10 });
  ```

- **`listAll()`**: Use when you need all items at once. Automatically handles pagination behind the scenes.

  ```ts
  // Fetches all posts, handling pagination automatically
  const allPosts = await posts.listAll({ status: "publish" });
  ```

- **`pages()`**: Use when processing large datasets page by page to avoid memory issues.
  ```ts
  // Process 1000s of posts without loading all into memory
  for await (const page of posts.pages({ per_page: 100 })) {
    await processPage(page.items);
    console.log(
      `Processed ${page.pagination.currentPage}/${page.pagination.totalPages}`
    );
  }
  ```

### Types

Core interfaces exported from `wpjs-api`:

- `WPPaginatedResponse<T>` and `WPPaginationInfo`.
- Resource-specific models such as `WPPost`, `WPPage`, `WPMedia`, `WPUser`, `WPComment`, `WPCategory`, `WPTag`, `WPTaxonomy`, `WPPostType`, `WPPostStatus`, `WPMenu`, `WPMenuItem`, `WPSettings`, etc.
- Matching `Create`, `Update`, and parameter variants for each resource (`WPPostCreate`, `WPPostUpdate`, `WPPostParameters`, ...).
- Authentication contracts (`AuthConfig`, `AuthResponse`, credential interfaces).

Thanks to these types, editors can autocomplete filters (`orderby`, `status`, `context`, …) and payloads for every operation.

## Error Handling

The library provides a custom `WPApiError` class that extends the native `Error` with WordPress-specific error information:

### WPApiError Features

- **HTTP Status Code**: Access the response status code via `error.status`
- **WordPress Error Code**: Get the specific error code from WordPress via `error.code`
- **User-Friendly Messages**: Automatic generation of readable error messages via `error.userMessage`
- **Error Type Detection**: Built-in getters for common error types:
  - `error.isClientError` - 4xx errors
  - `error.isServerError` - 5xx errors
  - `error.isAuthError` - 401, 403 errors
  - `error.isNotFound` - 404 errors
  - `error.isRateLimitError` - 429 errors
- **Detailed Error Data**: Access full error response via `error.data`

### Example Usage

```ts
import { WPApiError } from "wpjs-api";

try {
  const post = await posts.get(123);
  console.log(post.title.rendered);
} catch (error) {
  if (error instanceof WPApiError) {
    console.error("Status:", error.status); // e.g., 404
    console.error("Code:", error.code); // e.g., "rest_post_invalid_id"
    console.error("Message:", error.message); // Technical message
    console.error("User Message:", error.userMessage); // "Resource not found"

    // Handle specific error types
    if (error.isAuthError) {
      // Redirect to login or refresh token
      console.log("Authentication required");
    } else if (error.isNotFound) {
      // Show 404 page
      console.log("Post not found");
    } else if (error.isRateLimitError) {
      // Implement backoff strategy
      console.log("Too many requests, please wait");
    }
  }
}
```

### User-Friendly Messages

`WPApiError` automatically generates user-friendly messages based on HTTP status codes:

- **400**: "Invalid request parameters"
- **401**: "Authentication required"
- **403**: "Access forbidden"
- **404**: "Resource not found"
- **429**: "Too many requests. Please try again later"
- **500**: "Internal server error"
- **502**: "Bad gateway"
- **503**: "Service temporarily unavailable"

## Request Cancellation with AbortController

The library supports request cancellation using the standard `AbortController` API. This is useful for:

- **Search as you type**: Cancel previous searches when user types
- **Component unmounting**: Prevent memory leaks in React/Vue/Angular
- **User cancellation**: Allow users to cancel slow requests
- **Timeouts**: Automatically cancel requests that take too long

### Basic Usage

```ts
const controller = new AbortController();

// Start a cancellable request
const postsPromise = posts.list(
  { per_page: 100 },
  { signal: controller.signal }
);

// Cancel it
controller.abort();

try {
  const result = await postsPromise;
} catch (error: any) {
  if (error.name === "AbortError") {
    console.log("Request was cancelled");
  }
}
```

### Search as You Type

```ts
let currentController: AbortController | null = null;

async function searchPosts(query: string) {
  // Cancel previous search
  if (currentController) {
    currentController.abort();
  }

  // Create new controller for this search
  currentController = new AbortController();

  try {
    const result = await posts.list(
      { search: query },
      { signal: currentController.signal }
    );
    return result;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Search cancelled");
      return null;
    }
    throw error;
  }
}
```

### React Component Cleanup

```ts
import { useEffect, useState } from "react";

function PostsList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    // Fetch posts with cancellation support
    posts
      .list({}, { signal: controller.signal })
      .then((result) => setPosts(result.items))
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error loading posts:", error);
        }
      });

    // Cleanup: abort request if component unmounts
    return () => {
      controller.abort();
    };
  }, []);

  return <div>{/* Render posts */}</div>;
}
```

### Request Timeout

```ts
async function fetchWithTimeout(timeoutMs: number = 5000) {
  const controller = new AbortController();

  // Set timeout
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await posts.list(
      { per_page: 100 },
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    return result;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}
```

### Multiple Requests with Single Controller

```ts
const controller = new AbortController();

try {
  // All requests can be cancelled together
  const [postsResult, pagesResult] = await Promise.all([
    posts.list({ per_page: 10 }, { signal: controller.signal }),
    pages.list({ per_page: 10 }, { signal: controller.signal }),
  ]);
} catch (error: any) {
  if (error.name === "AbortError") {
    console.log("All requests cancelled");
  }
}

// Cancel all requests at once
controller.abort();
```

> **Note**: See `examples/abort-controller.ts` for more advanced patterns including debounced search, retry logic, and cancel buttons.

## URL Normalization

The library automatically normalizes URLs to prevent common errors caused by inconsistent slash handling. This works transparently behind the scenes—you don't need to worry about whether your `baseUrl` has a trailing slash or not.

### The Problem

Before normalization, different `baseUrl` formats could cause issues:

- `"https://site.com"` + `"/wp/v2/posts"` → ✅ `https://site.com/wp/v2/posts`
- `"https://site.com/"` + `"/wp/v2/posts"` → ❌ `https://site.com//wp/v2/posts` (double slash → 404)
- `"https://site.com"` + `"wp/v2/posts"` → ❌ `https://site.comwp/v2/posts` (missing slash → invalid URL)
- `"https://site.com/"` + `"wp/v2/posts"` → ✅ `https://site.com/wp/v2/posts`

This led to:

1. 404 errors from double slashes
2. Invalid URLs from missing slashes
3. Inconsistent behavior depending on configuration

### The Solution

All URL construction now uses `normalizeUrl()` internally, which:

- Removes trailing slashes from `baseUrl`
- Ensures `path` starts with a slash
- Preserves protocol slashes (`https://`, `http://`)

**All of these now produce the same correct URL:**

```ts
// Any of these configurations work identically
const api1 = createPostsEndpoints({ baseUrl: "https://example.com" });
const api2 = createPostsEndpoints({ baseUrl: "https://example.com/" });
const api3 = createPostsEndpoints({ baseUrl: "https://example.com/wordpress" });
const api4 = createPostsEndpoints({
  baseUrl: "https://example.com/wordpress/",
});

// All produce correctly normalized URLs
await api1.list(); // → https://example.com/wp/v2/posts
await api2.list(); // → https://example.com/wp/v2/posts
await api3.list(); // → https://example.com/wordpress/wp/v2/posts
await api4.list(); // → https://example.com/wordpress/wp/v2/posts
```

### Edge Cases Handled

- **Localhost with ports**: `http://localhost:8080/` → Works correctly
- **Subdirectories**: `https://site.com/sites/blog/` → Normalized properly
- **Environment variables**: Works regardless of trailing slash in env vars
- **User input**: Safely handles any format users provide

> **Note**: This is completely transparent—your existing code continues to work without any changes. See `examples/url-normalization.ts` for detailed examples.

## Tips & Best Practices

### Performance optimization with `_fields`

When fetching large lists, use `_fields` to reduce response size and improve performance:

```ts
// Bad: Fetches all fields including content
const { items } = await posts.list({ per_page: 100 });

// Good: Only fetches what you need
const { items } = await posts.list({
  per_page: 100,
  _fields: ["id", "title", "excerpt", "date"],
});
```

### Efficient use of `_embed`

Use `_embed` sparingly—only when you actually need the related data:

```ts
// For listing: usually don't need embedded data
const { items } = await posts.list({ per_page: 10 });

// For single resource: embed when you need author, featured image, etc.
const post = await posts.get(123, "view", true);
const author = post._embedded?.author?.[0];
const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0];
```

### Error handling

The library provides comprehensive error handling with the `WPApiError` class. Always wrap API calls in try-catch blocks:

```ts
import { WPApiError } from "wpjs-api";

try {
  const post = await posts.get(123);
  console.log(post.title.rendered);
} catch (error) {
  if (error instanceof WPApiError) {
    // Use built-in error type detection
    if (error.isAuthError) {
      console.log("Authentication required:", error.userMessage);
    } else if (error.isNotFound) {
      console.log("Post not found:", error.userMessage);
    } else if (error.isRateLimitError) {
      console.log("Rate limited:", error.userMessage);
    }
  }
}
```

> See the [Error Handling](#error-handling) section above for comprehensive examples and best practices.

### Rate limiting considerations

WordPress has default rate limits. When fetching large datasets:

```ts
// Use listAll() for automatic pagination with built-in delays
const allPosts = await posts.listAll();

// Or manually control the pace with pages()
for await (const page of posts.pages({ per_page: 100 })) {
  await processPage(page.items);
  // Add a small delay if needed
  await new Promise((resolve) => setTimeout(resolve, 100));
}
```

### Memory efficiency for large datasets

When working with thousands of items, use the `pages()` iterator instead of `listAll()`:

```ts
// Bad: Loads everything into memory
const allPosts = await posts.listAll(); // Could be 10,000+ posts

// Good: Process page by page
for await (const page of posts.pages({ per_page: 100 })) {
  // Process only 100 items at a time
  await exportToFile(page.items);
}
```

## Building & Testing

### Build

```bash
npm run build
```

Compiles ESM and CJS bundles plus declaration files into `dist/`.

### Testing

The library has comprehensive test coverage with 85+ tests using [Vitest](https://vitest.dev/):

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

#### Test Coverage

Current coverage metrics:

- **85 tests passing** across all modules (including 14 URL normalization tests and 3 \_fields tests)
- **89.41% coverage** on core API (`src/api`)
- **93.18% coverage** on error handling (`errors.ts`)
- **76.26% coverage** on HTTP utilities (`http.ts`)
- **89.70% coverage** on authentication providers (`providers.ts`)

#### Test Structure

- `src/api/errors.test.ts` - Error handling and `WPApiError` class (17 tests)
- `src/api/http.test.ts` - HTTP utilities, URL building, and normalization (37 tests)
- `src/api/abort.test.ts` - AbortController support (11 tests)
- `src/auth/providers.test.ts` - Authentication providers (13 tests)
- `src/index.test.ts` - Integration tests (7 tests)

See `tests/README.md` for detailed testing documentation.

### Examples

The `examples/` directory contains practical usage examples:

- `examples/abort-controller.ts` - 8 real-world patterns for request cancellation
- `examples/error-handling.ts` - Error handling best practices and WPApiError usage
- `examples/url-normalization.ts` - URL normalization patterns and edge cases
- `examples/fields-optimization.ts` - Performance optimization with \_fields parameter

## Recent Improvements

This library has recently undergone significant improvements to enhance reliability, developer experience, and browser compatibility:

### ✅ Enhanced Error Handling

- Custom `WPApiError` class with detailed error information
- User-friendly error messages for common HTTP status codes
- Built-in error type detection (auth, not found, rate limit, etc.)
- Full error context including status codes, WordPress error codes, and response data
- **93.18% test coverage** on error handling

### ✅ Browser Compatibility

- Replaced Node.js-only `Buffer` API with standard `btoa()` for Base64 encoding
- All authentication methods now work in modern browsers
- Compatible with React, Vue, Angular, Svelte, and vanilla JavaScript
- Works in Web Workers and Service Workers
- **89.70% test coverage** on authentication providers

### ✅ Request Cancellation Support

- Full `AbortController` integration for all API methods
- Cancel in-flight requests for better UX and performance
- Prevent memory leaks in component unmounting scenarios
- Enable search-as-you-type with automatic previous request cancellation
- Implement timeouts and custom cancellation logic
- **11 comprehensive tests** for abort scenarios

### ✅ URL Normalization

- Automatic slash normalization prevents double-slash (404) and missing-slash (invalid URL) errors
- Handles all edge cases: localhost, ports, subdirectories, environment variables
- Protocol slashes (`https://`, `http://`) always preserved
- Works transparently—no code changes required
- **14 comprehensive tests** for all slash combinations and edge cases
- Examples and patterns in `examples/url-normalization.ts`

### ✅ \_fields Parameter Fix

- Fixed WordPress REST API `_fields` parameter to use comma-joining format
- Changed from incorrect `?_fields=id&_fields=title` to correct `?_fields=id,title`
- Improved performance optimization capabilities
- Works with empty arrays, single fields, and special characters
- **3 additional tests** for edge cases
- Examples in `examples/fields-optimization.ts`

### ✅ Comprehensive Testing

- **85+ tests** covering core functionality (including 14 URL normalization tests and 3 \_fields tests)
- **89.41% coverage** on core API modules
- Testing framework: Vitest (modern, fast, TypeScript-friendly)
- Includes tests for errors, HTTP utilities, authentication, and request cancellation
- Coverage reporting with v8

### ✅ Code Quality Improvements

- Refactored HTTP layer for better maintainability
- Eliminated ~1,438 lines of redundant code
- Improved TypeScript type safety
- Better code organization and documentation
- Examples and best practices for common use cases

## Roadmap

- Plugin-aware wrappers starting with popular ecosystems such as Yoast SEO, Advanced Custom Fields (ACF), and more.
- Built-in helpers for incremental cache revalidation across hosting platforms (Next.js `revalidateTag`, Cloudflare Cache API, Netlify On-Demand Builders, Fastly, and others).
- Request middlewares for retries, rate limiting, and telemetry.
- CLI scaffolding to generate typed clients for custom post types and taxonomies.
- Expanded documentation with cookbook examples and framework-specific guides.

Have an idea? Open an issue or pull request — contributions are welcome!

## Troubleshooting

### Common Issues

#### 1. `fetch is not defined`

**Problem**: Node.js versions before 18 don't have native `fetch`.

**Solution**: Use Node.js 18+ or install a polyfill:

```bash
npm install undici
```

```ts
import { fetch } from "undici";
global.fetch = fetch as any;
```

#### 2. 401 Unauthorized errors

**Problem**: Authentication credentials are invalid or expired.

**Solutions**:

- Verify your credentials are correct
- For application passwords, ensure they're enabled in WordPress settings
- Check that the user has appropriate permissions
- Implement token refresh logic for bearer tokens:
  ```ts
  const auth = createAuth({
    method: "bearer",
    credentials: {
      token: accessToken,
      refreshToken: refreshToken,
    },
    onTokenRefresh: async (newToken, newRefreshToken) => {
      // Save new tokens
      await saveTokens(newToken, newRefreshToken);
    },
  });
  ```

#### 3. CORS errors in browser

**Problem**: WordPress site blocking cross-origin requests.

**Solutions**:

- Configure CORS headers in WordPress (use a plugin or add to `.htaccess`)
- Use a server-side proxy
- For development, consider using a CORS proxy

#### 4. Rate limit errors (429 Too Many Requests)

**Problem**: Too many requests in a short time.

**Solution**: Implement delays between requests:

```ts
for await (const page of posts.pages()) {
  await processPage(page.items);
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
}
```

#### 5. Large response timeouts

**Problem**: Requests timing out when fetching many items.

**Solution**: Use smaller `per_page` values and `_fields` to reduce response size:

```ts
const { items } = await posts.list({
  per_page: 50, // Instead of 100
  _fields: ["id", "title", "date"], // Only essential fields
});
```

#### 6. Double slash in URLs (404 errors)

**Problem**: URLs with double slashes like `https://site.com//wp/v2/posts` return 404.

**Solution**: This is now handled automatically! The library normalizes all URLs to prevent double slashes. If you're still seeing this issue:

- Ensure you're using the latest version of wpjs-api
- Check if you're manually constructing URLs outside the library
- Verify your `baseUrl` configuration

```ts
// All of these work correctly now:
const api1 = createPostsEndpoints({ baseUrl: "https://site.com" });
const api2 = createPostsEndpoints({ baseUrl: "https://site.com/" });
// Both produce correct URLs without double slashes
```

### WordPress API Limits

- **Maximum `per_page`**: 100 items (WordPress default)
- **Default `per_page`**: 10 items
- **Nested depth**: Limited for `_embed` relationships
- **Search queries**: May have performance impact on large sites

### Getting Help

- Check the [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- Review your WordPress site's REST API at `https://your-site.com/wp-json/`
- Enable WordPress debug mode to see detailed error messages
- Check browser DevTools Network tab for detailed error responses

## Contributing

1. Fork and clone the repository.
2. Install dependencies with your preferred package manager.
3. Run `npm run build` to verify the TypeScript output.
4. Submit a PR describing the changes (bug fixes, new endpoints, docs, etc.).

## License

ISC © Àngel Ayach Boadas.
