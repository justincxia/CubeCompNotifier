import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOtpSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = verifyOtpSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  const { phone_number, code } = result.data;
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // Find a valid, unused OTP
  const { data: otp, error: otpError } = await supabase
    .from("otp_codes")
    .select("id, code, expires_at, used")
    .eq("phone_number", phone_number)
    .eq("used", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpError) {
    console.error("OTP lookup error:", otpError);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }

  if (!otp) {
    return NextResponse.json(
      { error: "No pending verification found for this number." },
      { status: 404 }
    );
  }

  if (otp.expires_at < now) {
    return NextResponse.json(
      { error: "Verification code has expired. Please request a new one." },
      { status: 410 }
    );
  }

  if (otp.code !== code) {
    return NextResponse.json(
      { error: "Incorrect verification code." },
      { status: 401 }
    );
  }

  // Mark OTP as used
  await supabase.from("otp_codes").update({ used: true }).eq("id", otp.id);

  // Mark user as verified
  const { data: user, error: userError } = await supabase
    .from("users")
    .update({ is_verified: true })
    .eq("phone_number", phone_number)
    .select("id, phone_number, city, state, country, notification_radius, is_paused")
    .single();

  if (userError || !user) {
    return NextResponse.json(
      { error: "User not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ user });
}
