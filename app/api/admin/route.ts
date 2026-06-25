import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const [
    { count: total_users },
    { count: verified_users },
    { count: active_users },
    { count: total_competitions },
    { count: total_notifications },
    { data: recent_competitions },
    { data: recent_cron_logs },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("is_verified", true),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("is_verified", true).eq("is_paused", false),
    supabase.from("competitions").select("*", { count: "exact", head: true }),
    supabase.from("notifications").select("*", { count: "exact", head: true }),
    supabase.from("competitions").select("*").order("announced_at", { ascending: false }).limit(10),
    supabase.from("cron_logs").select("*").order("run_at", { ascending: false }).limit(20),
  ]);

  return NextResponse.json({
    total_users: total_users ?? 0,
    verified_users: verified_users ?? 0,
    active_users: active_users ?? 0,
    total_competitions: total_competitions ?? 0,
    total_notifications: total_notifications ?? 0,
    recent_competitions: recent_competitions ?? [],
    recent_cron_logs: recent_cron_logs ?? [],
  });
}
