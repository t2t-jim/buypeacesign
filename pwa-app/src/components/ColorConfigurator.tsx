"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_SWATCHES, type Swatch } from "@/content/swatches";
import { copy } from "@/content/copy";
import {
  isValidHexColor,
  normalizeHex,
  sanitizeHexInput,
} from "@/lib/waitlist";

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
  const [draft, setDraft] = useState(() => sanitizeHexInput(hex || "#"));
  const validHex = useMemo(() => normalizeHex(draft), [draft]);
  const showError =
    draft.replace("#", "").length > 0 && validHex === undefined;

  useEffect(() => {
    const normalized = normalizeHex(hex);
    if (normalized) setDraft(normalized);
  }, [hex]);

  function handleDraftChange(raw: string) {
    const next = sanitizeHexInput(raw);
    setDraft(next);
    const normalized = normalizeHex(next);
    if (normalized) onChange(normalized);
  }

  function pickSwatch(swatchHex: string) {
    const normalized = normalizeHex(swatchHex) ?? swatchHex;
    setDraft(normalized);
    onChange(normalized);
  }

  return (
    <div className={`color-config${className ? ` ${className}` : ""}`}>
      <h2>{copy.configure.color.h1}</h2>
      <p>{copy.configure.color.helper}</p>
      <label className="hex-row">
        {copy.configure.color.hexLabel}
        <input
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoCorrect="off"
          value={draft}
          onChange={(e) => handleDraftChange(e.target.value)}
          placeholder={copy.configure.color.hexPlaceholder}
          spellCheck={false}
          maxLength={7}
          aria-invalid={showError}
          aria-describedby={showError ? "hex-error" : undefined}
          aria-label={copy.configure.color.hexLabel}
        />
      </label>
      {showError ? (
        <p id="hex-error" className="form-error" role="alert">
          Enter a valid hex color like #F6EBD1 or #FE0.
        </p>
      ) : null}
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
            aria-pressed={
              (validHex ?? hex).toUpperCase() === s.hex.toUpperCase()
            }
            title={s.name}
            style={{ background: s.hex }}
            onClick={() => pickSwatch(s.hex)}
          />
        ))}
      </div>
      <p className="glow-hint">
        {validHex
          ? `Glowing in ${validHex}`
          : "Enter a valid hex to update the glow"}
      </p>
      <div className="color-actions">
        <button type="button" className="btn-ghost" onClick={onBack}>
          {backLabel}
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={onContinue}
          disabled={!isValidHexColor(draft) && !isValidHexColor(hex)}
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}

export default ColorConfigurator;
