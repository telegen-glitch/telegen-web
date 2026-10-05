import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { JsonLd } from "@/components/ui/JsonLd";
import { AnalyticsGate } from "@/lib/analytics";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { isSiteIndexable, siteConfig } from "@/lib/site";
import "./globals.css";

// SIL Open Font License; latin-ext covers ă â î ș ț (comma-below).
const sans = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-instrument-sans",
  display: "swap",
});

// Used only for the italic accent phrase in headings.
const serif = Newsreader({
  subsets: ["latin", "latin-ext"],
  variable: "--font-newsreader",
  style: ["italic"],
  weight: ["400"],
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
    <html lang="ro" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables reveal-on-scroll styles only when JS runs, so content is never hidden without it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#continut"
          className="sr-only z-50 rounded-pill bg-navy-950 px-5 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Sari la conținut
        </a>
        <ConsentProvider>
          {children}
          <AnalyticsGate />
        </ConsentProvider>
        <RevealObserver />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </body>
    </html>
  );
}
