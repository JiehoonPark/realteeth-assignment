import type { WeatherSummary } from "@/entities/weather";
import type { GeolocationPosition } from "@/shared/lib/geolocation";

async function getErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    if (data?.message) return data.message;
  } catch {
    // ignore parsing errors
  }
  return `날씨 정보를 가져오지 못했습니다. (${response.status})`;
}

export async function getCurrentWeatherByCoords(coordinates: GeolocationPosition) {
  const response = await fetch(
    `/api/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}`,
  );

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json() as Promise<WeatherSummary>;
}
