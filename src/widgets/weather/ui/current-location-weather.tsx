'use client';

import { useEffect, useState } from "react";

import { requestCurrentPosition, type GeolocationError, type GeolocationPosition } from "@/shared/lib/geolocation";
import { useCurrentWeather } from "@/widgets/weather/api/use-current-weather";
import { WeatherSummaryCard } from "@/widgets/weather/ui/weather-summary-card";

type WeatherState = {
  isRequestingLocation: boolean;
  locationError: GeolocationError | null;
  coordinates: GeolocationPosition | null;
};

export function CurrentLocationWeather() {
  const [state, setState] = useState<WeatherState>({
    isRequestingLocation: true,
    locationError: null,
    coordinates: null,
  });

  useEffect(() => {
    let isMounted = true;

    requestCurrentPosition()
      .then((coords) => {
        if (!isMounted) return;
        setState({ isRequestingLocation: false, locationError: null, coordinates: coords });
      })
      .catch((error: GeolocationError) => {
        if (!isMounted) return;
        setState({ isRequestingLocation: false, locationError: error, coordinates: null });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const weatherQuery = useCurrentWeather(state.coordinates ?? undefined);

  const isLoading =
    state.isRequestingLocation ||
    (state.coordinates !== null && weatherQuery.status === "pending");

  const errorMessage =
    state.locationError?.message ??
    (weatherQuery.error instanceof Error ? weatherQuery.error.message : "");

  return (
    <WeatherSummaryCard
      title="현재 위치 날씨"
      description="브라우저에서 위치를 허용하면 자동으로 가져옵니다."
      summary={weatherQuery.data}
      isLoading={isLoading}
      errorMessage={errorMessage}
      fallbackText="위치를 허용하면 날씨 정보를 표시합니다."
    />
  );
}
