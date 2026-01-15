import type { LocationId } from "@/entities/location";

export type TemperatureCelsius = {
  current: number;
  minimum: number;
  maximum: number;
};

export type HourlyTemperature = {
  hour: string;
  temperature: number;
};

export type WeatherSummary = {
  locationId: LocationId;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: string;
  icon: string;
  temperature: TemperatureCelsius;
  humidity: number;
  windSpeed: number;
  recordedAt: string;
  hourly: HourlyTemperature[];
};
