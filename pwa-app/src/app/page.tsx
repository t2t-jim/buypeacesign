"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PeaceSignPreview } from "@/components/PeaceSignPreview";
import { ColorSlider } from "@/components/ColorSlider";
import { PreorderForm } from "@/components/PreorderForm";
import { InstallPrompt } from "@/components/InstallPrompt";
import { copy } from "@/content/copy";
import { LUXURY_DEFAULT_HEX } from "@/content/swatches";

const LIFESTYLE_IMAGES = [
  { id: "garage", src: "/estate/garage.png", alt: "Peace sign light above a luxury garage" },
  { id: "pool", src: "/estate/pool.png", alt: "Peace sign light at a night poolside" },
  { id: "gate", src: "/estate/gate.png", alt: "Peace sign light on an estate gate" },
] as const;

const HERO_SRC = "/estate/hero-entrance.png";

export default function LandingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [liveHex, setLiveHex] = useState(LUXURY_DEFAULT_HEX);

  const lifestyle = useMemo(() => {
    return copy.landing.lifestyle.items.map((item) => {
      const img = LIFESTYLE_IMAGES.find((i) => i.id === item.id);
      return { ...item, src: img?.src ?? "", alt: img?.alt ?? item.label };
    });
  }, []);

  return (
    <div className="estate-landing">
      <section className="estate-hero" aria-label="Estate entrance">
        <div className="estate-hero__media" aria-hidden>
          <Image
            src={HERO_SRC}
            alt=""
            fill
            priority
            className="estate-hero__img"
            sizes="100vw"
          />
          <div className="estate-hero__veil" />
        </div>
        <div className="estate-hero__content">
          <PeaceSignPreview
            hex={liveHex}
            monument
            glowStyle="warmer"
            className="estate-hero__preview"
          />
          <div className="estate-hero__slider">
            <ColorSlider hex={liveHex} onChange={setLiveHex} />
          </div>
        </div>
      </section>

      <section className="estate-intro" aria-labelledby="estate-intro-heading">
        <h1 id="estate-intro-heading" className="estate-intro__title">
          {copy.landing.h1}
        </h1>
        <p className="estate-intro__sub">{copy.landing.sub}</p>
        <ul className="trust-chips estate-intro__chips">
          {copy.landing.trustChips.map((chip) => (
            <li key={chip.label}>
              {"href" in chip && chip.href ? (
                <Link href={chip.href} className="trust-chips__link">
                  {chip.label}
                </Link>
              ) : (
                chip.label
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="lifestyle-strip" aria-labelledby="lifestyle-heading">
        <h2 id="lifestyle-heading" className="lifestyle-strip__title">
          {copy.landing.lifestyle.title}
        </h2>
        <div className="lifestyle-strip__grid">
          {lifestyle.map((item) => (
            <figure key={item.id} className="lifestyle-card">
              <div className="lifestyle-card__media">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={640}
                  height={480}
                  className="lifestyle-card__img"
                />
              </div>
              <figcaption className="lifestyle-card__caption">
                <span className="lifestyle-card__label">{item.label}</span>
                <span className="lifestyle-card__sub">{item.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section
        className="preorder-section"
        aria-label={copy.landing.preorderCard.title}
      >
        <div className="preorder-card preorder-section__card">
          <p className="preorder-section__eyebrow">Request early access</p>
          <PreorderForm
            source="landing"
            onSuccess={() => setSubmitted(true)}
          />
        </div>
      </section>

      <InstallPrompt show={submitted} />

      <footer className="landing-footer">
        <Link href="/configure" className="secondary-link landing-footer__secondary">
          {copy.landing.secondaryCta}
        </Link>
        <p className="footer-micro landing-footer__micro">
          {copy.landing.footerMicro}
        </p>
      </footer>
    </div>
  );
}
