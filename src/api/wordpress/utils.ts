import { WPPaginatedResponse } from "./types";

type ListFunction<T, P> = (params?: P) => Promise<WPPaginatedResponse<T>>;

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
    listAll: async (params?: Omit<P, "page">): Promise<T[]> => {
      const firstPage = await listFn({
        ...params,
        page: 1,
        per_page: 100,
      } as P);
      const totalPages = firstPage.pagination.totalPages;

      if (totalPages === 1) {
        return firstPage.items;
      }

      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          listFn({ ...params, page: i + 2, per_page: 100 } as P).then(
            (response) => response.items
          )
        )
      );

      return [...firstPage.items, ...remainingPages.flat()];
    },

    /**
     * Returns an async iterator that yields each page of results
     * @param params Optional parameters for the list function
     * @returns AsyncGenerator that yields each page of results
     */
    pages: async function* (
      params?: P
    ): AsyncGenerator<WPPaginatedResponse<T>, void, unknown> {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await listFn({ ...params, page } as P);
        yield response;

        const { totalPages = 1 } = response.pagination;
        hasMore = page < totalPages;
        page++;
      }
    },
  };
}
