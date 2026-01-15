const OPENWEATHER_ICON_BASE_URL = "https://openweathermap.org/img/wn";

type OpenWeatherIconSize = "2x" | "4x";

export function getOpenWeatherIconUrl(iconCode: string, size: OpenWeatherIconSize = "2x") {
  return `${OPENWEATHER_ICON_BASE_URL}/${iconCode}@${size}.png`;
}

export function getOpenWeatherIconAlt(description?: string) {
  const trimmed = description?.trim();
  return trimmed ? `날씨: ${trimmed}` : "날씨 아이콘";
}
