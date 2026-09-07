import { Redis } from "@upstash/redis";
import type { WaitlistEntry } from "@/lib/waitlist";

const WAITLIST_KEY = "waitlist:entries";
const WAITLIST_COUNT_KEY = "waitlist:count";

/**
 * Prefer Vercel KV env names; fall back to Upstash Redis REST names.
 * Returns null when storage is not configured.
 */
export function getRedis(): Redis | null {
  const url =
    process.env.KV_REST_API_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token =
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) return null;

  return new Redis({ url, token });
}

/**
 * Persist a waitlist entry via LPUSH onto `waitlist:entries`.
 * Also increments an optional counter key.
 * Throws if Redis is not configured or the write fails.
 */
export async function saveWaitlistEntry(entry: WaitlistEntry): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    throw new Error(
      "Waitlist storage is not configured. Set KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).",
    );
  }

  await redis.lpush(WAITLIST_KEY, JSON.stringify(entry));
  try {
    await redis.incr(WAITLIST_COUNT_KEY);
  } catch (err) {
    // Counter is optional; entry was already saved.
    console.error("[waitlist-store] counter incr failed:", err);
  }
}
