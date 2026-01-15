import type { LocationCoordinates } from "@/entities/location";

import { OPENWEATHER_API_KEY } from "@/shared/api/openweather-client";

type GeocodingResponse = {
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

const GEO_QUERY_LIMIT = 1;

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

async function fetchCoordinatesByName(locationName: string): Promise<LocationCoordinates[]> {
  if (!OPENWEATHER_API_KEY) {
    throw new Error("OpenWeatherMap API 키가 설정되지 않았습니다.");
  }

  const geoUrl = new URL("https://api.openweathermap.org/geo/1.0/direct");
  geoUrl.searchParams.set("q", `${locationName},KR`);
  geoUrl.searchParams.set("limit", String(GEO_QUERY_LIMIT));
  geoUrl.searchParams.set("appid", OPENWEATHER_API_KEY);

  const response = await fetch(geoUrl.toString(), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`지오코딩 요청 실패: ${response.statusText}`);
  }

  const data = (await response.json()) as GeocodingResponse;
  return data.map((item) => ({
    latitude: item.lat,
    longitude: item.lon,
  }));
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

export async function resolveCoordinatesByName(
  locationName: string,
): Promise<LocationCoordinates | undefined> {
  const nameVariants = generateNameVariants(locationName);
  for (const candidateName of nameVariants) {
    const results = await fetchCoordinatesByName(candidateName);
    if (results.length > 0) {
      return results[0];
    }
  }
  return undefined;
}
