'use client';

import type { LocationCoordinates } from "@/entities/location";
import { FavoriteToggleButton, useFavorites } from "@/features/favorites";
import { useWeatherByLocation } from "@/widgets/weather/api/use-weather-by-location";
import { WeatherSummaryCard } from "@/widgets/weather/ui/weather-summary-card.client";

type LocationDetailClientProps = {
  locationId: string;
  initialCoordinates?: LocationCoordinates;
};

function normalizeLocationName(rawId: string) {
  const decoded = decodeURIComponent(rawId ?? "");
  return decoded.split("-").join(" ");
}

export default function LocationDetailClient({
  locationId,
  initialCoordinates,
}: LocationDetailClientProps) {
  const locationName = normalizeLocationName(locationId);
  const { getFavoriteByLocationId } = useFavorites();
  const favorite = getFavoriteByLocationId(locationId);
  const resolvedCoordinates = initialCoordinates ?? favorite?.coordinates;
  const aliasDescription =
    favorite?.alias && favorite.alias !== locationName ? favorite.alias : undefined;
  const weatherQuery = useWeatherByLocation({
    locationName,
    coordinates: resolvedCoordinates,
  });
  const coordinatesForFavorite = weatherQuery.data?.coordinates ?? resolvedCoordinates;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-8">
      <div>
        <FavoriteToggleButton
          locationId={locationId}
          initialAlias={locationName}
          coordinates={coordinatesForFavorite}
        />
      </div>
      <WeatherSummaryCard
        title={`${locationName} 날씨`}
        description={aliasDescription}
        summary={weatherQuery.data}
        isLoading={weatherQuery.isLoading}
        errorMessage={weatherQuery.error instanceof Error ? weatherQuery.error.message : undefined}
        fallbackText="날씨 정보를 가져오지 못했습니다."
      />
    </main>
  );
}
