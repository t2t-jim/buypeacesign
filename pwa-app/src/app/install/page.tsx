import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: "Install",
  description: "Add BuyPeaceSign to your home screen.",
};

export default function InstallPage() {
  return (
    <div>
      <h1 className="page-title">{copy.install.h1}</h1>
      <p className="page-body">{copy.install.body}</p>
      <ol className="install-steps">
        <li>{copy.install.howToIos}</li>
        <li>{copy.install.howToAndroid}</li>
      </ol>
      <Link href="/" className="btn-ghost" style={{ display: "inline-block" }}>
        {copy.install.dismiss}
      </Link>
    </div>
  );
}
