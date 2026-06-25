import twilio from "twilio";
import { formatDateRange, wcaCompetitionUrl } from "./wca";
import type { Competition } from "@/types";

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  return twilio(accountSid, authToken);
}

const FROM = process.env.TWILIO_PHONE_NUMBER!;

/** Sends an SMS notification about a newly announced competition. */
export async function sendCompetitionAlert(
  toPhone: string,
  competition: Competition
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const dateRange = formatDateRange(competition.start_date, competition.end_date);
  const url = wcaCompetitionUrl(competition.id);

  const body =
    `🏆 New WCA Competition!\n\n` +
    `${competition.name}\n\n` +
    `📍 ${competition.city}, ${competition.country}\n` +
    `🗓 ${dateRange}\n\n` +
    `More info:\n${url}`;

  try {
    const message = await getClient().messages.create({
      body,
      from: FROM,
      to: toPhone,
    });
    return { success: true, sid: message.sid };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown Twilio error";
    return { success: false, error };
  }
}

/** Sends a 6-digit OTP for phone verification. */
export async function sendOtp(
  toPhone: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const body =
    `Your CubeComp Notifier verification code is: ${code}\n\n` +
    `This code expires in 10 minutes. Do not share it with anyone.`;

  try {
    await getClient().messages.create({ body, from: FROM, to: toPhone });
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown Twilio error";
    return { success: false, error };
  }
}

/** Generates a random 6-digit OTP string. */
export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
