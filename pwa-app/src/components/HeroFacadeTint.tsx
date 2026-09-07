"use client";

/**
 * Even facade recolor of the baked on-wall Logo A.
 * Dual blend (color + soft-light) + chroma boost so every slider stop
 * shifts the sign clearly — including warm near-whites.
 * No glyph, frame, plate, or second mark.
 */

export type HeroFacadeTintProps = {
  hex: string;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizeHex(input: string): string {
  let h = input.trim().replace(/^#/, "").toUpperCase();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9A-F]{6}$/.test(h)) return "#F6EBD1";
  return `#${h}`;
}

function hexToRgb(hex: string) {
  const n = normalizeHex(hex).slice(1);
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) =>
    Math.round(clamp(v, 0, 255))
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${to(r)}${to(g)}${to(b)}`;
}

function rgbToHsv(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  } else {
    h = 40; // warm default for near-neutrals
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function hsvToRgb(h: number, s: number, v: number) {
  const hh = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = v - c;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hh < 60) {
    rp = c;
    gp = x;
  } else if (hh < 120) {
    rp = x;
    gp = c;
  } else if (hh < 180) {
    gp = c;
    bp = x;
  } else if (hh < 240) {
    gp = x;
    bp = c;
  } else if (hh < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  return {
    r: (rp + m) * 255,
    g: (gp + m) * 255,
    b: (bp + m) * 255,
  };
}

/** Boost chroma so pale slider stops still recolor the bright facade mark. */
function boostForTint(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, v } = rgbToHsv(r, g, b);
  const s2 = clamp(Math.max(s * 1.65, 0.42), 0, 0.92);
  const v2 = clamp(Math.max(v, 0.72), 0, 1);
  const out = hsvToRgb(h, s2, v2);
  return rgbToHex(out.r, out.g, out.b);
}

export function HeroFacadeTint({ hex, className }: HeroFacadeTintProps) {
  const glow = normalizeHex(hex || "#F6EBD1");
  const tint = boostForTint(glow);
  const base = ["estate-hero__facade-tint", className ?? ""].filter(Boolean).join(" ");
  return (
    <>
      <span
        className={`${base} estate-hero__facade-tint--color`}
        style={{ background: tint }}
        aria-hidden
        data-facade-tint={glow}
      />
      <span
        className={`${base} estate-hero__facade-tint--glow`}
        style={{ background: tint }}
        aria-hidden
      />
    </>
  );
}

export default HeroFacadeTint;
