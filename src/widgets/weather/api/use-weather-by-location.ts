'use client';

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { LocationCoordinates } from "@/entities/location";
import {
  getWeatherByCoordinates,
  getWeatherByName,
  WEATHER_CACHE_TIME_MS,
  WEATHER_REFETCH_INTERVAL_MS,
  WEATHER_STALE_TIME_MS,
  weatherQueryKeys,
} from "@/entities/weather";

type UseWeatherByLocationParams = {
  locationName: string;
  coordinates?: LocationCoordinates;
};

function hasValidCoordinates(coordinates: LocationCoordinates | undefined) {
  return (
    Boolean(coordinates) &&
    Number.isFinite(coordinates?.latitude) &&
    Number.isFinite(coordinates?.longitude)
  );
}

export function useWeatherByLocation({
  locationName,
  coordinates,
}: UseWeatherByLocationParams) {
  const canUseCoordinates = hasValidCoordinates(coordinates);

  return useQuery({
    queryKey: canUseCoordinates
      ? weatherQueryKeys.current(coordinates!.latitude, coordinates!.longitude)
      : weatherQueryKeys.byName(locationName),
    queryFn: () =>
      canUseCoordinates
        ? getWeatherByCoordinates({
            latitude: coordinates!.latitude,
            longitude: coordinates!.longitude,
          })
        : getWeatherByName(locationName),
    enabled: canUseCoordinates ? true : Boolean(locationName),
    refetchInterval: WEATHER_REFETCH_INTERVAL_MS,
    staleTime: WEATHER_STALE_TIME_MS,
    gcTime: WEATHER_CACHE_TIME_MS,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}
