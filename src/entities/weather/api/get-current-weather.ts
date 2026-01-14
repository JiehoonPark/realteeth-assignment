import type { GeolocationPosition } from "@/shared/lib/geolocation";
import { fetchOpenWeather } from "@/shared/api/openweather-client";
import type { WeatherSummary } from "@/entities/weather";

type OpenWeatherResponse = {
  weather: { description: string; icon: string }[];
  main: { temp: number; temp_min: number; temp_max: number; humidity: number };
  wind: { speed: number };
  dt: number;
};

function mapToWeatherSummary(
  response: OpenWeatherResponse,
  coordinates: GeolocationPosition,
): WeatherSummary {
  const primary = response.weather[0];

  return {
    locationId: `${coordinates.latitude},${coordinates.longitude}`,
    description: primary?.description ?? "",
    icon: primary?.icon ?? "",
    temperature: {
      current: response.main.temp,
      minimum: response.main.temp_min,
      maximum: response.main.temp_max,
    },
    humidity: response.main.humidity,
    windSpeed: response.wind.speed,
    recordedAt: new Date(response.dt * 1000).toISOString(),
    hourly: [],
  };
}

export async function getCurrentWeatherByCoords(coordinates: GeolocationPosition) {
  const response = await fetchOpenWeather<OpenWeatherResponse>({
    pathname: "/weather",
    params: {
      lat: coordinates.latitude,
      lon: coordinates.longitude,
    },
  });

  return mapToWeatherSummary(response, coordinates);
}
