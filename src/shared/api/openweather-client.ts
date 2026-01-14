type OpenWeatherQueryParams = Record<string, string | number | undefined>;

type RequestOptions = {
  pathname: string;
  params?: OpenWeatherQueryParams;
};

export type OpenWeatherError = Error & {
  status?: number;
  body?: string;
};

const DEFAULT_OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

export const OPENWEATHER_API_KEY =
  process.env.OPENWEATHER_API_KEY ??
  process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ??
  "";
const rawBaseUrl =
  process.env.OPENWEATHER_BASE_URL ??
  process.env.NEXT_PUBLIC_OPENWEATHER_BASE_URL ??
  DEFAULT_OPENWEATHER_BASE_URL;

const OPENWEATHER_BASE_URL = rawBaseUrl.includes("/data/2.5")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, "")}/data/2.5`;

function buildUrl(pathname: string, params?: OpenWeatherQueryParams) {
  const base = OPENWEATHER_BASE_URL.replace(/\/$/, "");
  const cleanedPath = pathname.replace(/^\//, "");
  const url = new URL(`${base}/${cleanedPath}`);
  const mergedParams = {
    units: "metric",
    appid: OPENWEATHER_API_KEY,
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
  if (!OPENWEATHER_API_KEY) {
    throw new Error("OpenWeatherMap API 키가 설정되지 않았습니다.");
  }

  const url = buildUrl(pathname, params);
  const response = await fetch(url.toString(), { cache: "no-store" });

  if (!response.ok) {
    const errorBody = await response.text();
    const error = new Error(
      `OpenWeatherMap 요청 실패: ${response.status} ${response.statusText} - ${errorBody}`,
    ) as OpenWeatherError;
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  return response.json() as Promise<TResponse>;
}
