import { LocationSearch } from "@/features/search/ui/location-search";
import { CurrentLocationWeather } from "@/widgets/weather/ui/current-location-weather";

export default function HomePage() {
  return (
    <main>
      <LocationSearch />
      <CurrentLocationWeather />
    </main>
  );
}
