"use client";

/**
 * Shared pre-order / early-access form (landing hero + post-configure).
 * Honest copy only — no payment fields.
 * Lifted from prep/stubs/PreorderForm.tsx — wired to copy.ts + /api/waitlist.
 */

import { useState, type FormEvent } from "react";
import type { SizeInterest, WaitlistSource } from "@/lib/waitlist";
import {
  WAITLIST_API_PATH,
  isValidEmail,
  normalizeHex,
} from "@/lib/waitlist";
import { copy } from "@/content/copy";

export type PreorderFormProps = {
  /** Prefer `source`; `mode` kept as alias for older drafts */
  source?: WaitlistSource;
  mode?: WaitlistSource;
  initialSize?: SizeInterest;
  initialHex?: string;
  /** When true (configure path), hide size radio — size already chosen */
  hideSizePicker?: boolean;
  ctaLabel?: string;
  successMessage?: string;
  onSuccess?: () => void;
  className?: string;
};

export function PreorderForm({
  source,
  mode,
  initialSize,
  initialHex,
  hideSizePicker = false,
  ctaLabel,
  successMessage,
  onSuccess,
  className,
}: PreorderFormProps) {
  const origin: WaitlistSource = source ?? mode ?? "landing";
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [sizeInterest, setSizeInterest] = useState<SizeInterest | "">(
    initialSize ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const submitLabel =
    ctaLabel ??
    (origin === "configure"
      ? copy.preorderForm.ctaConfigure
      : copy.preorderForm.ctaLanding);

  const successText =
    successMessage ??
    (origin === "configure"
      ? copy.preorderForm.successConfigure
      : copy.preorderForm.successLanding);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setError(copy.preorderForm.errorEmail);
      return;
    }
    setPending(true);
    try {
      const res = await fetch(WAITLIST_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim() || undefined,
          sizeInterest: sizeInterest || undefined,
          hex: normalizeHex(initialHex),
          source: origin,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? copy.preorderForm.errorGeneric);
        return;
      }
      setDone(true);
      onSuccess?.();
    } catch {
      setError(copy.preorderForm.errorGeneric);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <p className={`form-success${className ? ` ${className}` : ""}`} role="status">
        {successText}
      </p>
    );
  }

  const normalizedHex = normalizeHex(initialHex);

  return (
    <form
      className={`preorder-form${className ? ` ${className}` : ""}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <h2>{submitLabel}</h2>
      <p>{copy.landing.preorderCard.helper}</p>
      <label>
        {copy.preorderForm.emailLabel}
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          placeholder={copy.preorderForm.emailPlaceholder}
        />
      </label>
      <label>
        {copy.preorderForm.firstNameLabel}{" "}
        <span>({copy.preorderForm.firstNameOptionalHint})</span>
        <input
          name="firstName"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(ev) => setFirstName(ev.target.value)}
          placeholder={copy.preorderForm.firstNamePlaceholder}
        />
      </label>
      {!hideSizePicker ? (
        <fieldset>
          <legend>{copy.preorderForm.sizeInterestLabel}</legend>
          <div className="size-seg">
            {copy.preorderForm.sizeOptions.map((opt) => (
              <label key={opt.id}>
                <input
                  type="radio"
                  name="sizeInterest"
                  value={opt.id}
                  checked={sizeInterest === opt.id}
                  onChange={() => setSizeInterest(opt.id)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      {normalizedHex ? (
        <p className="color-swatch-summary">
          {copy.preorderForm.colorSummaryLabel}:{" "}
          <span className="dot" style={{ background: normalizedHex }} />
          {normalizedHex}
        </p>
      ) : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="btn-primary" type="submit" disabled={pending}>
        {pending ? "Submitting…" : submitLabel}
      </button>
      <p className="legal-micro">{copy.preorderForm.legalMicro}</p>
    </form>
  );
}

export default PreorderForm;
