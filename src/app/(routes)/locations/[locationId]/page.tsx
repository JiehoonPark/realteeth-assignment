import { LocationDetail } from "@/widgets/weather";

type LocationDetailPageProps = {
  params: Promise<{
    locationId: string;
  }>;
  searchParams: Promise<{
    lat?: string;
    lon?: string;
  }>;
};

export default async function LocationDetailPage({
  params,
  searchParams,
}: LocationDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const latitude = resolvedSearchParams.lat ? Number(resolvedSearchParams.lat) : undefined;
  const longitude = resolvedSearchParams.lon ? Number(resolvedSearchParams.lon) : undefined;
  const hasCoordinates =
    Number.isFinite(latitude) && Number.isFinite(longitude);
  const initialCoordinates = hasCoordinates
    ? { latitude: latitude as number, longitude: longitude as number }
    : undefined;

  return (
    <LocationDetail
      locationId={resolvedParams.locationId}
      initialCoordinates={initialCoordinates}
    />
  );
}
