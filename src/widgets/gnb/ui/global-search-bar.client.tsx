'use client';

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { useState } from "react";

import { Search } from "lucide-react";

import { getWeatherByName, weatherQueryKeys } from "@/entities/weather";
import { useLocationSearch } from "@/features/search";
import { useDebouncedValue } from "@/shared/lib/use-debounce";
import { Input } from "@/shared/ui/input";

const DEBOUNCE_DELAY_MS = 200;

export function GlobalSearchBar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(keyword, DEBOUNCE_DELAY_MS);
  const { results, message } = useLocationSearch({ keyword: debouncedKeyword });

  const handleSubmit = () => {
    const trimmedKeyword = debouncedKeyword.trim();
    if (!trimmedKeyword) return;

    if (results.length > 0) {
      handleSelect(results[0].id);
      return;
    }

    router.push(`/search?keyword=${encodeURIComponent(trimmedKeyword)}`);
    setKeyword("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    handleSubmit();
  };

  const handleSelect = (locationId: string) => {
    router.push(`/locations/${encodeURIComponent(locationId)}`);
    setKeyword("");
  };

  const handlePrefetch = (locationId: string, locationName: string) => {
    router.prefetch(`/locations/${encodeURIComponent(locationId)}`);
    void queryClient.prefetchQuery({
      queryKey: weatherQueryKeys.byName(locationName),
      queryFn: () => getWeatherByName(locationName),
    });
  };

  return (
    <div className="relative w-full max-w-xl">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        placeholder="예: 서울특별시, 종로구, 청운동"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        onKeyDown={handleKeyDown}
        className="bg-background pl-9"
      />
      {(debouncedKeyword || message) && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-md border border-border bg-background shadow-lg">
          {message ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">{message}</p>
          ) : (
            <ul className="space-y-1 p-2">
              {results.map((location) => (
                <li key={location.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(location.id)}
                    onPointerEnter={() =>
                      handlePrefetch(location.id, location.fullName)
                    }
                    className="w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-accent"
                  >
                    <span className="block text-sm font-medium text-foreground">{location.fullName}</span>
                    <span className="block text-xs text-muted-foreground capitalize">{location.level}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
