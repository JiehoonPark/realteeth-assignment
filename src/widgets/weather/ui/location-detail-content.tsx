'use client';

import { useWeatherByName } from "@/widgets/weather/api/use-weather-by-name";

type LocationDetailContentProps = {
  locationId: string;
};

function normalizeLocationName(rawId: string) {
  return (rawId ?? "").split("-").join(" ");
}

export default function LocationDetailContent({ locationId }: LocationDetailContentProps) {
  const locationName = normalizeLocationName(locationId);
  const weatherQuery = useWeatherByName(locationName);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">장소 상세</p>
        <h1 className="text-2xl font-semibold text-foreground">{locationName}</h1>
      </header>

      {weatherQuery.isLoading && (
        <p className="text-sm text-muted-foreground">날씨 정보를 불러오는 중입니다.</p>
      )}

      {weatherQuery.isError && (
        <p className="text-sm text-destructive">
          {(weatherQuery.error as Error).message ?? "날씨 정보를 가져오지 못했습니다."}
        </p>
      )}

      {weatherQuery.data && (
        <section className="grid gap-4 rounded-lg border border-border bg-background p-4 shadow-sm md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold text-foreground">
              현재 {Math.round(weatherQuery.data.temperature.current)}°C
            </p>
            <p className="text-sm text-muted-foreground">
              최저 {Math.round(weatherQuery.data.temperature.minimum)}°C · 최고{" "}
              {Math.round(weatherQuery.data.temperature.maximum)}°C
            </p>
            <p className="text-sm text-muted-foreground">
              습도 {weatherQuery.data.humidity}% · 바람 {weatherQuery.data.windSpeed} m/s
            </p>
            <p className="text-xs text-muted-foreground">
              기준 시각: {new Date(weatherQuery.data.recordedAt).toLocaleString("ko-KR")}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">시간대별 기온</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {weatherQuery.data.hourly.map((item) => (
                <div
                  key={`${item.hour}-${item.temperature}`}
                  className="rounded-md border border-border px-3 py-2 text-left text-sm"
                >
                  <div className="text-xs text-muted-foreground">{item.hour}</div>
                  <div className="text-base font-semibold text-foreground">
                    {Math.round(item.temperature)}°C
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
