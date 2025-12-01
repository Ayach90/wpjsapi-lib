/**
 * URL Normalization Examples
 *
 * Demonstrates how the wpjs-api library automatically handles
 * trailing/leading slashes to prevent common URL construction errors.
 */

import { createPostsEndpoints, createPageEndpoints } from "../src";

/**
 * Problem: Before normalization
 *
 * Different baseUrl formats would cause issues:
 * - "https://site.com"  + "/wp/v2/posts" → ✅ https://site.com/wp/v2/posts
 * - "https://site.com/" + "/wp/v2/posts" → ❌ https://site.com//wp/v2/posts (double slash)
 * - "https://site.com"  + "wp/v2/posts"  → ❌ https://site.comwp/v2/posts (missing slash)
 * - "https://site.com/" + "wp/v2/posts"  → ✅ https://site.com/wp/v2/posts
 *
 * This led to:
 * 1. 404 errors from double slashes
 * 2. Invalid URLs from missing slashes
 * 3. Inconsistent behavior depending on configuration
 */

/**
 * Solution: Automatic normalization
 *
 * All of these now produce the same correct URL:
 */
async function normalizedUrlExamples() {
  // Example 1: baseUrl with trailing slash
  const posts1 = createPostsEndpoints({
    baseUrl: "https://example.com/",
  });
  await posts1.list(); // → https://example.com/wp/v2/posts

  // Example 2: baseUrl without trailing slash
  const posts2 = createPostsEndpoints({
    baseUrl: "https://example.com",
  });
  await posts2.list(); // → https://example.com/wp/v2/posts

  // Example 3: baseUrl with subdirectory and trailing slash
  const posts3 = createPostsEndpoints({
    baseUrl: "https://example.com/wordpress/",
  });
  await posts3.list(); // → https://example.com/wordpress/wp/v2/posts

  // Example 4: baseUrl with subdirectory without trailing slash
  const posts4 = createPostsEndpoints({
    baseUrl: "https://example.com/wordpress",
  });
  await posts4.list(); // → https://example.com/wordpress/wp/v2/posts

  // All of the above produce correctly formatted URLs ✅
}

/**
 * Edge cases that are now handled correctly
 */
async function edgeCaseExamples() {
  // Edge case 1: Localhost with port
  const localPosts = createPostsEndpoints({
    baseUrl: "http://localhost:8080/",
  });
  await localPosts.list();
  // → http://localhost:8080/wp/v2/posts ✅

  // Edge case 2: Multiple subdirectories
  const pages = createPageEndpoints({
    baseUrl: "https://example.com/sites/blog/",
  });
  await pages.list();
  // → https://example.com/sites/blog/wp/v2/pages ✅

  // Edge case 3: Custom REST API base (non-standard)
  // If your WordPress installation uses a custom REST API prefix
  const customPosts = createPostsEndpoints({
    baseUrl: "https://example.com/custom-api/",
  });
  // Still works correctly with normalization
}

/**
 * Protocol slashes are always preserved
 */
function protocolPreservation() {
  // The normalization function is smart enough to:
  // 1. Remove trailing slashes from baseUrl
  // 2. Ensure path starts with a slash
  // 3. But NEVER touch the protocol slashes (https://)

  // These all preserve https:// correctly:
  const examples = [
    "https://site.com/",
    "http://localhost:3000/",
    "https://subdomain.example.com/path/",
  ];

  // All produce valid URLs with https:// intact ✅
}

/**
 * Benefits of automatic normalization
 */
const benefits = {
  // 1. No more 404 errors from double slashes
  noDoubleSlashes: true,

  // 2. No more invalid URLs from missing slashes
  noMissingSlashes: true,

  // 3. Consistent behavior regardless of configuration
  consistentBehavior: true,

  // 4. Works with any baseUrl format (with or without trailing slash)
  flexibleInput: true,

  // 5. Handles edge cases (localhost, subdirectories, ports)
  edgeCaseSupport: true,

  // 6. Backward compatible - existing code continues to work
  backwardCompatible: true,

  // 7. Protocol slashes always preserved (https://, http://)
  protocolSafe: true,
};

/**
 * Migration guide
 *
 * Good news: You don't need to change anything!
 *
 * The normalization happens automatically under the hood.
 * Your existing code will continue to work, but now it's
 * more robust and handles edge cases correctly.
 */
async function migrationExample() {
  // BEFORE: Had to be careful about slashes
  // const posts = createPostsEndpoints({
  //   baseUrl: "https://site.com",  // Must be exactly this format
  // });

  // AFTER: Any format works
  const posts = createPostsEndpoints({
    baseUrl: "https://site.com", // ✅ Works
    // OR
    // baseUrl: "https://site.com/", // ✅ Also works
  });

  await posts.list();
  // Both configurations now produce the same correct URL
}

/**
 * Common patterns that now work reliably
 */
async function commonPatterns() {
  // Pattern 1: Environment variables (might include or exclude trailing slash)
  const postsFromEnv = createPostsEndpoints({
    baseUrl: process.env.WORDPRESS_URL || "https://default.com/",
  });
  // Works regardless of whether env var has trailing slash ✅

  // Pattern 2: User configuration (can't control their input)
  function createPostsFromUserConfig(userBaseUrl: string) {
    return createPostsEndpoints({
      baseUrl: userBaseUrl, // User might provide any format
    });
  }
  // Handles all user input correctly ✅

  // Pattern 3: Dynamic URLs (constructed at runtime)
  const subdomain = "blog"; // Example subdomain
  const dynamicPosts = createPostsEndpoints({
    baseUrl: `https://${subdomain}.example.com/`,
  });
  // Works with computed URLs ✅
}

/**
 * Testing tip
 *
 * When writing tests, you can now use any slash format:
 */
function testingTip() {
  // All of these are equivalent in tests:
  const testCases = [
    { baseUrl: "https://test.com", expected: "works" },
    { baseUrl: "https://test.com/", expected: "works" },
  ];

  // No need to test multiple slash combinations anymore!
}

// Export examples
export {
  normalizedUrlExamples,
  edgeCaseExamples,
  protocolPreservation,
  benefits,
  migrationExample,
  commonPatterns,
  testingTip,
};
