"use client";

/**
 * Configure size step — presets (36"/48") plus any custom diameter (12–96").
 */

import { useEffect, useId, useRef, useState } from "react";
import { copy } from "@/content/copy";
import {
  CUSTOM_SIZE_MAX_INCHES,
  CUSTOM_SIZE_MIN_INCHES,
  parseCustomSizeInches,
} from "@/lib/waitlist";

export type ProductSizePreset = "36" | "48";

/** Valid selection passed to parent / configure flow. */
export type SizeSelection =
  | { sizeInterest: ProductSizePreset }
  | { sizeInterest: "custom"; customSizeInches: number };

export type SizePickerProps = {
  value?: SizeSelection;
  onChange: (size: SizeSelection | undefined) => void;
  onContinue?: () => void;
  continueLabel?: string;
  className?: string;
};

type Mode = ProductSizePreset | "custom" | undefined;

function selectionToMode(value?: SizeSelection): Mode {
  if (!value) return undefined;
  return value.sizeInterest;
}

export function SizePicker({
  value,
  onChange,
  onContinue,
  continueLabel = copy.configure.size.continueCta,
  className,
}: SizePickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>(() => selectionToMode(value));
  const [customRaw, setCustomRaw] = useState(() =>
    value?.sizeInterest === "custom" ? String(value.customSizeInches) : "",
  );
  const [customError, setCustomError] = useState<string | null>(null);
  const [customTouched, setCustomTouched] = useState(false);

  // Sync when parent preselects a valid size (e.g. /configure?size=36).
  // Do not clear local custom mode when onChange(undefined) during typing.
  useEffect(() => {
    if (!value) return;
    setMode(selectionToMode(value));
    if (value.sizeInterest === "custom") {
      setCustomRaw(String(value.customSizeInches));
      setCustomError(null);
    }
  }, [value]);

  function emitPreset(preset: ProductSizePreset) {
    setMode(preset);
    setCustomError(null);
    setCustomTouched(false);
    onChange({ sizeInterest: preset });
  }

  function focusCustom() {
    setMode("custom");
    // Defer focus until input is visible / selected styling applied.
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function applyCustomRaw(raw: string, markTouched = false) {
    setCustomRaw(raw);
    if (markTouched) setCustomTouched(true);
    const trimmed = raw.trim();
    if (trimmed === "") {
      setCustomError(
        customTouched || markTouched ? copy.configure.size.customError : null,
      );
      onChange(undefined);
      return;
    }
    const inches = parseCustomSizeInches(trimmed);
    if (inches === undefined) {
      setCustomError(copy.configure.size.customError);
      onChange(undefined);
      return;
    }
    setCustomError(null);
    onChange({ sizeInterest: "custom", customSizeInches: inches });
  }

  function selectCustom() {
    focusCustom();
    applyCustomRaw(customRaw, false);
  }

  const hasValidSelection = Boolean(value);
  const showCustomError =
    mode === "custom" && Boolean(customError) && (customTouched || customRaw.trim() !== "");

  return (
    <div
      className={`size-picker${className ? ` ${className}` : ""}`}
      role="group"
      aria-labelledby="size-picker-h"
    >
      <h2 id="size-picker-h">{copy.configure.size.h1}</h2>
      <p>{copy.configure.size.helper}</p>
      <div className="size-options" role="radiogroup" aria-label="Size">
        {copy.configure.size.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="size-option"
            role="radio"
            aria-checked={mode === opt.id}
            onClick={() => emitPreset(opt.id as ProductSizePreset)}
          >
            <strong>{opt.label}</strong>
            <span>{opt.blurb}</span>
          </button>
        ))}
        <button
          type="button"
          className="size-option"
          role="radio"
          aria-checked={mode === "custom"}
          onClick={selectCustom}
        >
          <strong>{copy.configure.size.customOption.label}</strong>
          <span>{copy.configure.size.customOption.blurb}</span>
        </button>
      </div>

      {mode === "custom" ? (
        <div className="size-custom">
          <label htmlFor={inputId} className="size-custom__label">
            {copy.configure.size.customInputLabel}
          </label>
          <div className="size-custom__row">
            <input
              ref={inputRef}
              id={inputId}
              className="size-custom__input"
              type="number"
              inputMode="decimal"
              min={CUSTOM_SIZE_MIN_INCHES}
              max={CUSTOM_SIZE_MAX_INCHES}
              step="1"
              value={customRaw}
              placeholder={copy.configure.size.customInputPlaceholder}
              aria-invalid={showCustomError}
              aria-describedby={showCustomError ? `${inputId}-err` : undefined}
              onChange={(ev) => applyCustomRaw(ev.target.value)}
              onBlur={() => applyCustomRaw(customRaw, true)}
            />
            <span className="size-custom__unit" aria-hidden>
              &quot;
            </span>
          </div>
          {showCustomError ? (
            <p id={`${inputId}-err`} className="form-error size-custom__error" role="alert">
              {customError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="size-actions">
        <button
          type="button"
          className="btn-primary"
          disabled={!hasValidSelection}
          onClick={onContinue}
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}

/** @deprecated Prefer SizeSelection — kept for older import sites */
export type ProductSize = ProductSizePreset;

export default SizePicker;
