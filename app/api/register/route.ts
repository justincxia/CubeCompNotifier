import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { geocodeLocation } from "@/lib/geocoding";
import { generateOtp, sendOtp } from "@/lib/twilio";
import { registerSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  // 5 registrations per IP per hour
  const { allowed } = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  const { phone_number, city, state, country, notification_radius } =
    result.data;

  const supabase = createServiceClient();

  // Check if phone is already registered
  const { data: existing } = await supabase
    .from("users")
    .select("id, is_verified")
    .eq("phone_number", phone_number)
    .maybeSingle();

  if (existing?.is_verified) {
    return NextResponse.json(
      { error: "This phone number is already registered. Use the dashboard to manage your account." },
      { status: 409 }
    );
  }

  // Geocode the location
  let latitude: number;
  let longitude: number;
  try {
    const geo = await geocodeLocation(city, state, country);
    latitude = geo.latitude;
    longitude = geo.longitude;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Geocoding failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  // Upsert user record (unverified)
  const { data: user, error: upsertError } = await supabase
    .from("users")
    .upsert(
      {
        phone_number,
        city,
        state: state || null,
        country,
        latitude,
        longitude,
        notification_radius,
        is_verified: false,
        is_paused: false,
      },
      { onConflict: "phone_number" }
    )
    .select("id")
    .single();

  if (upsertError || !user) {
    console.error("User upsert error:", upsertError);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }

  // Generate and store OTP
  const code = generateOtp();
  const { error: otpError } = await supabase.from("otp_codes").insert({
    phone_number,
    code,
  });

  if (otpError) {
    console.error("OTP insert error:", otpError);
    return NextResponse.json(
      { error: "Failed to generate verification code." },
      { status: 500 }
    );
  }

  // Send OTP via Twilio
  const smsResult = await sendOtp(phone_number, code);
  if (!smsResult.success) {
    console.error("SMS send error:", smsResult.error);
    return NextResponse.json(
      {
        error:
          "Failed to send verification SMS. Please check the phone number and try again.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Verification code sent. Check your SMS." },
    { status: 201 }
  );
}
