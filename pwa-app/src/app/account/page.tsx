import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: "Account",
  description: "Account sign-in stub — coming soon.",
};

export default function AccountPage() {
  return (
    <div>
      <span className="stub-badge">{copy.account.stubBadge}</span>
      <h1 className="page-title">{copy.account.h1}</h1>
      <p className="page-body">{copy.account.stubBody}</p>
      <div className="stack">
        <button type="button" className="btn-primary" disabled>
          {copy.account.signInCta}
        </button>
        <button type="button" className="btn-ghost" disabled>
          {copy.account.createCta}
        </button>
        <p className="page-body">{copy.account.savedDesignsEmpty}</p>
        <Link href="/">{copy.account.backHome}</Link>
      </div>
    </div>
  );
}
