export type LocationId = string;

export type LocationCoordinates = {
  latitude: number;
  longitude: number;
};

export type LocationNode = {
  id: LocationId;
  name: string;
  fullName: string;
  level: "sido" | "sigungu" | "dong";
  coordinates?: LocationCoordinates;
  parentId?: LocationId;
};
