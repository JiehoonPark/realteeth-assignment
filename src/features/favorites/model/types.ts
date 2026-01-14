import type { LocationId } from "@/entities/location";

export type FavoriteLocation = {
  id: LocationId;
  alias: string;
  locationId: LocationId;
  pinnedAt: string;
};

export const MAX_FAVORITES = 6;
