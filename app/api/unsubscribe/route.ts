import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// POST /api/unsubscribe { phone_number }
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { phone_number } = body as { phone_number?: string };
  if (!phone_number) {
    return NextResponse.json({ error: "phone_number required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Soft delete: pause + unverify so the user stops receiving SMS
  const { error } = await supabase
    .from("users")
    .update({ is_paused: true, is_verified: false })
    .eq("phone_number", phone_number);

  if (error) {
    return NextResponse.json({ error: "Unsubscribe failed." }, { status: 500 });
  }

  return NextResponse.json({ message: "You have been unsubscribed from competition alerts." });
}
