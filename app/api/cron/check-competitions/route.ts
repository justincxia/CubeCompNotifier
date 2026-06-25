import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { fetchUpcomingCompetitions } from "@/lib/wca";
import { isWithinRadius } from "@/lib/haversine";
import { sendCompetitionAlert } from "@/lib/twilio";
import type { User, Competition } from "@/types";

export const maxDuration = 300; // 5-minute max execution time (Vercel Pro)
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const runStart = new Date().toISOString();

  let competitionsFound = 0;
  let competitionsNew = 0;
  let notificationsSent = 0;
  let logError: string | null = null;

  try {
    // 1. Fetch upcoming competitions from WCA REST API
    const wcaComps = await fetchUpcomingCompetitions();
    competitionsFound = wcaComps.length;

    if (wcaComps.length === 0) {
      await logCronRun(supabase, runStart, 0, 0, 0, null, "success");
      return NextResponse.json({ message: "No upcoming competitions found.", competitionsFound: 0 });
    }

    // 2. Get IDs of competitions already in our DB
    const { data: existingRows } = await supabase
      .from("competitions")
      .select("id");

    const existingIds = new Set((existingRows ?? []).map((r: { id: string }) => r.id));

    // 3. Find newly announced competitions
    const newComps = wcaComps.filter((c) => !existingIds.has(c.id));
    competitionsNew = newComps.length;

    if (newComps.length === 0) {
      await logCronRun(supabase, runStart, competitionsFound, 0, 0, null, "success");
      return NextResponse.json({ message: "No new competitions.", competitionsFound, competitionsNew: 0 });
    }

    // 4. Insert new competitions into DB
    const insertPayloads = newComps.map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city,
      country: c.country,
      latitude: c.venue?.coordinates?.latitude ?? null,
      longitude: c.venue?.coordinates?.longitude ?? null,
      start_date: c.date.from,
      end_date: c.date.till,
      events: c.events,
      information: c.information ?? null,
      website_url: c.externalWebsite ?? null,
      is_canceled: c.isCanceled,
      announced_at: runStart,
    }));

    const { error: insertError } = await supabase
      .from("competitions")
      .insert(insertPayloads);

    if (insertError) {
      throw new Error(`Failed to insert competitions: ${insertError.message}`);
    }

    // 5. Fetch all active, verified users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("is_verified", true)
      .eq("is_paused", false);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      await logCronRun(supabase, runStart, competitionsFound, competitionsNew, 0, null, "success");
      return NextResponse.json({ message: "No active users to notify.", competitionsNew });
    }

    // 6. For each new competition, notify matching users
    const notificationInserts: { user_id: string; competition_id: string }[] = [];
    const smsTasks: Promise<void>[] = [];

    for (const compPayload of insertPayloads) {
      if (compPayload.latitude == null || compPayload.longitude == null) {
        continue; // can't calculate distance without coordinates
      }

      const competition = compPayload as unknown as Competition;

      for (const user of users as User[]) {
        const inRadius = isWithinRadius(
          user.latitude,
          user.longitude,
          compPayload.latitude,
          compPayload.longitude,
          user.notification_radius
        );

        if (!inRadius) continue;

        // Deduplicate: check if notification already exists
        const alreadySent = notificationInserts.some(
          (n) => n.user_id === user.id && n.competition_id === compPayload.id
        );
        if (alreadySent) continue;

        notificationInserts.push({
          user_id: user.id,
          competition_id: compPayload.id,
        });

        // Send SMS asynchronously (rate-limit: small delay between sends)
        smsTasks.push(
          sendCompetitionAlert(user.phone_number, competition).then(
            (result) => {
              if (result.success) notificationsSent++;
              else console.error(`SMS failed to ${user.phone_number}:`, result.error);
            }
          )
        );
      }
    }

    // Process SMS sends in batches of 10 to avoid Twilio rate limits
    for (let i = 0; i < smsTasks.length; i += 10) {
      await Promise.all(smsTasks.slice(i, i + 10));
    }

    // 7. Bulk insert notification records (ignore conflicts for safety)
    if (notificationInserts.length > 0) {
      await supabase
        .from("notifications")
        .upsert(notificationInserts, { onConflict: "user_id,competition_id", ignoreDuplicates: true });
    }
  } catch (err) {
    logError = err instanceof Error ? err.message : "Unknown error";
    console.error("Cron error:", logError);
    await logCronRun(supabase, runStart, competitionsFound, competitionsNew, notificationsSent, logError, "error");
    return NextResponse.json({ error: logError }, { status: 500 });
  }

  await logCronRun(supabase, runStart, competitionsFound, competitionsNew, notificationsSent, null, "success");

  return NextResponse.json({
    success: true,
    competitionsFound,
    competitionsNew,
    notificationsSent,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logCronRun(supabase: any, runAt: string, found: number, newCount: number, sent: number, error: string | null, status: string) {
  await supabase.from("cron_logs").insert({
    run_at: runAt,
    competitions_found: found,
    competitions_new: newCount,
    notifications_sent: sent,
    error,
    status,
  });
}
