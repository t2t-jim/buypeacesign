/**
 * Waitlist / pre-order interest API contract (market-test v1.1).
 * Size ids: "36" | "48" | "custom" | "unsure".
 * When sizeInterest is "custom", customSizeInches (12–96) is required.
 * Server should set `createdAt`; client may omit it.
 * Never collect payment fields.
 */

export type WaitlistSource = "landing" | "configure";

export type SizeInterest = "36" | "48" | "custom" | "unsure";

export const SIZE_INTEREST_VALUES: readonly SizeInterest[] = [
  "36",
  "48",
  "custom",
  "unsure",
] as const;

/** Inclusive product-safe custom diameter range (inches). */
export const CUSTOM_SIZE_MIN_INCHES = 12;
export const CUSTOM_SIZE_MAX_INCHES = 96;

export type WaitlistEntry = {
  /** Required — early-access key */
  email: string;
  /** Optional personalization */
  firstName?: string;
  /** Optional; prefilled from configure path */
  sizeInterest?: SizeInterest;
  /** Required when sizeInterest is "custom" — diameter in inches (12–96) */
  customSizeInches?: number;
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
  const withHash = (t.startsWith("#") ? t : `#${t}`).toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(withHash)) return withHash;
  const short = withHash.match(/^#([0-9A-F])([0-9A-F])([0-9A-F])$/);
  if (short) {
    return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
  }
  return undefined;
}

export function isValidHexColor(hex: string | undefined): boolean {
  return normalizeHex(hex) !== undefined;
}

export function sanitizeHexInput(raw: string): string {
  const digits = raw.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
  return `#${digits}`;
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

/** Parse and validate a custom diameter in inches (12–96 inclusive). */
export function parseCustomSizeInches(raw: unknown): number | undefined {
  let n: number;
  if (typeof raw === "number") {
    n = raw;
  } else if (typeof raw === "string" && raw.trim() !== "") {
    n = Number(raw.trim());
  } else {
    return undefined;
  }
  if (!Number.isFinite(n) || Number.isNaN(n)) return undefined;
  if (n < CUSTOM_SIZE_MIN_INCHES || n > CUSTOM_SIZE_MAX_INCHES) {
    return undefined;
  }
  return n;
}

export function isValidCustomSizeInches(n: number): boolean {
  return parseCustomSizeInches(n) !== undefined;
}

/** Human-readable size label for preview / review, e.g. 36" or 42". */
export function formatSizeLabel(
  sizeInterest: SizeInterest | undefined,
  customSizeInches?: number,
): string | undefined {
  if (sizeInterest === "36" || sizeInterest === "48") {
    return `${sizeInterest}"`;
  }
  if (sizeInterest === "custom") {
    const inches = parseCustomSizeInches(customSizeInches);
    return inches !== undefined ? `${inches}"` : undefined;
  }
  return undefined;
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
  let customSizeInches: number | undefined;
  if (
    body.sizeInterest !== undefined &&
    body.sizeInterest !== null &&
    body.sizeInterest !== ""
  ) {
    if (!isSizeInterest(body.sizeInterest)) {
      return { ok: false, error: "Invalid sizeInterest." };
    }
    sizeInterest = body.sizeInterest;
    if (sizeInterest === "custom") {
      const inches = parseCustomSizeInches(body.customSizeInches);
      if (inches === undefined) {
        return {
          ok: false,
          error: `Enter a custom size between ${CUSTOM_SIZE_MIN_INCHES} and ${CUSTOM_SIZE_MAX_INCHES} inches.`,
        };
      }
      customSizeInches = inches;
    }
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
      customSizeInches,
      hex,
      source: body.source,
    },
  };
}
