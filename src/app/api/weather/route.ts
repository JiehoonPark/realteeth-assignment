import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  fetchOpenWeather,
  type OpenWeatherError,
} from "@/shared/api/openweather-client";
import type { WeatherSummary } from "@/entities/weather";
import { resolveCoordinatesByName } from "@/entities/location";

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
  locationId: string,
  coordinates: { latitude: number; longitude: number },
): WeatherSummary {
  const primary = currentResponse.weather[0];
  const timezoneOffsetMs = (forecastResponse.city?.timezone ?? 0) * 1000;

  return {
    locationId,
    coordinates,
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
  const latitudeParam = searchParams.get("lat");
  const longitudeParam = searchParams.get("lon");
  const locationName = searchParams.get("name") ?? undefined;

  let latitude =
    latitudeParam === null || latitudeParam === "" ? undefined : Number(latitudeParam);
  let longitude =
    longitudeParam === null || longitudeParam === "" ? undefined : Number(longitudeParam);

  let hasCoords =
    latitude !== undefined &&
    longitude !== undefined &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);
  const hasName = Boolean(locationName);

  if (!hasCoords && !hasName) {
    return NextResponse.json(
      { message: "lat, lon 또는 name 쿼리 파라미터가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    if (!hasCoords && hasName) {
      const resolved = await resolveCoordinatesByName(locationName as string);
      if (!resolved) {
        return NextResponse.json(
          { message: "해당 장소의 정보가 제공되지 않습니다." },
          { status: 404 },
        );
      }
      latitude = resolved.latitude;
      longitude = resolved.longitude;
      hasCoords = true;
    }

    if (!hasCoords || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { message: "좌표를 확인할 수 없습니다." },
        { status: 400 },
      );
    }

    const queryParams = { lat: latitude, lon: longitude };

    const [currentResponse, forecastResponse] = await Promise.all([
      fetchOpenWeather<OpenWeatherResponse>({
        pathname: "/weather",
        params: queryParams,
      }),
      fetchOpenWeather<OpenWeatherForecastResponse>({
        pathname: "/forecast",
        params: queryParams,
      }),
    ]);

    const summary = mapToWeatherSummary(
      currentResponse,
      forecastResponse,
      hasName ? (locationName as string) : `${latitude},${longitude}`,
      { latitude, longitude },
    );

    return NextResponse.json(summary);
  } catch (error) {
    const typedError = error as OpenWeatherError;
    const bodyText = typeof typedError.body === "string" ? typedError.body : "";
    if (typedError.status === 404 || bodyText.includes("city not found")) {
      return NextResponse.json(
        { message: "해당 장소의 정보가 제공되지 않습니다." },
        { status: 404 },
      );
    }
    console.error("Failed to fetch weather data", error);
    return NextResponse.json({ message: "날씨 정보를 가져오지 못했습니다." }, { status: 502 });
  }
}
