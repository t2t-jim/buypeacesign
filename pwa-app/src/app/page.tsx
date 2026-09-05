"use client";

import Link from "next/link";
import { useState } from "react";
import { PeaceSignPreview } from "@/components/PeaceSignPreview";
import { PreorderForm } from "@/components/PreorderForm";
import { InstallPrompt } from "@/components/InstallPrompt";
import { copy } from "@/content/copy";
import { DEFAULT_HEX } from "@/content/swatches";

export default function LandingPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="hero">
      <div className="hero__monument">
        <PeaceSignPreview hex={DEFAULT_HEX} monument />
      </div>
      <h1 className="hero__title">{copy.landing.h1}</h1>
      <p className="hero__sub">{copy.landing.sub}</p>
      <ul className="trust-chips">
        {copy.landing.trustChips.map((chip) => (
          <li key={chip}>{chip}</li>
        ))}
      </ul>
      <div className="preorder-card">
        <PreorderForm
          source="landing"
          onSuccess={() => setSubmitted(true)}
        />
      </div>
      <InstallPrompt show={submitted} />
      <div className="social-proof" aria-label={copy.landing.socialProof.label}>
        <div className="social-proof__avatars" aria-hidden>
          <span className="social-proof__dot" />
          <span className="social-proof__dot" />
          <span className="social-proof__dot" />
          <span className="social-proof__dot" />
        </div>
        <div className="social-proof__text">
          <strong>{copy.landing.socialProof.label}</strong>
          <span>{copy.landing.socialProof.detail}</span>
        </div>
      </div>
      <Link href="/configure" className="secondary-link">
        {copy.landing.secondaryCta}
      </Link>
      <p className="footer-micro">{copy.landing.footerMicro}</p>
    </div>
  );
}
