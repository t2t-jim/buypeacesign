import Link from "next/link";
import { copy } from "@/content/copy";

/**
 * Top bar: clean circular Logo A + premium wordmark + Blog + optional Sign in.
 * Bright-luxury Estate Glow — no neon plate, no tails.
 */

export type SiteHeaderProps = {
  showSignIn?: boolean;
  className?: string;
};

function LogoAMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      width={32}
      height={32}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="32"
        cy="32"
        r="21.5"
        stroke="currentColor"
        strokeWidth="3.75"
        strokeLinecap="round"
      />
      <path
        d="M32 11V53M32 32L18.2 49.2M32 32L45.8 49.2"
        stroke="currentColor"
        strokeWidth="3.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SiteHeader({ showSignIn = true, className }: SiteHeaderProps) {
  return (
    <header className={`site-header${className ? ` ${className}` : ""}`}>
      <Link href="/" className="site-header__brand">
        <span className="site-header__mark" aria-hidden>
          <LogoAMark className="site-header__mark-svg" />
        </span>
        <span className="site-header__wordmark">
          <span className="site-header__wordmark-buy">Buy</span>
          <span className="site-header__wordmark-peace">PeaceSign</span>
        </span>
        <span className="sr-only">{copy.brand.wordmark}</span>
      </Link>
      <nav className="site-header__nav" aria-label="Primary">
        <Link href="/blog" className="site-header__link">
          {copy.brand.navBlog}
        </Link>
        {showSignIn ? (
          <Link href="/account" className="site-header__signin">
            {copy.brand.navSignIn}
          </Link>
        ) : null}
      </nav>
    </header>
  );
}

export default SiteHeader;
