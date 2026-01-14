import LocationDetailClient from "@/widgets/weather/ui/location-detail-client";

type LocationDetailPageProps = {
  params: {
    locationId: string;
  };
};

export default function LocationDetailPage({ params }: LocationDetailPageProps) {
  return <LocationDetailClient locationId={params.locationId} />;
}
