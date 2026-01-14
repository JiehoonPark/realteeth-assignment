'use client';

import LocationDetailContent from "./location-detail-content";

type LocationDetailClientProps = {
  locationId: string;
};

export default function LocationDetailClient({ locationId }: LocationDetailClientProps) {
  return <LocationDetailContent locationId={locationId} />;
}
