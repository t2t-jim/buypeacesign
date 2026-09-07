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

/** Compact hero: at most two chips (configure link + one label). */
const HERO_CHIPS: ReadonlyArray<{ label: string; href?: string }> = [
  { label: '36", 48" & custom', href: "/configure" },
  { label: "Custom glow" },
];

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
      <section className="power-hero" aria-label="Live color preview">
        <div className="power-hero__copy">
          <h1 className="power-hero__title">{copy.landing.h1}</h1>
          <p className="power-hero__sub">
            Custom outdoor peace-sign lights for estates, gates, and pools.
          </p>
          {HERO_CHIPS.length > 0 ? (
            <ul className="trust-chips power-hero__chips">
              {HERO_CHIPS.map((chip) => (
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
          ) : null}
        </div>

        <div className="power-hero__stage">
          <PeaceSignPreview
            hex={liveHex}
            monument
            glowStyle="warmer"
            className="power-hero__preview"
          />
          <div className="power-hero__wheel">
            <ColorWheel hex={liveHex} onChange={setLiveHex} />
          </div>
        </div>

        <div
          className="power-hero__swatches"
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
                className={`power-hero__swatch${selected ? " is-selected" : ""}`}
                onClick={() => setLiveHex(swatch.hex)}
              >
                <span
                  className="power-hero__swatch-orb"
                  style={{
                    background: swatch.hex,
                    boxShadow: `0 0 18px ${swatch.hex}99`,
                  }}
                  aria-hidden
                />
                <span className="power-hero__swatch-name">{swatch.name}</span>
              </button>
            );
          })}
        </div>
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
