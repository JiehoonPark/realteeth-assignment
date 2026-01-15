'use client';

import type { LocationId } from "@/entities/location";

import { useFavorites } from "@/features/favorites/model/use-favorites";
import { Button } from "@/shared/ui/button";

type FavoriteToggleButtonProps = {
  locationId: LocationId;
  initialAlias: string;
};

const ADD_LABEL = "즐겨찾기 추가";
const REMOVE_LABEL = "즐겨찾기 제거";

export function FavoriteToggleButton({ locationId, initialAlias }: FavoriteToggleButtonProps) {
  const { isFavorite, isAtCapacity, addFavorite, removeFavorite } = useFavorites();
  const hasFavorite = isFavorite(locationId);
  const isDisabled = isAtCapacity && !hasFavorite;

  const handleClick = () => {
    if (hasFavorite) {
      removeFavorite(locationId);
      return;
    }

    addFavorite({ locationId, alias: initialAlias });
  };

  return (
    <Button type="button" onClick={handleClick} disabled={isDisabled}>
      {hasFavorite ? REMOVE_LABEL : ADD_LABEL}
    </Button>
  );
}
