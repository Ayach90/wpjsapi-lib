/**
 * Examples of using AbortController to cancel requests
 *
 * AbortController allows you to cancel in-flight HTTP requests.
 * This is useful for:
 * - Search as you type (cancel previous searches)
 * - Component unmount (prevent memory leaks)
 * - User cancellation (cancel button)
 * - Timeouts (cancel slow requests)
 */

import { createPostsEndpoints } from "../src/api/posts";

const posts = createPostsEndpoints({
  baseUrl: "https://example.com/wp-json",
});

// ============================================================================
// Example 1: Basic abort usage
// ============================================================================
async function basicAbortExample() {
  const controller = new AbortController();

  // Start a request
  const promise = posts.list({ per_page: 100 }, { signal: controller.signal });

  // Cancel it after 1 second
  setTimeout(() => {
    controller.abort();
    console.log("Request cancelled");
  }, 1000);

  try {
    const result = await promise;
    console.log("Success:", result);
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Request was aborted");
    } else {
      console.error("Other error:", error);
    }
  }
}

// ============================================================================
// Example 2: Search as you type (cancel previous searches)
// ============================================================================
let currentSearchController: AbortController | null = null;

async function searchPosts(query: string) {
  // Cancel the previous search if it's still running
  if (currentSearchController) {
    currentSearchController.abort();
  }

  // Create a new controller for this search
  currentSearchController = new AbortController();

  try {
    const result = await posts.list(
      { search: query },
      { signal: currentSearchController.signal }
    );

    console.log(`Search results for "${query}":`, result.items);
    return result;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log(`Search for "${query}" was cancelled`);
    } else {
      throw error;
    }
  }
}

// User types: "h" -> "he" -> "hel" -> "hello"
// Only the last search ("hello") will complete
async function searchAsYouTypeExample() {
  await searchPosts("h"); // Will be cancelled
  await searchPosts("he"); // Will be cancelled
  await searchPosts("hel"); // Will be cancelled
  await searchPosts("hello"); // Will complete
}

// ============================================================================
// Example 3: React component with cleanup on unmount
// ============================================================================
function ReactComponentExample() {
  /* This is pseudo-code for illustration
  
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const controller = new AbortController();
    
    // Fetch posts
    posts.list({}, { signal: controller.signal })
      .then(result => setPosts(result.items))
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Error loading posts:', error);
        }
      });
    
    // Cleanup: abort request if component unmounts
    return () => {
      controller.abort();
    };
  }, []);
  
  */
}

// ============================================================================
// Example 4: Timeout - cancel slow requests
// ============================================================================
async function fetchWithTimeout(timeoutMs: number = 5000) {
  const controller = new AbortController();

  // Set timeout to abort
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const result = await posts.list(
      { per_page: 100 },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);
    console.log("Success:", result);
    return result;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      console.error(`Request timed out after ${timeoutMs}ms`);
      throw new Error("Request timeout");
    }

    throw error;
  }
}

// ============================================================================
// Example 5: Cancel button in UI
// ============================================================================
class PostsLoader {
  private controller: AbortController | null = null;

  async loadPosts() {
    // Create new controller
    this.controller = new AbortController();

    try {
      const result = await posts.list(
        { per_page: 50 },
        { signal: this.controller.signal }
      );

      console.log("Posts loaded:", result.items.length);
      return result;
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("User cancelled the request");
      } else {
        throw error;
      }
    }
  }

  cancel() {
    if (this.controller) {
      this.controller.abort();
      console.log("Cancelled by user");
    }
  }
}

// Usage:
const loader = new PostsLoader();
loader.loadPosts();

// User clicks "Cancel" button
// cancelButton.onclick = () => loader.cancel();

// ============================================================================
// Example 6: Multiple requests with single controller
// ============================================================================
async function loadMultipleResources() {
  const controller = new AbortController();

  try {
    // All these requests can be cancelled with one controller
    const [postsResult] = await Promise.all([
      posts.list({ per_page: 10 }, { signal: controller.signal }),
      // If you had categories endpoint:
      // categories.list({}, { signal: controller.signal }),
    ]);

    console.log("All loaded successfully");
    return { postsResult };
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("All requests cancelled");
    } else {
      throw error;
    }
  }
}

// ============================================================================
// Example 7: Retry with abort support
// ============================================================================
async function fetchWithRetry(
  maxRetries: number = 3,
  signal?: AbortSignal
): Promise<any> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}`);

      const result = await posts.list({ per_page: 10 }, { signal });

      console.log("Success!");
      return result;
    } catch (error: any) {
      lastError = error;

      // Don't retry if aborted
      if (error.name === "AbortError") {
        console.log("Aborted by user");
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        console.error("All retries failed");
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Usage with external abort control:
const controller = new AbortController();
fetchWithRetry(3, controller.signal);

// User can still cancel during retries
// controller.abort();

// ============================================================================
// Example 8: Debounced search with abort
// ============================================================================
function createDebouncedSearch(delayMs: number = 300) {
  let timeoutId: NodeJS.Timeout;
  let controller: AbortController | null = null;

  return async function debouncedSearch(query: string) {
    // Clear previous timeout
    clearTimeout(timeoutId);

    // Cancel previous request
    if (controller) {
      controller.abort();
    }

    // Wait before searching
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        controller = new AbortController();

        try {
          const result = await posts.list(
            { search: query },
            { signal: controller.signal }
          );
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delayMs);
    });
  };
}

const debouncedSearch = createDebouncedSearch(300);

// User types quickly: each keystroke cancels previous search
// debouncedSearch('h');
// debouncedSearch('he');
// debouncedSearch('hel');
// debouncedSearch('hello'); // Only this one will execute

// ============================================================================
// Run examples
// ============================================================================
if (require.main === module) {
  console.log("=== AbortController Examples ===\n");

  // Uncomment to run:
  // basicAbortExample();
  // searchAsYouTypeExample();
  // fetchWithTimeout();
}

export {
  basicAbortExample,
  searchAsYouTypeExample,
  fetchWithTimeout,
  PostsLoader,
  loadMultipleResources,
  fetchWithRetry,
  createDebouncedSearch,
};
