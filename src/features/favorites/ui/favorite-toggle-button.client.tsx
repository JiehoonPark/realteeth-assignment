'use client';

import type { LocationCoordinates, LocationId } from "@/entities/location";

import { useFavorites } from "../model/use-favorites";
import { Button } from "@/shared/ui/button";

type FavoriteToggleButtonProps = {
  locationId: LocationId;
  initialAlias: string;
  coordinates?: LocationCoordinates;
};

const ADD_LABEL = "즐겨찾기 추가";
const REMOVE_LABEL = "즐겨찾기 제거";
const BUTTON_MIN_WIDTH_CLASS_NAME = "min-w-[108px]";

export function FavoriteToggleButton({
  locationId,
  initialAlias,
  coordinates,
}: FavoriteToggleButtonProps) {
  const {
    isFavorite,
    isAtCapacity,
    addFavorite,
    removeFavorite,
    isHydrated,
  } = useFavorites();
  const hasFavorite = isFavorite(locationId);
  const isDisabled = isAtCapacity && !hasFavorite;
  const resolvedLabel = hasFavorite ? REMOVE_LABEL : ADD_LABEL;

  const handleClick = () => {
    if (hasFavorite) {
      removeFavorite(locationId);
      return;
    }

    addFavorite({ locationId, alias: initialAlias, coordinates });
  };

  if (!isHydrated) {
    return (
      <span
        aria-hidden
        className={`inline-flex h-9 ${BUTTON_MIN_WIDTH_CLASS_NAME} rounded-md bg-muted`}
      />
    );
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={BUTTON_MIN_WIDTH_CLASS_NAME}
    >
      {resolvedLabel}
    </Button>
  );
}
