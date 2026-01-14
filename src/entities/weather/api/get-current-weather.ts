import type { GeolocationPosition } from "@/shared/lib/geolocation";
import { fetchOpenWeather } from "@/shared/api/openweather-client";
import type { WeatherSummary } from "@/entities/weather";

type OpenWeatherResponse = {
  weather: { description: string; icon: string }[];
  main: { temp: number; temp_min: number; temp_max: number; humidity: number };
  wind: { speed: number };
  dt: number;
};

type OpenWeatherForecastResponse = {
  list: { dt: number; main: { temp: number } }[];
  city?: { timezone?: number };
};

function mapToWeatherSummary(
  currentResponse: OpenWeatherResponse,
  forecastResponse: OpenWeatherForecastResponse,
  coordinates: GeolocationPosition,
): WeatherSummary {
  const primary = currentResponse.weather[0];
  const timezoneOffsetMs = (forecastResponse.city?.timezone ?? 0) * 1000;

  return {
    locationId: `${coordinates.latitude},${coordinates.longitude}`,
    description: primary?.description ?? "",
    icon: primary?.icon ?? "",
    temperature: {
      current: currentResponse.main.temp,
      minimum: currentResponse.main.temp_min,
      maximum: currentResponse.main.temp_max,
    },
    humidity: currentResponse.main.humidity,
    windSpeed: currentResponse.wind.speed,
    recordedAt: new Date(currentResponse.dt * 1000).toISOString(),
    hourly: forecastResponse.list.slice(0, 8).map((item) => {
      const localDate = new Date(item.dt * 1000 + timezoneOffsetMs);
      const hourLabel = localDate.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return { hour: hourLabel, temperature: item.main.temp };
    }),
  };
}

export async function getCurrentWeatherByCoords(coordinates: GeolocationPosition) {
  const [currentResponse, forecastResponse] = await Promise.all([
    fetchOpenWeather<OpenWeatherResponse>({
      pathname: "/weather",
      params: {
        lat: coordinates.latitude,
        lon: coordinates.longitude,
      },
    }),
    fetchOpenWeather<OpenWeatherForecastResponse>({
      pathname: "/forecast",
      params: {
        lat: coordinates.latitude,
        lon: coordinates.longitude,
      },
    }),
  ]);

  return mapToWeatherSummary(currentResponse, forecastResponse, coordinates);
}
