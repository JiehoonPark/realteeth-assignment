'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLocationSearch } from "@/features/search";
import { useDebouncedValue } from "@/shared/lib/use-debounce";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

export function LocationSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(keyword, 200);
  const { results, message } = useLocationSearch({ keyword: debouncedKeyword });

  const handleSelect = (locationId: string) => {
    router.push(`/locations/${encodeURIComponent(locationId)}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>장소 검색</CardTitle>
        <CardDescription>시/군/구/동 단위로 검색 후 선택하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative space-y-2">
          <Input
            placeholder="예: 서울특별시, 종로구, 청운동"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          {(debouncedKeyword || message) && (
            <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-72 overflow-y-auto rounded-md border border-border bg-background shadow-lg">
              {message ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">{message}</p>
              ) : (
                <ul className="space-y-1 p-2">
                  {results.map((location) => (
                    <li key={location.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(location.id)}
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
      </CardContent>
    </Card>
  );
}
