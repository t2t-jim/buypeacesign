import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://buypeacesign.com"),
  title: {
    default: "BuyPeaceSign — Light that says peace",
    template: "%s · BuyPeaceSign",
  },
  description:
    "Custom outdoor peace-sign lights in 36\" and 48\". Pre-order early access — no charge today.",
  applicationName: "BuyPeaceSign",
  keywords: [
    "peace sign light",
    "outdoor peace sign",
    "custom LED peace sign",
    "BuyPeaceSign",
    "pre-order",
  ],
  authors: [{ name: "BuyPeaceSign" }],
  creator: "BuyPeaceSign",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://buypeacesign.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://buypeacesign.com",
    siteName: "BuyPeaceSign",
    title: "BuyPeaceSign — Light that says peace",
    description:
      "Custom outdoor peace-sign lights in 36\" and 48\". Pre-order early access — no charge today.",
    images: [
      {
        url: "/brand/logo-a-neon-glow.png",
        width: 512,
        height: 512,
        alt: "BuyPeaceSign neon peace sign logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "BuyPeaceSign — Light that says peace",
    description:
      "Custom outdoor peace-sign lights in 36\" and 48\". Pre-order early access — no charge today.",
    images: ["/brand/logo-a-neon-glow.png"],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BuyPeaceSign",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#07080F",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <div className="shell">
          <SiteHeader />
          <main className="main">{children}</main>
        </div>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
