"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type ColorSliderProps = {
  hex: string;
  onChange: (hex: string) => void;
  className?: string;
  /** Show a tiny hex readout under the track (default true). */
  showHex?: boolean;
  /** Visible "Glow color" label. When false, label stays sr-only for a11y (default true). */
  showLabel?: boolean;
};

const HUE_S = 0.88;
const HUE_V = 1;

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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
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

function rgbToHue(r: number, g: number, b: number): number {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  if (d === 0) return 40; // warm default for near-whites
  let h = 0;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return h;
}

function hueToHex(h: number): string {
  const hh = ((h % 360) + 360) % 360;
  const s = HUE_S;
  const v = HUE_V;
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
  return rgbToHex((rp + m) * 255, (gp + m) * 255, (bp + m) * 255);
}

function hexToHue(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHue(r, g, b);
}

const HUE_GRADIENT =
  "linear-gradient(90deg, #FF0000 0%, #FFFF00 17%, #00FF00 33%, #00FFFF 50%, #0000FF 67%, #FF00FF 83%, #FF0000 100%)";

export function ColorSlider({
  hex,
  onChange,
  className,
  showHex = true,
  showLabel = true,
}: ColorSliderProps) {
  const reactId = useId();
  const labelId = `${reactId}-label`;
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const displayHex = useMemo(() => normalizeHex(hex), [hex]);
  const [hue, setHue] = useState(() => hexToHue(hex));

  useEffect(() => {
    setHue(hexToHue(displayHex));
  }, [displayHex]);

  const emitHue = useCallback(
    (nextHue: number) => {
      const h = clamp(nextHue, 0, 359.999);
      setHue(h);
      onChange(hueToHex(h));
    },
    [onChange],
  );

  const pickFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const t = clamp((clientX - rect.left) / Math.max(rect.width, 1), 0, 1);
      emitHue(t * 360);
    },
    [emitHue],
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault();
      draggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      pickFromClientX(e.clientX);
    },
    [pickFromClientX],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      pickFromClientX(e.clientX);
    },
    [pickFromClientX],
  );

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 12 : 2;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        emitHue(hue - step);
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        emitHue(hue + step);
      } else if (e.key === "Home") {
        e.preventDefault();
        emitHue(0);
      } else if (e.key === "End") {
        e.preventDefault();
        emitHue(359);
      }
    },
    [emitHue, hue],
  );

  const pct = (hue / 360) * 100;
  const thumbColor = hueToHex(hue);
  const classes = [
    "color-slider",
    !showLabel && !showHex ? "color-slider--minimal" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {showLabel ? (
        <p id={labelId} className="color-slider__label">
          Glow color
        </p>
      ) : (
        <span id={labelId} className="sr-only">
          Glow color
        </span>
      )}
      <div
        ref={trackRef}
        className="color-slider__hit"
        role="slider"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(hue)}
        aria-valuetext={`Hue ${Math.round(hue)} degrees, ${displayHex}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div
          className="color-slider__track"
          style={{ background: HUE_GRADIENT }}
          aria-hidden
        />
        <div
          className="color-slider__thumb"
          style={{
            left: `${pct}%`,
            background: thumbColor,
            boxShadow: `0 0 0 2px rgba(255,252,248,0.95), 0 0 14px ${thumbColor}aa`,
          }}
          aria-hidden
        />
      </div>
      {showHex ? (
        <p className="color-slider__hex" aria-live="polite">
          {displayHex}
        </p>
      ) : null}
    </div>
  );
}

export default ColorSlider;
