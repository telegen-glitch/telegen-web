import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { JsonLd } from "@/components/ui/JsonLd";
import { AnalyticsGate } from "@/lib/analytics";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { isSiteIndexable, siteConfig } from "@/lib/site";
import "./globals.css";

// Licensed under the SIL Open Font License; latin-ext covers ă â î ș ț (comma-below).
const sans = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin", "latin-ext"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Telegen — dermatologie online", template: "%s | Telegen" },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: { siteName: siteConfig.name, locale: siteConfig.locale, type: "website" },
  robots: isSiteIndexable() ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" className={`${sans.variable} ${serif.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#continut"
          className="sr-only z-50 rounded-pill bg-navy-950 px-5 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Sari la conținut
        </a>
        <ConsentProvider>
          <Header />
          <main id="continut" className="flex-1">
            {children}
          </main>
          <Footer />
          <AnalyticsGate />
        </ConsentProvider>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </body>
    </html>
  );
}
