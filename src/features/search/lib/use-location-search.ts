import { useMemo } from "react";

import {
  NO_LOCATION_MESSAGE,
  searchLocationsByKeyword,
  type LocationNode,
} from "@/entities/location";
import { NO_SEARCH_RESULT_MESSAGE } from "./messages";

type UseLocationSearchParams = {
  keyword: string;
};

const LOCATION_LEVEL_PRIORITY: Record<LocationNode["level"], number> = {
  sido: 3,
  sigungu: 2,
  dong: 1,
};

function normalizeKeyword(keyword: string) {
  return keyword.toLowerCase().replace(/\s+/g, "");
}

function getMatchScore(location: LocationNode, keyword: string) {
  const normalizedKeyword = normalizeKeyword(keyword);
  const normalizedFullName = normalizeKeyword(location.fullName);
  const normalizedName = normalizeKeyword(location.name);

  if (normalizedFullName === normalizedKeyword) return 100;
  if (normalizedName === normalizedKeyword) return 95;
  if (normalizedFullName.startsWith(normalizedKeyword)) return 80;
  if (normalizedName.startsWith(normalizedKeyword)) return 70;
  if (normalizedFullName.includes(normalizedKeyword)) return 60;
  return 0;
}

function sortLocationsByMatch({
  keyword,
  results,
}: {
  keyword: string;
  results: LocationNode[];
}) {
  const trimmedKeyword = keyword.trim();
  if (!trimmedKeyword || results.length === 0) return results;

  return [...results].sort((left, right) => {
    const leftScore = getMatchScore(left, trimmedKeyword);
    const rightScore = getMatchScore(right, trimmedKeyword);
    if (leftScore !== rightScore) return rightScore - leftScore;

    const leftPriority = LOCATION_LEVEL_PRIORITY[left.level];
    const rightPriority = LOCATION_LEVEL_PRIORITY[right.level];
    if (leftPriority !== rightPriority) return rightPriority - leftPriority;

    return left.fullName.length - right.fullName.length;
  });
}

export function getLocationMatches(keyword: string) {
  const results = searchLocationsByKeyword(keyword);
  return sortLocationsByMatch({ keyword, results });
}

export function useLocationSearch({ keyword }: UseLocationSearchParams) {
  const results = useMemo(() => getLocationMatches(keyword), [keyword]);

  const hasKeyword = keyword.trim().length > 0;
  const hasResults = results.length > 0;

  const message = !hasKeyword
    ? ""
    : hasResults
      ? ""
      : NO_SEARCH_RESULT_MESSAGE ?? NO_LOCATION_MESSAGE;

  return {
    results,
    message,
  };
}
