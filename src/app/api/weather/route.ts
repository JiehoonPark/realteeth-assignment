import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  fetchOpenWeather,
  OPENWEATHER_API_KEY,
  type OpenWeatherError,
} from "@/shared/api/openweather-client";
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

type GeocodingResponse = {
  name?: string;
  lat: number;
  lon: number;
}[];

const ADMIN_SUFFIXES = [
  "특별자치도",
  "광역시",
  "특별시",
  "자치구",
  "도",
  "시",
  "군",
  "구",
  "읍",
  "면",
  "동",
  "리",
];

function stripAdministrativeSuffix(value: string) {
  for (const suffix of ADMIN_SUFFIXES) {
    if (value.endsWith(suffix) && value.length > suffix.length) {
      return value.slice(0, -suffix.length);
    }
  }
  return undefined;
}

function extractPrimaryDivisionName(value: string) {
  const match = value.match(/(.+?(시|군|구))/);
  return match?.[1];
}

async function fetchCoordinatesByName(locationName: string) {
  const geoUrl = new URL("https://api.openweathermap.org/geo/1.0/direct");
  geoUrl.searchParams.set("q", `${locationName},KR`);
  geoUrl.searchParams.set("limit", "1");
  geoUrl.searchParams.set("appid", OPENWEATHER_API_KEY);

  const response = await fetch(geoUrl.toString(), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`지오코딩 요청 실패: ${response.statusText}`);
  }
  return (await response.json()) as GeocodingResponse;
}

function generateNameVariants(rawName: string) {
  const decodedName = rawName.trim().replace(/-/g, " ");
  const nameParts = decodedName.split(/\s+/).filter(Boolean);

  const variants = new Set<string>();
  const addVariant = (value?: string) => {
    if (!value) return;
    const trimmedValue = value.trim();
    if (!trimmedValue) return;
    variants.add(trimmedValue);
  };

  addVariant(decodedName);

  // 부분 삭제(뒤에서부터 줄여가며 시/구/동 단위 축소)
  for (let partCount = nameParts.length; partCount >= 1; partCount -= 1) {
    addVariant(nameParts.slice(0, partCount).join(" "));
  }

  nameParts.forEach((part) => {
    addVariant(part);
    addVariant(stripAdministrativeSuffix(part));
    addVariant(extractPrimaryDivisionName(part));
  });

  if (nameParts.length >= 2) {
    addVariant(nameParts[1]);
  }

  addVariant(stripAdministrativeSuffix(decodedName));
  addVariant(extractPrimaryDivisionName(decodedName));

  const strippedParts = nameParts
    .map((part) => stripAdministrativeSuffix(part) ?? part)
    .filter(Boolean);
  if (strippedParts.length > 0) {
    addVariant(strippedParts.join(" "));
  }

  // 콤마/역순 조합
  if (nameParts.length >= 2) {
    addVariant(nameParts.join(", "));
    addVariant(nameParts.slice(-1).concat(nameParts.slice(0, -1)).join(", "));
    addVariant(nameParts.slice(-1).join(" "));
  }
  if (nameParts.length >= 3) {
    addVariant(nameParts.slice(-2).join(" "));
    addVariant(nameParts.slice(-2).join(", "));
  }

  return Array.from(variants).filter(Boolean);
}

async function resolveCoordinates(locationName: string) {
  const nameVariants = generateNameVariants(locationName);
  for (const candidateName of nameVariants) {
    const results = await fetchCoordinatesByName(candidateName);
    if (results.length > 0) {
      return results[0];
    }
  }
  return undefined;
}

function mapToWeatherSummary(
  currentResponse: OpenWeatherResponse,
  forecastResponse: OpenWeatherForecastResponse,
  locationId: string,
): WeatherSummary {
  const primary = currentResponse.weather[0];
  const timezoneOffsetMs = (forecastResponse.city?.timezone ?? 0) * 1000;

  return {
    locationId,
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
      const resolved = await resolveCoordinates(locationName as string);
      if (!resolved) {
        return NextResponse.json(
          { message: "해당 장소의 정보가 제공되지 않습니다." },
          { status: 404 },
        );
      }
      latitude = resolved.lat;
      longitude = resolved.lon;
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
