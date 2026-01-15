import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { resolveCoordinatesByName } from "@/entities/location";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locationName = searchParams.get("name");

  if (!locationName) {
    return NextResponse.json(
      { message: "name 쿼리 파라미터가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const resolved = await resolveCoordinatesByName(locationName);
    if (!resolved) {
      return NextResponse.json(
        { message: "해당 장소의 정보가 제공되지 않습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json(resolved);
  } catch (error) {
    console.error("Failed to fetch coordinates", error);
    return NextResponse.json(
      { message: "좌표 정보를 가져오지 못했습니다." },
      { status: 502 },
    );
  }
}
