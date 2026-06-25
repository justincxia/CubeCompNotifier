import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { haversineDistance } from "@/lib/haversine";
import type { Competition } from "@/types";

// GET /api/nearby?lat=40.7&lon=-74.0&radius=100&limit=10
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");
  const radius = parseInt(searchParams.get("radius") ?? "100");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { error: "lat and lon query params required" },
      { status: 400 }
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const supabase = createServiceClient();

  const { data: competitions, error } = await supabase
    .from("competitions")
    .select("*")
    .gte("start_date", today)
    .eq("is_canceled", false)
    .order("start_date", { ascending: true })
    .limit(500); // fetch a chunk then filter by distance

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const withDistance = (competitions as Competition[])
    .filter((c) => c.latitude != null && c.longitude != null)
    .map((c) => ({
      ...c,
      distance: haversineDistance(lat, lon, c.latitude!, c.longitude!),
    }))
    .filter((c) => radius === -1 || c.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return NextResponse.json({ competitions: withDistance });
}
