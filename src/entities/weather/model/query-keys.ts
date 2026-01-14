const CURRENT_WEATHER_QUERY_KEY = "current-weather";

export const weatherQueryKeys = {
  current: (latitude: number, longitude: number) => [
    CURRENT_WEATHER_QUERY_KEY,
    latitude,
    longitude,
  ],
  byName: (locationName: string) => [CURRENT_WEATHER_QUERY_KEY, locationName],
};
