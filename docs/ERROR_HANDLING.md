# Error Handling in wpjs-api

The library now includes a comprehensive error handling system with the `WPApiError` class that provides detailed information about API failures.

## Using WPApiError

### Basic Error Handling

```typescript
import { createPostsEndpoints, WPApiError } from "wpjs-api";

const posts = createPostsEndpoints({
  baseUrl: "https://example.com/wp-json",
});

try {
  const post = await posts.get(999999); // Non-existent post
} catch (error) {
  if (error instanceof WPApiError) {
    console.log(`Status: ${error.status}`);
    console.log(`Message: ${error.message}`);
    console.log(`Code: ${error.code}`);
    console.log(`User-friendly message: ${error.userMessage}`);
  }
}
```

### Error Properties

The `WPApiError` class provides several useful properties:

```typescript
try {
  await posts.create({ title: "Test" });
} catch (error) {
  if (error instanceof WPApiError) {
    // HTTP status code
    console.log(error.status); // e.g., 401, 404, 500

    // WordPress error code
    console.log(error.code); // e.g., 'rest_post_invalid_id'

    // Original response object
    console.log(error.response);

    // Additional error data from WordPress
    console.log(error.data);
  }
}
```

### Error Type Checking

Use helper methods to check specific error types:

```typescript
try {
  await posts.update(123, { status: "publish" });
} catch (error) {
  if (error instanceof WPApiError) {
    if (error.isAuthError) {
      console.log("Authentication required or permission denied");
      // Redirect to login page
    } else if (error.isNotFound) {
      console.log("Resource not found");
      // Show 404 page
    } else if (error.isRateLimitError) {
      console.log("Rate limit exceeded");
      // Wait and retry
    } else if (error.isClientError) {
      console.log("Client error (4xx)");
      // Show user-friendly error message
    } else if (error.isServerError) {
      console.log("Server error (5xx)");
      // Show maintenance page or retry
    }
  }
}
```

### User-Friendly Messages

Display user-friendly error messages with the `userMessage` property:

```typescript
try {
  await posts.delete(456);
} catch (error) {
  if (error instanceof WPApiError) {
    // Technical message for logging
    console.error("API Error:", error.message);

    // User-friendly message for UI
    alert(error.userMessage);
  }
}
```

### Error Logging

Convert errors to JSON for logging:

```typescript
try {
  await posts.list({ per_page: 1000 }); // Invalid per_page
} catch (error) {
  if (error instanceof WPApiError) {
    // Log complete error details
    console.error("API Error Details:", error.toJSON());

    // Send to error tracking service
    errorTrackingService.log(error.toJSON());
  }
}
```

## Common Error Codes

### WordPress REST API Error Codes

- `rest_post_invalid_id` - Invalid post ID
- `rest_forbidden` - Insufficient permissions
- `rest_invalid_param` - Invalid parameter
- `rest_post_invalid_page_number` - Invalid page number
- `rest_cannot_create` - Cannot create resource
- `rest_cannot_edit` - Cannot edit resource
- `rest_cannot_delete` - Cannot delete resource

### HTTP Status Codes

- **400 Bad Request** - Invalid request parameters
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error
- **502 Bad Gateway** - Gateway error
- **503 Service Unavailable** - Service temporarily unavailable

## Advanced Examples

### Retry Logic with Error Handling

```typescript
async function fetchPostWithRetry(id: number, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await posts.get(id);
    } catch (error) {
      if (error instanceof WPApiError) {
        // Don't retry client errors (except rate limiting)
        if (error.isClientError && !error.isRateLimitError) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

### Global Error Handler

```typescript
function handleWPError(error: unknown): string {
  if (error instanceof WPApiError) {
    // Log technical details
    console.error("WordPress API Error:", {
      status: error.status,
      code: error.code,
      message: error.message,
      data: error.data,
    });

    // Return user-friendly message
    return error.userMessage;
  }

  // Handle other errors
  return "An unexpected error occurred. Please try again.";
}

// Usage
try {
  await posts.create({ title: "New Post" });
} catch (error) {
  const userMessage = handleWPError(error);
  showNotification(userMessage, "error");
}
```

### TypeScript Type Guards

```typescript
function isWPApiError(error: unknown): error is WPApiError {
  return error instanceof WPApiError;
}

// Usage
try {
  await posts.list();
} catch (error) {
  if (isWPApiError(error)) {
    // TypeScript knows error is WPApiError
    console.log(error.status, error.code);
  }
}
```
