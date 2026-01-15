'use client';

import { FavoriteWeatherCard, useFavorites } from "@/features/favorites";

const SECTION_TITLE = "즐겨찾기";

export function FavoriteLocations() {
  const { favorites } = useFavorites();

  if (favorites.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">{SECTION_TITLE}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {favorites.map((favorite) => (
          <FavoriteWeatherCard key={favorite.locationId} favorite={favorite} />
        ))}
      </div>
    </section>
  );
}
