import type { LocationNode } from "@/entities/location";

import rawDistricts from "../../../../korea_districts.json";

const NO_LOCATION_MESSAGE = "해당 장소의 정보가 제공되지 않습니다.";

type RawDistrict = string;

const locationCatalog: LocationNode[] = (rawDistricts as RawDistrict[]).map((raw) => {
  const segments = raw.split("-");
  const level = segments.length === 1 ? "sido" : segments.length === 2 ? "sigungu" : "dong";
  const name = segments[segments.length - 1];
  const fullName = segments.join(" ");

  return {
    id: raw,
    name,
    fullName,
    level,
  };
});

function normalizeKeyword(keyword: string) {
  return keyword.toLowerCase().replace(/\s+/g, "");
}

export function searchLocationsByKeyword(keyword: string) {
  const normalizedKeyword = normalizeKeyword(keyword);

  if (!normalizedKeyword) return [];

  return locationCatalog.filter((location) =>
    normalizeKeyword(location.fullName).includes(normalizedKeyword),
  );
}

export function getAllKoreaLocations() {
  return locationCatalog;
}

export { NO_LOCATION_MESSAGE };
