import type { LocationCoordinates, LocationId } from "@/entities/location";

export type FavoriteLocation = {
  locationId: LocationId;
  alias: string;
  pinnedAt: string;
  coordinates?: LocationCoordinates;
};

export const MAX_FAVORITES = 6;
