import { QueryClient } from "@tanstack/react-query";

const ONE_MINUTE_MS = 60 * 1000;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: ONE_MINUTE_MS,
        refetchOnWindowFocus: false,
      },
    },
  });
}
