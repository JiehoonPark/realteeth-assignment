type LocationDetailPageProps = {
  params: {
    locationId: string;
  };
};

export default function LocationDetailPage({
  params,
}: LocationDetailPageProps) {
  return (
    <main>
      <h1>위치</h1>
      <div>장소</div>
      <div>기온 상세정보</div>
    </main>
  );
}
