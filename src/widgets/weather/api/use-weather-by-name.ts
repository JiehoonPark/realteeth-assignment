'use client';

import { useQuery } from "@tanstack/react-query";

import { getWeatherByName } from "@/entities/weather/api/get-weather-by-name";
import { weatherQueryKeys } from "@/entities/weather/model/query-keys";

export function useWeatherByName(locationName: string | undefined) {
  const queryResult = useQuery({
    queryKey: locationName ? weatherQueryKeys.byName(locationName) : ["current-weather", "idle"],
    queryFn: () => {
      if (!locationName) {
        throw new Error("장소명이 제공되지 않았습니다.");
      }
      return getWeatherByName(locationName);
    },
    enabled: Boolean(locationName),
  });

  return queryResult;
}
