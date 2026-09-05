"use client";

/**
 * Configure size step.
 * Lifted from prep/stubs/SizePicker.tsx — styled with teal/violet selected ring.
 */

import { copy } from "@/content/copy";

export type ProductSize = "36" | "48";

export type SizePickerProps = {
  value?: ProductSize;
  onChange: (size: ProductSize) => void;
  onContinue?: () => void;
  continueLabel?: string;
  className?: string;
};

export function SizePicker({
  value,
  onChange,
  onContinue,
  continueLabel = copy.configure.size.continueCta,
  className,
}: SizePickerProps) {
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
            aria-checked={value === opt.id}
            onClick={() => onChange(opt.id as ProductSize)}
          >
            <strong>{opt.label}</strong>
            <span>{opt.blurb}</span>
          </button>
        ))}
      </div>
      <div className="size-actions">
        <button
          type="button"
          className="btn-primary"
          disabled={!value}
          onClick={onContinue}
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}

export default SizePicker;
