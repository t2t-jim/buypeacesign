"use client";

/**
 * Configure color / hex step.
 * Lifted from prep/stubs/ColorConfigurator.tsx — live-bound preview lives in parent.
 */

import { DEFAULT_SWATCHES, type Swatch } from "@/content/swatches";
import { copy } from "@/content/copy";

export type ColorConfiguratorProps = {
  hex: string;
  onChange: (hex: string) => void;
  swatches?: readonly Swatch[];
  onContinue?: () => void;
  onBack?: () => void;
  continueLabel?: string;
  backLabel?: string;
  className?: string;
};

export function ColorConfigurator({
  hex,
  onChange,
  swatches = DEFAULT_SWATCHES,
  onContinue,
  onBack,
  continueLabel = copy.configure.color.continueCta,
  backLabel = copy.configure.color.backCta,
  className,
}: ColorConfiguratorProps) {
  return (
    <div className={`color-config${className ? ` ${className}` : ""}`}>
      <h2>{copy.configure.color.h1}</h2>
      <p>{copy.configure.color.helper}</p>
      <label className="hex-row">
        {copy.configure.color.hexLabel}
        <input
          type="text"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          placeholder={copy.configure.color.hexPlaceholder}
          spellCheck={false}
          aria-label={copy.configure.color.hexLabel}
        />
      </label>
      <p className="glow-hint" style={{ marginTop: "0.75rem" }}>
        {copy.configure.color.swatchesLabel}
      </p>
      <div className="swatches" role="list" aria-label={copy.configure.color.swatchesLabel}>
        {swatches.map((s) => (
          <button
            key={s.id}
            type="button"
            className="swatch-btn"
            role="listitem"
            aria-label={s.name}
            aria-pressed={hex.toUpperCase() === s.hex.toUpperCase()}
            title={s.name}
            style={{ background: s.hex }}
            onClick={() => onChange(s.hex)}
          />
        ))}
      </div>
      <p className="glow-hint">Glowing in {hex}</p>
      <div className="color-actions">
        <button type="button" className="btn-ghost" onClick={onBack}>
          {backLabel}
        </button>
        <button type="button" className="btn-primary" onClick={onContinue}>
          {continueLabel}
        </button>
      </div>
    </div>
  );
}

export default ColorConfigurator;
