'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { WeatherSummary } from "@/entities/weather";

type WeatherSummaryCardProps = {
  title: string;
  description?: string;
  summary?: WeatherSummary;
  isLoading: boolean;
  errorMessage?: string;
  fallbackText?: string;
};

export function WeatherSummaryCard({
  title,
  description,
  summary,
  isLoading,
  errorMessage,
  fallbackText = "날씨 정보를 표시할 수 없습니다.",
}: WeatherSummaryCardProps) {
  const hasError = Boolean(errorMessage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">날씨 정보를 불러오는 중입니다.</p>}

        {hasError && (
          <p className="text-sm text-destructive">
            {errorMessage || "날씨 정보를 가져오지 못했습니다."}
          </p>
        )}

        {summary && (
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-foreground">
              {Math.round(summary.temperature.current)}°C
            </p>
            <p className="text-sm text-muted-foreground">
              최저 {Math.round(summary.temperature.minimum)}°C · 최고 {Math.round(summary.temperature.maximum)}°C
            </p>
            <p className="text-sm text-muted-foreground">
              습도 {summary.humidity}% · 바람 {summary.windSpeed} m/s
            </p>
            <p className="text-xs text-muted-foreground">
              기준 시각: {new Date(summary.recordedAt).toLocaleString("ko-KR")}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {summary.hourly.map((item) => (
                <span key={`${item.hour}-${item.temperature}`} className="rounded-md bg-muted px-2 py-1">
                  {item.hour} · {Math.round(item.temperature)}°C
                </span>
              ))}
            </div>
          </div>
        )}

        {!isLoading && !hasError && !summary && (
          <p className="text-sm text-muted-foreground">{fallbackText}</p>
        )}
      </CardContent>
    </Card>
  );
}
