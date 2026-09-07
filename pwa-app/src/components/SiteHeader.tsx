import Link from "next/link";
import Image from "next/image";
import { copy } from "@/content/copy";

/**
 * Top bar: Logo A + BuyPeaceSign wordmark + Blog + optional Sign in (stub).
 */

export type SiteHeaderProps = {
  showSignIn?: boolean;
  className?: string;
};

export function SiteHeader({ showSignIn = true, className }: SiteHeaderProps) {
  return (
    <header className={`site-header${className ? ` ${className}` : ""}`}>
      <Link href="/" className="site-header__brand">
        <Image
          src="/brand/logo-a-neon-glow.png"
          alt=""
          width={40}
          height={40}
          priority
        />
        <span>{copy.brand.wordmark}</span>
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
