'use client';

import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { FavoriteLocation } from "@/features/favorites";
import { useFavorites } from "@/features/favorites/model/use-favorites";
import { WEATHER_REFETCH_INTERVAL_MS } from "@/entities/weather/model/query-options";
import { getWeatherByName } from "@/entities/weather/api/get-weather-by-name";
import { weatherQueryKeys } from "@/entities/weather/model/query-keys";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

type FavoriteWeatherCardProps = {
  favorite: FavoriteLocation;
};

const EDIT_LABEL = "별칭 수정";
const SAVE_LABEL = "저장";
const CANCEL_LABEL = "취소";
const REMOVE_LABEL = "삭제";
const FALLBACK_MESSAGE = "해당 장소의 정보가 제공되지 않습니다.";

function normalizeLocationName(locationId: string) {
  return decodeURIComponent(locationId).split("-").join(" ");
}

export function FavoriteWeatherCard({ favorite }: FavoriteWeatherCardProps) {
  const router = useRouter();
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [aliasDraft, setAliasDraft] = useState(favorite.alias);
  const { updateFavoriteAlias, removeFavorite } = useFavorites();
  const locationName = normalizeLocationName(favorite.locationId);
  const locationHref = `/locations/${encodeURIComponent(favorite.locationId)}`;

  const weatherQuery = useQuery({
    queryKey: weatherQueryKeys.byName(locationName),
    queryFn: () => getWeatherByName(locationName),
    enabled: Boolean(locationName),
    refetchInterval: WEATHER_REFETCH_INTERVAL_MS,
  });

  const handleAliasSave = () => {
    const didUpdate = updateFavoriteAlias({
      locationId: favorite.locationId,
      alias: aliasDraft,
    });

    if (didUpdate) {
      setIsEditingAlias(false);
    }
  };

  const handleAliasCancel = () => {
    setAliasDraft(favorite.alias);
    setIsEditingAlias(false);
  };

  const handleAliasEditStart = () => {
    setAliasDraft(favorite.alias);
    setIsEditingAlias(true);
  };

  const handleRemove = () => {
    removeFavorite(favorite.locationId);
  };

  const handleCardClick = () => {
    router.push(locationHref);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      router.push(locationHref);
    }
  };

  const errorMessage =
    weatherQuery.error instanceof Error
      ? weatherQuery.error.message
      : FALLBACK_MESSAGE;

  return (
    <Card
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className="cursor-pointer"
    >
      <CardHeader className="space-y-3">
        {isEditingAlias ? (
          <Input
            value={aliasDraft}
            onChange={(event) => setAliasDraft(event.target.value)}
            onClick={(event) => event.stopPropagation()}
          />
        ) : (
          <CardTitle>{favorite.alias}</CardTitle>
        )}
        <div className="flex flex-wrap gap-2">
          {isEditingAlias ? (
            <>
              <Button
                type="button"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  handleAliasSave();
                }}
              >
                {SAVE_LABEL}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation();
                  handleAliasCancel();
                }}
              >
                {CANCEL_LABEL}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={(event) => {
                event.stopPropagation();
                handleAliasEditStart();
              }}
            >
              {EDIT_LABEL}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              handleRemove();
            }}
          >
            {REMOVE_LABEL}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {weatherQuery.isLoading ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>
        ) : weatherQuery.data ? (
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              현재 {Math.round(weatherQuery.data.temperature.current)}°C
            </p>
            <p className="text-sm text-muted-foreground">
              최저 {Math.round(weatherQuery.data.temperature.minimum)}°C · 최고 {Math.round(weatherQuery.data.temperature.maximum)}°C
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
