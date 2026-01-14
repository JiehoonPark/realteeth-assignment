import { assertWeatherApiEnv, weatherApiEnv } from "@/shared/config/env";

type OpenWeatherQueryParams = Record<string, string | number | undefined>;

type RequestOptions = {
  pathname: string;
  params?: OpenWeatherQueryParams;
};

function buildUrl(pathname: string, params?: OpenWeatherQueryParams) {
  const url = new URL(pathname, weatherApiEnv.baseUrl);
  const mergedParams = {
    units: weatherApiEnv.units,
    appid: weatherApiEnv.apiKey,
    ...params,
  };

  Object.entries(mergedParams).forEach(([key, value]) => {
    if (value === undefined) return;
    url.searchParams.set(key, String(value));
  });

  return url;
}

export async function fetchOpenWeather<TResponse>({
  pathname,
  params,
}: RequestOptions): Promise<TResponse> {
  assertWeatherApiEnv();

  const url = buildUrl(pathname, params);
  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`OpenWeatherMap 요청 실패: ${response.statusText}`);
  }

  return response.json() as Promise<TResponse>;
}
