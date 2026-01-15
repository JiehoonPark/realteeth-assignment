'use client';

import { useQuery } from "@tanstack/react-query";

import type { LocationCoordinates } from "@/entities/location";
import {
  getWeatherByCoordinates,
  getWeatherByName,
  WEATHER_REFETCH_INTERVAL_MS,
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
  });
}
