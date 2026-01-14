import { useMemo } from "react";

import {
  NO_LOCATION_MESSAGE,
  searchLocationsByKeyword,
} from "@/entities/location";
import { NO_SEARCH_RESULT_MESSAGE } from "./messages";

type UseLocationSearchParams = {
  keyword: string;
};

export function useLocationSearch({ keyword }: UseLocationSearchParams) {
  const results = useMemo(() => searchLocationsByKeyword(keyword), [keyword]);

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
