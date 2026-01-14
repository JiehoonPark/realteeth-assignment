'use client';

import { useEffect, useState } from "react";

import { requestCurrentPosition, type GeolocationError, type GeolocationPosition } from "@/shared/lib/geolocation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useCurrentWeather } from "@/widgets/weather/api/use-current-weather";

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

  const shouldShowError = Boolean(state.locationError) || weatherQuery.status === "error";
  const errorMessage =
    state.locationError?.message ??
    (weatherQuery.error instanceof Error ? weatherQuery.error.message : "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>현재 위치 날씨</CardTitle>
        <CardDescription>브라우저에서 위치를 허용하면 자동으로 가져옵니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">위치와 날씨 정보를 불러오는 중입니다.</p>}
        {shouldShowError && (
          <p className="text-sm text-destructive">
            {errorMessage || "위치 또는 날씨 정보를 가져오지 못했습니다."}
          </p>
        )}
        {weatherQuery.data && (
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-foreground">
              {Math.round(weatherQuery.data.temperature.current)}°C
            </p>
            <p className="text-sm text-muted-foreground">
              최저 {Math.round(weatherQuery.data.temperature.minimum)}°C · 최고 {Math.round(weatherQuery.data.temperature.maximum)}°C
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {weatherQuery.data.hourly.map((item) => (
                <span key={item.hour} className="rounded-md bg-muted px-2 py-1">
                  {item.hour} · {Math.round(item.temperature)}°C
                </span>
              ))}
            </div>
          </div>
        )}
        {!isLoading && !shouldShowError && !weatherQuery.data && (
          <p className="text-sm text-muted-foreground">위치를 허용하면 날씨 정보를 표시합니다.</p>
        )}
      </CardContent>
    </Card>
  );
}
