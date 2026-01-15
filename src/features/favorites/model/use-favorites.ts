import { useSyncExternalStore } from "react";

import { formatLocationName, type LocationCoordinates, type LocationId } from "@/entities/location";

import { MAX_FAVORITES, type FavoriteLocation } from "./types";

type FavoritesState = {
  favorites: FavoriteLocation[];
};

type AddFavoriteParams = {
  locationId: LocationId;
  alias?: string;
  coordinates?: LocationCoordinates;
};

type UpdateFavoriteAliasParams = {
  locationId: LocationId;
  alias: string;
};

const FAVORITES_STORAGE_KEY = "realteeth-favorites";
const EMPTY_STATE: FavoritesState = { favorites: [] };
const LOCATION_ID_DECODE_ATTEMPTS = 2;

let currentState: FavoritesState = EMPTY_STATE;
let hasHydrated = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function persistFavorites(favorites: FavoriteLocation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

function setState(nextState: FavoritesState) {
  currentState = nextState;
  persistFavorites(currentState.favorites);
  notifyListeners();
}

function decodeLocationId(value: string) {
  let decodedValue = value;
  for (let attempt = 0; attempt < LOCATION_ID_DECODE_ATTEMPTS; attempt += 1) {
    try {
      const nextValue = decodeURIComponent(decodedValue);
      if (nextValue === decodedValue) break;
      decodedValue = nextValue;
    } catch (error) {
      break;
    }
  }
  return decodedValue;
}

function normalizeLocationId(rawId: LocationId) {
  const decodedValue = decodeLocationId(rawId).trim();
  const hyphenatedValue = decodedValue
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return hyphenatedValue;
}

function normalizeLocationName(locationId: LocationId) {
  return formatLocationName(normalizeLocationId(locationId));
}

function createFavorite({ locationId, alias, coordinates }: AddFavoriteParams): FavoriteLocation {
  const resolvedAlias = alias?.trim() || normalizeLocationName(locationId);
  return {
    locationId,
    alias: resolvedAlias,
    pinnedAt: new Date().toISOString(),
    coordinates,
  };
}

function sanitizeFavorites(rawValue: unknown): FavoriteLocation[] {
  if (!Array.isArray(rawValue)) return [];

  return rawValue
    .filter((item): item is FavoriteLocation => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as FavoriteLocation;
      return (
        typeof candidate.locationId === "string" &&
        typeof candidate.alias === "string" &&
        typeof candidate.pinnedAt === "string"
      );
    })
    .map((favorite) => {
      const normalizedLocationId = normalizeLocationId(favorite.locationId);
      const coordinates =
        favorite.coordinates &&
        typeof favorite.coordinates.latitude === "number" &&
        typeof favorite.coordinates.longitude === "number" &&
        Number.isFinite(favorite.coordinates.latitude) &&
        Number.isFinite(favorite.coordinates.longitude)
          ? favorite.coordinates
          : undefined;
      return {
        locationId: normalizedLocationId,
        alias: favorite.alias || normalizeLocationName(normalizedLocationId),
        pinnedAt: favorite.pinnedAt || new Date().toISOString(),
        coordinates,
      };
    });
}

function hydrateFavorites() {
  if (hasHydrated || typeof window === "undefined") return;
  hasHydrated = true;

  const storedValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
  if (!storedValue) return;

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;
    const hydratedFavorites = sanitizeFavorites(parsedValue);
    if (hydratedFavorites.length > 0) {
      currentState = { favorites: hydratedFavorites };
    }
  } catch (error) {
    console.error("Failed to parse favorites from storage", error);
  }
}

function getSnapshot() {
  hydrateFavorites();
  return currentState;
}

function getServerSnapshot() {
  return EMPTY_STATE;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function findFavoriteByLocationId(locationId: LocationId) {
  const normalizedLocationId = normalizeLocationId(locationId);
  return currentState.favorites.find(
    (favorite) => favorite.locationId === normalizedLocationId,
  );
}

function addFavorite({ locationId, alias, coordinates }: AddFavoriteParams) {
  const normalizedLocationId = normalizeLocationId(locationId);
  const existingFavorite = findFavoriteByLocationId(normalizedLocationId);
  if (existingFavorite) {
    if (!coordinates) return false;
    const hasCoordinates = Boolean(existingFavorite.coordinates);
    if (hasCoordinates) return false;
    const nextFavorites = currentState.favorites.map((favorite) => {
      if (favorite.locationId !== normalizedLocationId) return favorite;
      return {
        ...favorite,
        coordinates,
      };
    });
    setState({ favorites: nextFavorites });
    return true;
  }

  const isAtCapacity = currentState.favorites.length >= MAX_FAVORITES;
  if (isAtCapacity) return false;

  const newFavorite = createFavorite({
    locationId: normalizedLocationId,
    alias,
    coordinates,
  });
  setState({ favorites: [newFavorite, ...currentState.favorites] });
  return true;
}

function removeFavorite(locationId: LocationId) {
  const normalizedLocationId = normalizeLocationId(locationId);
  const nextFavorites = currentState.favorites.filter(
    (favorite) => favorite.locationId !== normalizedLocationId,
  );

  if (nextFavorites.length === currentState.favorites.length) return false;

  setState({ favorites: nextFavorites });
  return true;
}

function updateFavoriteAlias({ locationId, alias }: UpdateFavoriteAliasParams) {
  const trimmedAlias = alias.trim();
  if (!trimmedAlias) return false;

  const normalizedLocationId = normalizeLocationId(locationId);
  let hasUpdated = false;
  const nextFavorites = currentState.favorites.map((favorite) => {
    if (favorite.locationId !== normalizedLocationId) return favorite;
    if (favorite.alias === trimmedAlias) return favorite;
    hasUpdated = true;
    return {
      ...favorite,
      alias: trimmedAlias,
    };
  });

  if (!hasUpdated) return false;

  setState({ favorites: nextFavorites });
  return true;
}

export function useFavorites() {
  const { favorites } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isAtCapacity = favorites.length >= MAX_FAVORITES;

  const isFavorite = (locationId: LocationId) =>
    favorites.some(
      (favorite) => favorite.locationId === normalizeLocationId(locationId),
    );

  const getFavoriteByLocationId = (locationId: LocationId) =>
    favorites.find(
      (favorite) => favorite.locationId === normalizeLocationId(locationId),
    );

  return {
    favorites,
    isAtCapacity,
    isFavorite,
    getFavoriteByLocationId,
    addFavorite,
    removeFavorite,
    updateFavoriteAlias,
  };
}
