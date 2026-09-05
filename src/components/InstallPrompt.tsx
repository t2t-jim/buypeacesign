"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { copy } from "@/content/copy";

/**
 * Soft install tip — shown after successful pre-order when not already standalone.
 */
export function InstallPrompt({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS
      ("standalone" in navigator &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (!standalone) setVisible(true);
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className="preorder-card"
      style={{ marginTop: "1rem" }}
      role="complementary"
      aria-label={copy.install.softPromptTitle}
    >
      <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.1rem" }}>
        {copy.install.softPromptTitle}
      </h2>
      <p style={{ margin: "0 0 0.75rem", color: "var(--text-muted)", fontSize: "0.92rem" }}>
        {copy.install.softPromptBody}
      </p>
      <div className="stack" style={{ marginTop: 0 }}>
        <Link href="/install" className="btn-primary" style={{ textAlign: "center" }}>
          {copy.install.softPromptCta}
        </Link>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setVisible(false)}
        >
          {copy.install.dismiss}
        </button>
      </div>
    </div>
  );
}

export default InstallPrompt;
