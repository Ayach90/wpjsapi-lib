/**
 * Example: Robust error handling with wpjs-api
 *
 * This example demonstrates how to use the WPApiError class
 * for comprehensive error handling in your WordPress applications.
 */

import { createPostsEndpoints, createAuth, WPApiError } from "wpjs-api";

// Initialize the API
const auth = createAuth({
  method: "basic",
  credentials: {
    username: process.env.WP_USER || "admin",
    password: process.env.WP_PASS || "password",
  },
});

const posts = createPostsEndpoints({
  baseUrl: process.env.WP_URL || "https://example.com/wp-json",
  auth,
});

/**
 * Example 1: Basic error handling
 */
async function example1_basicErrorHandling() {
  console.log("\n=== Example 1: Basic Error Handling ===\n");

  try {
    // Try to get a post that doesn't exist
    const post = await posts.get(999999, "view", false, {});
    console.log("Post found:", post.title.rendered);
  } catch (error) {
    if (error instanceof WPApiError) {
      console.log("Error caught!");
      console.log("- Status:", error.status);
      console.log("- Code:", error.code);
      console.log("- Message:", error.message);
      console.log("- User-friendly:", error.userMessage);
    }
  }
}

/**
 * Example 2: Error type checking
 */
async function example2_errorTypeChecking() {
  console.log("\n=== Example 2: Error Type Checking ===\n");

  try {
    // Try to create a post without authentication
    const post = await posts.create(
      {
        title: "New Post",
        content: "This will fail",
        status: "publish",
      },
      {}
    );
  } catch (error) {
    if (error instanceof WPApiError) {
      if (error.isAuthError) {
        console.log("⚠️  Authentication error detected!");
        console.log("   Please check your credentials");
      } else if (error.isNotFound) {
        console.log("❌ Resource not found");
      } else if (error.isRateLimitError) {
        console.log("⏱️  Rate limit exceeded, please wait");
      } else if (error.isClientError) {
        console.log("🔧 Client error:", error.userMessage);
      } else if (error.isServerError) {
        console.log("🔥 Server error:", error.userMessage);
      }
    }
  }
}

/**
 * Example 3: Retry logic with exponential backoff
 */
async function example3_retryWithBackoff() {
  console.log("\n=== Example 3: Retry Logic ===\n");

  async function fetchWithRetry(id: number, maxRetries = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries}...`);
        return await posts.get(id, "view", false, {});
      } catch (error) {
        if (error instanceof WPApiError) {
          // Don't retry client errors (except rate limiting)
          if (error.isClientError && !error.isRateLimitError) {
            console.log("Client error detected, not retrying");
            throw error;
          }

          // Don't retry on last attempt
          if (attempt === maxRetries) {
            console.log("Max retries reached");
            throw error;
          }

          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          console.log(
            `  Failed with ${error.status}, retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }

  try {
    const post = await fetchWithRetry(1);
    console.log("✅ Post fetched successfully:", post.title.rendered);
  } catch (error) {
    if (error instanceof WPApiError) {
      console.log("❌ Failed after all retries:", error.userMessage);
    }
  }
}

/**
 * Example 4: Global error handler
 */
function createErrorHandler() {
  return function handleError(error: unknown): {
    message: string;
    shouldRetry: boolean;
    shouldNotify: boolean;
  } {
    if (error instanceof WPApiError) {
      console.error("API Error Details:", error.toJSON());

      return {
        message: error.userMessage,
        shouldRetry: error.isServerError || error.isRateLimitError,
        shouldNotify: error.isAuthError || error.isNotFound,
      };
    }

    // Handle non-API errors
    return {
      message: "An unexpected error occurred",
      shouldRetry: false,
      shouldNotify: true,
    };
  };
}

async function example4_globalErrorHandler() {
  console.log("\n=== Example 4: Global Error Handler ===\n");

  const handleError = createErrorHandler();

  try {
    await posts.update(99999, { title: "Updated" }, {});
  } catch (error) {
    const result = handleError(error);
    console.log("Error Message:", result.message);
    console.log("Should Retry:", result.shouldRetry);
    console.log("Should Notify User:", result.shouldNotify);
  }
}

/**
 * Example 5: Logging and monitoring
 */
async function example5_loggingAndMonitoring() {
  console.log("\n=== Example 5: Logging and Monitoring ===\n");

  function logError(error: WPApiError) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: error.toJSON(),
      environment: process.env.NODE_ENV || "development",
    };

    console.log("📝 Error Log Entry:");
    console.log(JSON.stringify(logEntry, null, 2));

    // In production, send to monitoring service
    // await monitoringService.logError(logEntry);
  }

  try {
    await posts.delete(99999, false, {});
  } catch (error) {
    if (error instanceof WPApiError) {
      logError(error);
    }
  }
}

/**
 * Run all examples
 */
async function main() {
  console.log("🚀 WordPress API Error Handling Examples\n");

  try {
    await example1_basicErrorHandling();
    await example2_errorTypeChecking();
    await example3_retryWithBackoff();
    await example4_globalErrorHandler();
    await example5_loggingAndMonitoring();

    console.log("\n✅ All examples completed!\n");
  } catch (error) {
    console.error("Fatal error:", error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  example1_basicErrorHandling,
  example2_errorTypeChecking,
  example3_retryWithBackoff,
  example4_globalErrorHandler,
  example5_loggingAndMonitoring,
};
