'use client';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import type { ReactNode } from "react";
import { getOpenWeatherIconAlt, getOpenWeatherIconUrl, type WeatherSummary } from "@/entities/weather";

type WeatherSummaryCardProps = {
  title: string;
  description?: string;
  summary?: WeatherSummary;
  isLoading: boolean;
  errorMessage?: string;
  fallbackText?: string;
  action?: ReactNode;
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
  action,
}: WeatherSummaryCardProps) {
  const hasError = Boolean(errorMessage);
  const hasSummary = Boolean(summary);
  const resolvedErrorMessage = errorMessage || DEFAULT_ERROR_MESSAGE;
  const iconUrl = summary?.icon ? getOpenWeatherIconUrl(summary.icon, "4x") : null;
  const iconAlt = getOpenWeatherIconAlt(summary?.description);
  const resolvedDescription = description?.trim() ?? "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription
          className="min-h-5"
          aria-hidden={resolvedDescription.length === 0}
        >
          {resolvedDescription}
        </CardDescription>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={`space-y-4 ${CONTENT_MIN_HEIGHT_CLASS}`}>
        {isLoading && (
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="h-10 w-24 rounded bg-muted" />
              </div>
              <div className="flex gap-2">
                <div className="h-7 w-20 rounded-full bg-muted" />
                <div className="h-7 w-20 rounded-full bg-muted" />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="h-10 rounded-md bg-muted" />
              <div className="h-10 rounded-md bg-muted" />
              <div className="h-3 w-40 rounded bg-muted sm:col-span-2" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="flex gap-2 overflow-hidden">
                <div className="h-6 w-16 rounded bg-muted" />
                <div className="h-6 w-16 rounded bg-muted" />
                <div className="h-6 w-16 rounded bg-muted" />
              </div>
            </div>
          </div>
        )}

        {hasError && (
          <p className="text-sm text-destructive">{resolvedErrorMessage}</p>
        )}

        {hasSummary && summary && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                {iconUrl ? (
                  <img
                    src={iconUrl}
                    alt={iconAlt}
                    loading="lazy"
                    className="h-12 w-12"
                  />
                ) : null}
                <p className="text-3xl font-semibold text-foreground">
                  {Math.round(summary.temperature.current)}°C
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="rounded-full bg-muted px-3 py-1">
                  최저 {Math.round(summary.temperature.minimum)}°C
                </span>
                <span className="rounded-full bg-muted px-3 py-1">
                  최고 {Math.round(summary.temperature.maximum)}°C
                </span>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                <span>습도</span>
                <span className="font-medium text-foreground">
                  {summary.humidity}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                <span>바람</span>
                <span className="font-medium text-foreground">
                  {summary.windSpeed} m/s
                </span>
              </div>
              <div className="text-xs text-muted-foreground sm:col-span-2">
                기준 시각: {new Date(summary.recordedAt).toLocaleString("ko-KR")}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                시간대별 기온
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs text-muted-foreground">
                {summary.hourly.map((item) => (
                  <span
                    key={`${item.hour}-${item.temperature}`}
                    className="shrink-0 rounded-md bg-muted px-2 py-1"
                  >
                    {item.hour} · {Math.round(item.temperature)}°C
                  </span>
                ))}
              </div>
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
