"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PeaceSignPreview } from "@/components/PeaceSignPreview";
import { ColorWheel } from "@/components/ColorWheel";
import { PreorderForm } from "@/components/PreorderForm";
import { InstallPrompt } from "@/components/InstallPrompt";
import { copy } from "@/content/copy";
import {
  LUXURY_DEFAULT_HEX,
  LUXURY_SWATCHES,
} from "@/content/swatches";

const LIFESTYLE_IMAGES = [
  { id: "garage", src: "/estate/garage.png", alt: "Peace sign light above a luxury garage" },
  { id: "pool", src: "/estate/pool.png", alt: "Peace sign light at a night poolside" },
  { id: "gate", src: "/estate/gate.png", alt: "Peace sign light on an estate gate" },
] as const;

/** Prefer jpg hero; png is a fallback once assets land in public/estate. */
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
          <div className="estate-hero__copy">
            <h1 className="estate-hero__title">{copy.landing.h1}</h1>
            <p className="estate-hero__sub">{copy.landing.sub}</p>
            <ul className="trust-chips estate-hero__chips">
              {copy.landing.trustChips.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
          </div>
          <div className="preorder-card estate-hero__card">
            <p className="estate-hero__card-eyebrow">Request early access</p>
            <PreorderForm
              source="landing"
              onSuccess={() => setSubmitted(true)}
            />
          </div>
        </div>
      </section>

      <InstallPrompt show={submitted} />

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

      <section className="live-color" aria-labelledby="live-color-heading">
        <p className="live-color__eyebrow">{copy.landing.liveColor.eyebrow}</p>
        <h2 id="live-color-heading" className="live-color__title">
          {copy.landing.liveColor.h2}
        </h2>
        <p className="live-color__sub">{copy.landing.liveColor.sub}</p>
        <div className="live-color__stage">
          <PeaceSignPreview hex={liveHex} className="live-color__preview" />
          <div className="live-color__wheel">
            <ColorWheel hex={liveHex} onChange={setLiveHex} />
          </div>
          <div
            className="live-color__swatches"
            role="listbox"
            aria-label="Signature glow colors"
          >
            {LUXURY_SWATCHES.map((swatch) => {
              const selected =
                liveHex.toUpperCase() === swatch.hex.toUpperCase();
              return (
                <button
                  key={swatch.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-pressed={selected}
                  className={`live-color__swatch${selected ? " is-selected" : ""}`}
                  onClick={() => setLiveHex(swatch.hex)}
                >
                  <span
                    className="live-color__swatch-orb"
                    style={{
                      background: swatch.hex,
                      boxShadow: `0 0 18px ${swatch.hex}99`,
                    }}
                    aria-hidden
                  />
                  <span className="live-color__swatch-name">{swatch.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="social-proof estate-landing__proof" aria-label={copy.landing.socialProof.label}>
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

      <Link href="/configure" className="secondary-link estate-landing__secondary">
        {copy.landing.secondaryCta}
      </Link>

      <p className="footer-micro estate-footer">{copy.landing.footerMicro}</p>
    </div>
  );
}
