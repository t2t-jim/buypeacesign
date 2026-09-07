import { NextResponse } from "next/server";
import {
  parseWaitlistCreateInput,
  type WaitlistEntry,
} from "@/lib/waitlist";
import { getRedis, saveWaitlistEntry } from "@/lib/waitlist-store";
import { sendWaitlistNotifyEmail } from "@/lib/waitlist-notify";

/**
 * POST /api/waitlist — market-test early-access capture.
 *
 * Durable store: Upstash Redis / Vercel KV (`waitlist:entries` list).
 * Notify: Resend email to WAITLIST_NOTIFY_TO (best-effort after persist).
 * Never collect payment fields.
 */

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = parseWaitlistCreateInput(raw);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: parsed.error },
      { status: 400 },
    );
  }

  if (!getRedis()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Waitlist storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN).",
      },
      { status: 500 },
    );
  }

  const entry: WaitlistEntry = {
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };

  try {
    await saveWaitlistEntry(entry);
  } catch (err) {
    console.error("[waitlist] persist failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Could not save your pre-order interest. Please try again.",
      },
      { status: 500 },
    );
  }

  // Best-effort notify — never fail the signup if email fails after persist.
  try {
    await sendWaitlistNotifyEmail(entry);
  } catch (err) {
    console.error("[waitlist] notify failed after persist:", err);
  }

  return NextResponse.json({
    ok: true,
    id: `${entry.createdAt}:${entry.email}`,
  });
}

/** Health check — does not list entries. */
export async function GET() {
  const configured = Boolean(getRedis());
  return NextResponse.json({
    ok: true,
    storageConfigured: configured,
    note: configured
      ? "Waitlist entries persist to Upstash/Vercel KV key waitlist:entries."
      : "Set KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_* equivalents) to enable durable storage.",
  });
}
