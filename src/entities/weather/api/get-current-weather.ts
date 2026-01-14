import type { WeatherSummary } from "@/entities/weather";
import type { GeolocationPosition } from "@/shared/lib/geolocation";

export async function getCurrentWeatherByCoords(coordinates: GeolocationPosition) {
  const response = await fetch(
    `/api/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}`,
  );

  if (!response.ok) {
    const message = `날씨 정보를 가져오지 못했습니다. (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<WeatherSummary>;
}
