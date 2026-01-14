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

const DEFAULT_ERROR_MESSAGE = "날씨 정보를 가져오지 못했습니다.";
const CONTENT_MIN_HEIGHT_CLASS = "min-h-[180px]";

export function WeatherSummaryCard({
  title,
  description,
  summary,
  isLoading,
  errorMessage,
  fallbackText = "날씨 정보를 표시할 수 없습니다.",
}: WeatherSummaryCardProps) {
  const hasError = Boolean(errorMessage);
  const hasSummary = Boolean(summary);
  const resolvedErrorMessage = errorMessage || DEFAULT_ERROR_MESSAGE;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={`space-y-3 ${CONTENT_MIN_HEIGHT_CLASS}`}>
        {isLoading && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="flex flex-wrap gap-2">
              <span className="h-6 w-16 rounded bg-muted" />
              <span className="h-6 w-16 rounded bg-muted" />
              <span className="h-6 w-16 rounded bg-muted" />
            </div>
          </div>
        )}

        {hasError && (
          <p className="text-sm text-destructive">{resolvedErrorMessage}</p>
        )}

        {hasSummary && summary && (
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

        {!isLoading && !hasError && !hasSummary && (
          <p className="text-sm text-muted-foreground">{fallbackText}</p>
        )}
      </CardContent>
    </Card>
  );
}
