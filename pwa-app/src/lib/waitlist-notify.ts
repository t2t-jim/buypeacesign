import { Resend } from "resend";
import type { WaitlistEntry } from "@/lib/waitlist";

/**
 * Email Jim (or WAITLIST_NOTIFY_TO) on each successful waitlist persist.
 * No-ops (logs) when RESEND_API_KEY is missing — caller should still treat signup as ok
 * only after persist succeeded; this helper never throws for missing key.
 * Returns true if sent, false if skipped/failed.
 */
export async function sendWaitlistNotifyEmail(
  entry: WaitlistEntry,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "[waitlist-notify] RESEND_API_KEY not set — skipping email notify.",
    );
    return false;
  }

  const to =
    process.env.WAITLIST_NOTIFY_TO?.trim() || "searchjim@gmail.com";
  const from =
    process.env.RESEND_FROM?.trim() ||
    "BuyPeaceSign <onboarding@resend.dev>";

  const subject = `New BuyPeaceSign pre-order: ${entry.email}`;
  const body = [
    "New BuyPeaceSign pre-order interest",
    "",
    `Email: ${entry.email}`,
    `First name: ${entry.firstName ?? "(none)"}`,
    `Size interest: ${entry.sizeInterest ?? "(none)"}`,
    `Hex: ${entry.hex ?? "(none)"}`,
    `Source: ${entry.source}`,
    `Created at: ${entry.createdAt}`,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      text: body,
    });
    if (error) {
      console.error("[waitlist-notify] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[waitlist-notify] send failed:", err);
    return false;
  }
}
