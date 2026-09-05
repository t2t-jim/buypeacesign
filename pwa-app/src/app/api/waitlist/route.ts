import { NextResponse } from "next/server";
import { mkdir, appendFile } from "fs/promises";
import path from "path";
import {
  parseWaitlistCreateInput,
  type WaitlistEntry,
} from "@/lib/waitlist";

/**
 * POST /api/waitlist — market-test early-access capture.
 *
 * Demo persistence: append JSON lines to `data/waitlist.jsonl` in the project
 * (and keep an in-memory mirror for the running process).
 *
 * Upgrade later (document in README):
 *   - Vercel Blob / KV free tier
 *   - Postgres / Neon free
 *   - Resend free-tier email notify
 * On Vercel serverless, the filesystem is ephemeral — move to Blob/KV before
 * production volume.
 */

const memoryStore: WaitlistEntry[] = [];

function dataFilePath(): string {
  // Prefer project-local data/ for local + demo; fall back to /tmp on read-only hosts.
  return path.join(process.cwd(), "data", "waitlist.jsonl");
}

async function persist(entry: WaitlistEntry): Promise<void> {
  memoryStore.push(entry);
  const file = dataFilePath();
  try {
    await mkdir(path.dirname(file), { recursive: true });
    await appendFile(file, `${JSON.stringify(entry)}\n`, "utf8");
  } catch {
    // Filesystem may be read-only (some serverless). Memory store still holds entry.
    const fallback = path.join("/tmp", "buypeacesign-waitlist.jsonl");
    try {
      await appendFile(fallback, `${JSON.stringify(entry)}\n`, "utf8");
    } catch {
      /* memory-only fallback */
    }
  }
}

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

  const entry: WaitlistEntry = {
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };

  try {
    await persist(entry);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not save your pre-order interest." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    id: `${entry.createdAt}:${entry.email}`,
  });
}

/** Dev helper — not for production listing. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    count: memoryStore.length,
    note: "Entries also append to data/waitlist.jsonl when the filesystem allows.",
  });
}
