import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
  latitude: number,
  longitude: number,
): WeatherSummary {
  const primary = currentResponse.weather[0];
  const timezoneOffsetMs = (forecastResponse.city?.timezone ?? 0) * 1000;

  return {
    locationId: `${latitude},${longitude}`,
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lon"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ message: "lat, lon 쿼리 파라미터가 필요합니다." }, { status: 400 });
  }

  try {
    const [currentResponse, forecastResponse] = await Promise.all([
      fetchOpenWeather<OpenWeatherResponse>({
        pathname: "/weather",
        params: { lat: latitude, lon: longitude },
      }),
      fetchOpenWeather<OpenWeatherForecastResponse>({
        pathname: "/forecast",
        params: { lat: latitude, lon: longitude },
      }),
    ]);

    const summary = mapToWeatherSummary(
      currentResponse,
      forecastResponse,
      latitude,
      longitude,
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Failed to fetch weather data", error);
    return NextResponse.json(
      { message: "날씨 정보를 가져오지 못했습니다." },
      { status: 502 },
    );
  }
}
