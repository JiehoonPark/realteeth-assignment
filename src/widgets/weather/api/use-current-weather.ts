'use client';

import { useQuery } from "@tanstack/react-query";

import { getCurrentWeatherByCoords } from "@/entities/weather/api/get-current-weather";
import { weatherQueryKeys } from "@/entities/weather/model/query-keys";
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
  });

  return queryResult;
}
