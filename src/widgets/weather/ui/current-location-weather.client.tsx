'use client';

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { requestCurrentPosition, type GeolocationError, type GeolocationPosition } from "@/shared/lib/geolocation";
import { useCurrentWeather } from "@/widgets/weather/api/use-current-weather";
import { WeatherSummaryCard } from "@/widgets/weather/ui/weather-summary-card.client";

type WeatherState = {
  isRequestingLocation: boolean;
  locationError: GeolocationError | null;
  coordinates: GeolocationPosition | null;
};

const LAST_KNOWN_COORDINATES_QUERY_KEY = ["last-known-coordinates"];

function normalizeError(error: unknown): string | undefined {
  if (error instanceof Error) return error.message;
  return undefined;
}

export function CurrentLocationWeather() {
  const queryClient = useQueryClient();
  const cachedCoordinates =
    queryClient.getQueryData<GeolocationPosition>(LAST_KNOWN_COORDINATES_QUERY_KEY) ?? null;
  const [state, setState] = useState<WeatherState>(() => ({
    isRequestingLocation: !cachedCoordinates,
    locationError: null,
    coordinates: cachedCoordinates,
  }));

  const requestLocation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRequestingLocation: !prev.coordinates,
      locationError: null,
    }));
    let isMounted = true;

    requestCurrentPosition()
      .then((coords) => {
        if (!isMounted) return;
        queryClient.setQueryData(LAST_KNOWN_COORDINATES_QUERY_KEY, coords);
        setState({ isRequestingLocation: false, locationError: null, coordinates: coords });
      })
      .catch((error: GeolocationError) => {
        if (!isMounted) return;
        setState((prev) => ({
          isRequestingLocation: false,
          locationError: error,
          coordinates: prev.coordinates,
        }));
      });

    return () => {
      isMounted = false;
    };
  }, [queryClient]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      requestLocation();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [requestLocation]);

  const weatherQuery = useCurrentWeather(state.coordinates ?? undefined);

  const hasWeatherData = Boolean(weatherQuery.data);
  const isLoading =
    (!hasWeatherData && state.isRequestingLocation) ||
    (!hasWeatherData && weatherQuery.isLoading);

  const errorMessage =
    state.locationError?.message ??
    (weatherQuery.error instanceof Error ? weatherQuery.error.message : "");

  return (
    <WeatherSummaryCard
      title="현재 위치 날씨"
      description="브라우저에서 위치를 허용하면 자동으로 가져옵니다."
      summary={weatherQuery.data}
      isLoading={isLoading}
      errorMessage={errorMessage || normalizeError(weatherQuery.error)}
      fallbackText="위치를 허용하면 날씨 정보를 표시합니다."
    />
  );
}
