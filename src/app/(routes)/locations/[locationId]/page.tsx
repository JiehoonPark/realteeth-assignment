import LocationDetailClient from "@/widgets/weather/ui/location-detail-client";

type LocationDetailPageProps = {
  params: Promise<{
    locationId: string;
  }>;
};

export default async function LocationDetailPage({ params }: LocationDetailPageProps) {
  const resolvedParams = await params;
  return <LocationDetailClient locationId={resolvedParams.locationId} />;
}
