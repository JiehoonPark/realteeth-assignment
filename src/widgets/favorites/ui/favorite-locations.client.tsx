"use client";

import { FavoriteWeatherCard, useFavorites } from "@/features/favorites";

export function FavoriteLocations() {
  const { favorites } = useFavorites();

  if (favorites.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {favorites.map((favorite) => (
          <FavoriteWeatherCard key={favorite.locationId} favorite={favorite} />
        ))}
      </div>
    </section>
  );
}
