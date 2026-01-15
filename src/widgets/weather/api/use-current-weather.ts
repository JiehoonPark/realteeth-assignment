'use client';

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getCurrentWeatherByCoords,
  WEATHER_CACHE_TIME_MS,
  WEATHER_REFETCH_INTERVAL_MS,
  WEATHER_STALE_TIME_MS,
  weatherQueryKeys,
} from "@/entities/weather";
import type { GeolocationPosition } from "@/shared/lib/geolocation";

type UseCurrentWeatherParams = GeolocationPosition | undefined;

export function useCurrentWeather(coords: UseCurrentWeatherParams) {
  const queryResult = useQuery({
    queryKey: coords ? weatherQueryKeys.current(coords.latitude, coords.longitude) : ["current-weather", "idle"],
    queryFn: () => {
      if (!coords) {
        throw new Error("좌표가 제공되지 않았습니다.");
      }
      return getCurrentWeatherByCoords(coords);
    },
    enabled: Boolean(coords),
    refetchInterval: WEATHER_REFETCH_INTERVAL_MS,
    staleTime: WEATHER_STALE_TIME_MS,
    gcTime: WEATHER_CACHE_TIME_MS,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  return queryResult;
}
