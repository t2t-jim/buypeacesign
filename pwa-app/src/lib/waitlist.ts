/**
 * Waitlist / pre-order interest API contract (market-test v1.1).
 * Aligns with prep/content/copy.ts size ids: "36" | "48" | "unsure".
 * Server should set `createdAt`; client may omit it.
 * Never collect payment fields.
 */

export type WaitlistSource = "landing" | "configure";

export type SizeInterest = "36" | "48" | "unsure";

export const SIZE_INTEREST_VALUES: readonly SizeInterest[] = [
  "36",
  "48",
  "unsure",
] as const;

export type WaitlistEntry = {
  /** Required — early-access key */
  email: string;
  /** Optional personalization */
  firstName?: string;
  /** Optional; prefilled from configure path */
  sizeInterest?: SizeInterest;
  /** Optional custom glow hex, e.g. "#7CB7FF" */
  hex?: string;
  /** Where the signup originated */
  source: WaitlistSource;
  /** ISO-8601 timestamp — set server-side */
  createdAt: string;
};

/** Body accepted by POST /api/waitlist (createdAt optional from client) */
export type WaitlistCreateInput = Omit<WaitlistEntry, "createdAt"> & {
  createdAt?: string;
};

/** Alias for stub drafts */
export type WaitlistSubmission = WaitlistCreateInput;

export type WaitlistCreateResponse =
  | { ok: true; id?: string }
  | { ok: false; error: string };

export type WaitlistApiResponse = WaitlistCreateResponse;

export const WAITLIST_API_PATH = "/api/waitlist" as const;

/**
 * Suggested Route Handler shape:
 *   POST /api/waitlist
 *   Content-Type: application/json
 *   Body: WaitlistCreateInput
 *   200: WaitlistCreateResponse { ok: true }
 *   400: { ok: false, error: "..." }
 *   500: { ok: false, error: "..." }
 *
 * Persist with a free-tier option only (log, Blob, KV, Resend notify, etc.).
 * Never collect payment fields here.
 */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function normalizeHex(hex: string | undefined): string | undefined {
  if (!hex) return undefined;
  const t = hex.trim();
  if (!t) return undefined;
  const withHash = t.startsWith("#") ? t : `#${t}`;
  if (!/^#[0-9A-Fa-f]{6}$/.test(withHash)) return undefined;
  return withHash.toUpperCase();
}

export function isSizeInterest(value: unknown): value is SizeInterest {
  return (
    typeof value === "string" &&
    (SIZE_INTEREST_VALUES as readonly string[]).includes(value)
  );
}

export function isWaitlistSource(value: unknown): value is WaitlistSource {
  return value === "landing" || value === "configure";
}

/** Validate + normalize a client payload for POST /api/waitlist. */
export function parseWaitlistCreateInput(
  raw: unknown,
): { ok: true; data: WaitlistCreateInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Invalid JSON body." };
  }
  const body = raw as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email." };
  }
  if (!isWaitlistSource(body.source)) {
    return { ok: false, error: "Invalid source." };
  }

  const firstName =
    typeof body.firstName === "string" && body.firstName.trim()
      ? body.firstName.trim()
      : undefined;

  let sizeInterest: SizeInterest | undefined;
  if (
    body.sizeInterest !== undefined &&
    body.sizeInterest !== null &&
    body.sizeInterest !== ""
  ) {
    if (!isSizeInterest(body.sizeInterest)) {
      return { ok: false, error: "Invalid sizeInterest." };
    }
    sizeInterest = body.sizeInterest;
  }

  const hex =
    typeof body.hex === "string" ? normalizeHex(body.hex) : undefined;
  if (typeof body.hex === "string" && body.hex.trim() && !hex) {
    return { ok: false, error: "Invalid hex color." };
  }

  return {
    ok: true,
    data: {
      email,
      firstName,
      sizeInterest,
      hex,
      source: body.source,
    },
  };
}
