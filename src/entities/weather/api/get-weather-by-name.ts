import type { WeatherSummary } from "@/entities/weather";

export async function getWeatherByName(locationName: string) {
  const encodedName = encodeURIComponent(locationName);
  const response = await fetch(`/api/weather?name=${encodedName}`);

  if (!response.ok) {
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) {
        throw new Error(data.message);
      }
    } catch (error) {
      if (error instanceof Error && error.message) {
        throw error;
      }
    }
    throw new Error(`날씨 정보를 가져오지 못했습니다. (${response.status})`);
  }

  return response.json() as Promise<WeatherSummary>;
}
