import { RequestOptions, WPPaginatedResponse } from "./types";

type ListFunction<T, P> = (
  params?: P,
  options?: RequestOptions
) => Promise<WPPaginatedResponse<T>>;

/**
 * Creates pagination helper functions for a list endpoint
 * @param listFn The list function to create helpers for
 * @returns Object with listAll and pages helper functions
 */
export function createPaginationHelpers<
  T,
  P extends { page?: number; per_page?: number }
>(listFn: ListFunction<T, P>) {
  return {
    /**
     * Lists all items by automatically handling pagination
     * @param params Optional parameters for the list function (page and per_page will be overridden)
     * @returns Promise with all items
     */
    listAll: async (
      params?: Omit<P, "page" | "per_page">,
      options?: RequestOptions
    ): Promise<T[]> => {
      const items: T[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await listFn(
          {
            ...params,
            page,
            per_page: 100,
          } as P,
          options
        );

        items.push(...response.items);
        hasMore = response.pagination.hasMore;
        page++;
      }

      return items;
    },

    /**
     * Returns an async iterator that yields each page of results
     * @param params Optional parameters for the list function
     * @returns AsyncGenerator that yields each page of results
     */
    pages: async function* (
      params?: P,
      options?: RequestOptions
    ): AsyncGenerator<WPPaginatedResponse<T>, void, unknown> {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await listFn({ ...params, page } as P, options);
        yield response;

        const { totalPages = 1 } = response.pagination;
        hasMore = page < totalPages;
        page++;
      }
    },
  };
}
