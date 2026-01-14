import type { WeatherSummary } from "@/entities/weather";

export async function getWeatherByName(locationName: string) {
  const encodedName = encodeURIComponent(locationName);
  const response = await fetch(`/api/weather?name=${encodedName}`);

  if (!response.ok) {
    const message = `날씨 정보를 가져오지 못했습니다. (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<WeatherSummary>;
}
