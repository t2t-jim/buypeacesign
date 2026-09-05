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
      <div className="hero__preview">
        <PeaceSignPreview hex={DEFAULT_HEX} />
      </div>
      <h1>{copy.landing.h1}</h1>
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
      <Link href="/configure" className="secondary-link">
        {copy.landing.secondaryCta}
      </Link>
      <p className="footer-micro">{copy.landing.footerMicro}</p>
    </div>
  );
}
