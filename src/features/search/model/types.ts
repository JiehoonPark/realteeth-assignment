import type { LocationId, LocationNode } from "@/entities/location";

export type SearchQuery = {
  keyword: string;
};

export type SearchResult = {
  keyword: string;
  items: LocationNode[];
};

export type SearchSelection = {
  locationId: LocationId;
};
