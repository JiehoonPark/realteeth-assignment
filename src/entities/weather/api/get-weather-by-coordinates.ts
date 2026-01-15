import type { LocationCoordinates } from "@/entities/location";
import type { WeatherSummary } from "@/entities/weather";
import { getWeatherErrorMessage } from "@/entities/weather/lib/get-weather-error-message";

export async function getWeatherByCoordinates(coordinates: LocationCoordinates) {
  const response = await fetch(
    `/api/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}`,
  );

  if (!response.ok) {
    const message = await getWeatherErrorMessage(response);
    throw new Error(message);
  }

  return response.json() as Promise<WeatherSummary>;
}
