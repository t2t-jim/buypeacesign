"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { PeaceSignPreview } from "@/components/PeaceSignPreview";
import { PreorderForm } from "@/components/PreorderForm";
import { InstallPrompt } from "@/components/InstallPrompt";
import { copy } from "@/content/copy";
import { findSwatchByHex, DEFAULT_HEX } from "@/content/swatches";
import { normalizeHex, type SizeInterest } from "@/lib/waitlist";

function ReviewInner() {
  const params = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const size = (params.get("size") === "48" ? "48" : "36") as SizeInterest;
  const hex = useMemo(
    () => normalizeHex(params.get("hex") ?? undefined) ?? DEFAULT_HEX,
    [params],
  );
  const swatch = findSwatchByHex(hex);
  const colorLabel = swatch ? `${swatch.name} (${hex})` : hex;

  return (
    <div className="configure">
      <PeaceSignPreview hex={hex} sizeLabel={`${size}"`} sticky />
      <div className="review-card">
        <h1>{copy.configure.review.h1}</h1>
        <ul className="review-summary">
          <li>
            <span className="label">{copy.configure.review.summaryLabels.size}</span>
            <span className="value">{size}&quot;</span>
          </li>
          <li>
            <span className="label">{copy.configure.review.summaryLabels.color}</span>
            <span className="value">
              <span className="dot" style={{ background: hex, width: 14, height: 14, borderRadius: "50%", display: "inline-block", border: "1px solid var(--border)" }} />
              {colorLabel}
            </span>
          </li>
          <li>
            <span className="label">{copy.configure.review.summaryLabels.power}</span>
            <span className="value">{copy.configure.review.powerValue}</span>
          </li>
        </ul>
        {/* Price intentionally omitted — market-test */}
        <p className="legal-micro">{copy.configure.review.micro}</p>
        {!showForm ? (
          <div className="review-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              {copy.configure.review.primaryCta}
            </button>
            <Link href="/configure" className="btn-ghost" style={{ textAlign: "center" }}>
              {copy.configure.review.secondaryCta}
            </Link>
          </div>
        ) : (
          <div style={{ marginTop: "1rem" }}>
            <PreorderForm
              source="configure"
              initialSize={size}
              initialHex={hex}
              hideSizePicker
              onSuccess={() => setSubmitted(true)}
            />
          </div>
        )}
      </div>
      <InstallPrompt show={submitted} />
    </div>
  );
}

export default function ConfigureReviewPage() {
  return (
    <Suspense fallback={<p className="page-body">Loading design…</p>}>
      <ReviewInner />
    </Suspense>
  );
}
