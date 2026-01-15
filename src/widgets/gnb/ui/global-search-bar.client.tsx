'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatLocationName, type LocationCoordinates } from "@/entities/location";
import { useLocationSearch } from "@/features/search";
import { useDebouncedValue } from "@/shared/lib/use-debounce";
import { Input } from "@/shared/ui/input";

const DEBOUNCE_DELAY_MS = 200;

type CoordinatesResponse = {
  latitude: number;
  longitude: number;
};

async function fetchCoordinatesByName(
  locationName: string,
): Promise<LocationCoordinates | undefined> {
  const response = await fetch(
    `/api/coordinates?name=${encodeURIComponent(locationName)}`,
  );

  if (!response.ok) return undefined;

  const data = (await response.json()) as CoordinatesResponse;
  const hasValidCoordinates =
    Number.isFinite(data.latitude) && Number.isFinite(data.longitude);

  if (!hasValidCoordinates) return undefined;

  return { latitude: data.latitude, longitude: data.longitude };
}

export function GlobalSearchBar() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(keyword, DEBOUNCE_DELAY_MS);
  const { results, message } = useLocationSearch({ keyword: debouncedKeyword });

  const handleSelect = async (locationId: string) => {
    const locationName = formatLocationName(locationId);
    let coordinates: LocationCoordinates | undefined;

    try {
      coordinates = await fetchCoordinatesByName(locationName);
    } catch (error) {
      coordinates = undefined;
    }

    const coordinateQuery = coordinates
      ? `?lat=${coordinates.latitude}&lon=${coordinates.longitude}`
      : "";

    router.push(`/locations/${encodeURIComponent(locationId)}${coordinateQuery}`);
    setKeyword("");
  };

  return (
    <div className="relative w-full max-w-xl">
      <Input
        placeholder="예: 서울특별시, 종로구, 청운동"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        className="bg-background"
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
                    onClick={() => void handleSelect(location.id)}
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
