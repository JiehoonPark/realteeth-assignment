const DEFAULT_OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ?? "";
const OPENWEATHER_BASE_URL =
  process.env.NEXT_PUBLIC_OPENWEATHER_BASE_URL ?? DEFAULT_OPENWEATHER_BASE_URL;

type WeatherApiEnv = {
  apiKey: string;
  baseUrl: string;
  units: "metric";
};

export const weatherApiEnv: WeatherApiEnv = {
  apiKey: OPENWEATHER_API_KEY,
  baseUrl: OPENWEATHER_BASE_URL,
  units: "metric",
};

export function assertWeatherApiEnv() {
  if (!weatherApiEnv.apiKey) {
    throw new Error("OpenWeatherMap API 키가 설정되지 않았습니다.");
  }
}
