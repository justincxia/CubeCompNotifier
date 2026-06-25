import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { geocodeLocation } from "@/lib/geocoding";
import { updateUserSchema, loginSchema } from "@/lib/validations";
import { generateOtp, sendOtp } from "@/lib/twilio";

// GET /api/user?phone=+1234567890
// Returns user profile after OTP login (used by dashboard)
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ error: "phone query param required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: user } = await supabase
    .from("users")
    .select("id, phone_number, city, state, country, latitude, longitude, notification_radius, is_verified, is_paused, created_at")
    .eq("phone_number", phone)
    .eq("is_verified", true)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// POST /api/user/login — sends OTP to existing user for dashboard access
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const { phone_number } = result.data;
  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("phone_number", phone_number)
    .eq("is_verified", true)
    .maybeSingle();

  if (!user) {
    return NextResponse.json(
      { error: "No verified account found for this phone number." },
      { status: 404 }
    );
  }

  const code = generateOtp();
  await supabase.from("otp_codes").insert({ phone_number, code });

  const smsResult = await sendOtp(phone_number, code);
  if (!smsResult.success) {
    return NextResponse.json(
      { error: "Failed to send verification SMS." },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Verification code sent." });
}

// PATCH /api/user — update user profile
export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { phone_number, ...updates } = body as Record<string, unknown>;

  if (!phone_number || typeof phone_number !== "string") {
    return NextResponse.json({ error: "phone_number required" }, { status: 400 });
  }

  const result = updateUserSchema.safeParse(updates);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const patchData: Record<string, unknown> = { ...result.data };

  // If location fields changed, re-geocode
  if (result.data.city || result.data.country) {
    const { data: existing } = await supabase
      .from("users")
      .select("city, state, country")
      .eq("phone_number", phone_number)
      .single();

    if (existing) {
      const city = result.data.city ?? existing.city;
      const state = result.data.state ?? existing.state ?? "";
      const country = result.data.country ?? existing.country;
      try {
        const geo = await geocodeLocation(city, state, country);
        patchData.latitude = geo.latitude;
        patchData.longitude = geo.longitude;
      } catch {
        return NextResponse.json(
          { error: "Could not geocode the new location." },
          { status: 422 }
        );
      }
    }
  }

  const { data: user, error } = await supabase
    .from("users")
    .update(patchData)
    .eq("phone_number", phone_number)
    .select("id, phone_number, city, state, country, notification_radius, is_paused")
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }

  return NextResponse.json({ user });
}

// DELETE /api/user — delete account
export async function DELETE(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ error: "phone query param required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("phone_number", phone);

  if (error) {
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }

  return NextResponse.json({ message: "Account deleted." });
}
