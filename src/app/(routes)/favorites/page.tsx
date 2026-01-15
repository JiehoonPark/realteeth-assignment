import { FavoriteLocations } from "@/widgets/favorites/ui/favorite-locations.client";

export default function FavoritesPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-8">
      <FavoriteLocations />
    </main>
  );
}
