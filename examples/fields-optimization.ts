/**
 * Example: Using _fields parameter for performance optimization
 *
 * The _fields parameter allows you to limit which fields are returned
 * from the WordPress REST API, reducing response size and improving performance.
 *
 * This example demonstrates the correct usage after the _fields bug fix.
 */

import { createPostsEndpoints } from "../src";

async function fieldsOptimizationExample() {
  const posts = createPostsEndpoints({
    baseUrl: "https://your-site.com",
  });

  // Example 1: Fetch only essential fields for a list
  console.log("Example 1: Fetch only ID, title, and excerpt");
  const postsResult = await posts.list({
    per_page: 10,
    _fields: ["id", "title", "excerpt"],
  });
  console.log(`Fetched ${postsResult.items.length} posts with minimal data`);
  // Result: ?per_page=10&_fields=id,title,excerpt

  // Example 2: Fetch nested fields (meta fields, author data)
  console.log("\nExample 2: Fetch nested fields");
  const postsWithMeta = await posts.list({
    _fields: ["id", "title", "meta.custom_field", "author.name"],
    per_page: 5,
  });
  // Result: ?_fields=id,title,meta.custom_field,author.name&per_page=5

  // Example 3: Combine with _embed for related resources
  console.log("\nExample 3: Combine _fields with _embed");
  const postsWithFeaturedImage = await posts.list({
    _embed: true,
    _fields: ["id", "title", "_embedded.wp:featuredmedia", "_embedded.author"],
    per_page: 5,
  });
  // Result: ?_embed=true&_fields=id,title,_embedded.wp:featuredmedia,_embedded.author&per_page=5

  // Example 4: Single post with specific fields
  console.log("\nExample 4: Single post with specific fields");
  const post = await posts.get(1, "view", false);
  // Note: _fields parameter is supported in list() but not in individual get()
  // For single posts, WordPress returns all fields by default

  // Example 5: Optimize for search results
  console.log("\nExample 5: Optimize search results");
  const searchResults = await posts.list({
    search: "javascript",
    _fields: ["id", "title", "excerpt", "link"],
    per_page: 20,
  });
  console.log(`Found ${searchResults.items.length} matching posts`);
  // Result: ?search=javascript&_fields=id,title,excerpt,link&per_page=20

  // Example 6: Fetch only IDs for counting or bulk operations
  console.log("\nExample 6: Fetch only IDs");
  const postIds = await posts.list({
    _fields: ["id"],
    per_page: 100,
  });
  const ids = postIds.items.map((post: any) => post.id);
  console.log(`Retrieved ${ids.length} post IDs`);
  // Result: ?_fields=id&per_page=100

  // Example 7: Combine with filtering
  console.log("\nExample 7: Combine _fields with filtering");
  const recentPosts = await posts.list({
    status: "publish",
    categories: [1, 5],
    _fields: ["id", "title", "date", "categories"],
    orderby: "date",
    order: "desc",
    per_page: 10,
  });
  // Result: ?status=publish&categories=1&categories=5&_fields=id,title,date,categories&orderby=date&order=desc&per_page=10

  // Example 8: Using with AbortController for cancellable requests
  console.log("\nExample 8: _fields with AbortController");
  const controller = new AbortController();

  // Simulate cancel after 100ms
  setTimeout(() => controller.abort(), 100);

  try {
    const postsAbort = await posts.list(
      {
        _fields: ["id", "title"],
        per_page: 50,
      },
      { signal: controller.signal }
    );
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Request was cancelled");
    }
  }
}

// Performance comparison
async function performanceComparison() {
  const posts = createPostsEndpoints({
    baseUrl: "https://your-site.com",
  });

  console.log("\n=== Performance Comparison ===\n");

  // Without _fields (full response)
  console.time("Full response");
  const fullPosts = await posts.list({ per_page: 10 });
  console.timeEnd("Full response");
  console.log(`Full response size: ~${JSON.stringify(fullPosts).length} bytes`);

  // With _fields (optimized response)
  console.time("Optimized response");
  const optimizedPosts = await posts.list({
    per_page: 10,
    _fields: ["id", "title", "excerpt"],
  });
  console.timeEnd("Optimized response");
  console.log(
    `Optimized response size: ~${JSON.stringify(optimizedPosts).length} bytes`
  );

  const reduction =
    ((JSON.stringify(fullPosts).length -
      JSON.stringify(optimizedPosts).length) /
      JSON.stringify(fullPosts).length) *
    100;
  console.log(`\nSize reduction: ${reduction.toFixed(1)}%`);
}

// Common _fields patterns
const commonFieldsPatterns = {
  // Minimal listing (for cards, previews)
  listing: ["id", "title", "excerpt", "date", "link"],

  // Search results
  search: ["id", "title", "excerpt", "link", "type"],

  // Archive page
  archive: [
    "id",
    "title",
    "excerpt",
    "date",
    "categories",
    "tags",
    "_embedded.wp:featuredmedia",
  ],

  // Single post navigation
  navigation: ["id", "title", "link"],

  // Admin listing
  admin: ["id", "title", "status", "date", "modified", "author"],

  // RSS feed
  rss: ["id", "title", "content", "excerpt", "date", "link"],

  // SEO/metadata only
  metadata: ["id", "title", "excerpt", "meta.yoast_wpseo_title"],

  // Bulk operations
  bulkIds: ["id"],
};

// Export examples
export {
  fieldsOptimizationExample,
  performanceComparison,
  commonFieldsPatterns,
};
