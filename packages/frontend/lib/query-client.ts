import { QueryClient } from '@tanstack/react-query';
import { HttpError } from './http-error';

/**
 * Create a React Query client with the project-wide defaults.
 *
 * A factory (rather than a module-level singleton) is required so SSR/Next
 * never shares one cache across requests. Every runtime (web, native) should
 * create exactly one client per app instance.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
          // Validation (4xx) or client errors won't fix themselves on retry.
          // Only retry network errors (status 0) and 5xx server errors, twice at most.
          if (error instanceof HttpError && error.status !== 0 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false, // Never auto-retry a write/mutation
      },
    },
  });
}
