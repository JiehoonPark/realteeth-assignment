import type { LocationId } from "@/entities/location";

export type FavoriteLocation = {
  locationId: LocationId;
  alias: string;
  pinnedAt: string;
};

export const MAX_FAVORITES = 6;
