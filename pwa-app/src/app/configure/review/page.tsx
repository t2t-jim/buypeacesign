"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { PeaceSignPreview } from "@/components/PeaceSignPreview";
import { PreorderForm } from "@/components/PreorderForm";
import { InstallPrompt } from "@/components/InstallPrompt";
import { copy } from "@/content/copy";
import { findSwatchByHex, DEFAULT_HEX } from "@/content/swatches";
import {
  formatSizeLabel,
  normalizeHex,
  parseCustomSizeInches,
  type SizeInterest,
} from "@/lib/waitlist";

function parseReviewSize(params: URLSearchParams): {
  sizeInterest: SizeInterest;
  customSizeInches?: number;
  sizeLabel: string;
} {
  const sizeParam = params.get("size");
  const inchesParam = params.get("inches");

  if (sizeParam === "48") {
    return { sizeInterest: "48", sizeLabel: '48"' };
  }
  if (sizeParam === "36") {
    return { sizeInterest: "36", sizeLabel: '36"' };
  }
  if (sizeParam === "custom") {
    const inches = parseCustomSizeInches(inchesParam);
    if (inches !== undefined) {
      return {
        sizeInterest: "custom",
        customSizeInches: inches,
        sizeLabel: `${inches}"`,
      };
    }
  }
  const asInches = parseCustomSizeInches(sizeParam);
  if (asInches !== undefined) {
    return {
      sizeInterest: "custom",
      customSizeInches: asInches,
      sizeLabel: `${asInches}"`,
    };
  }
  // Sensible fallback if query is missing/corrupt — still land on review UI.
  return { sizeInterest: "36", sizeLabel: '36"' };
}

function ReviewInner() {
  const params = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { sizeInterest, customSizeInches, sizeLabel } = useMemo(
    () => parseReviewSize(params),
    [params],
  );
  const hex = useMemo(
    () => normalizeHex(params.get("hex") ?? undefined) ?? DEFAULT_HEX,
    [params],
  );
  const swatch = findSwatchByHex(hex);
  const colorLabel = swatch ? `${swatch.name} (${hex})` : hex;
  const previewLabel =
    formatSizeLabel(sizeInterest, customSizeInches) ?? sizeLabel;

  const editHref = useMemo(() => {
    const q = new URLSearchParams();
    if (sizeInterest === "custom" && customSizeInches !== undefined) {
      q.set("size", "custom");
      q.set("inches", String(customSizeInches));
    } else {
      q.set("size", sizeInterest === "unsure" ? "36" : sizeInterest);
    }
    return `/configure?${q.toString()}`;
  }, [sizeInterest, customSizeInches]);

  return (
    <div className="configure">
      <PeaceSignPreview hex={hex} sizeLabel={previewLabel} sticky />
      <div className="review-card">
        <h1>{copy.configure.review.h1}</h1>
        <ul className="review-summary">
          <li>
            <span className="label">{copy.configure.review.summaryLabels.size}</span>
            <span className="value">{sizeLabel}</span>
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
            <Link href={editHref} className="btn-ghost" style={{ textAlign: "center" }}>
              {copy.configure.review.secondaryCta}
            </Link>
          </div>
        ) : (
          <div style={{ marginTop: "1rem" }}>
            <PreorderForm
              source="configure"
              initialSize={sizeInterest}
              initialCustomSizeInches={customSizeInches}
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
