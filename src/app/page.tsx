import { CurrentLocationWeather } from "@/widgets/weather/ui/current-location-weather";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-8">
      <CurrentLocationWeather />
    </main>
  );
}
