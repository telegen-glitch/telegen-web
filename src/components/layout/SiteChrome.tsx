import Link from "next/link";
import { content } from "@/content/source";
import { Footer } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TopicPickerProvider } from "@/components/topic/TopicPicker";
import { mainNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";

/** Announcement bar, sticky header, topic picker and footer around site pages. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const topics = content.listConditions().map((c) => ({
    slug: c.slug,
    name: c.name,
    teaser: "Evaluare dermatologică online",
    href: "/evaluare",
  }));
  return (
    <TopicPickerProvider topics={topics} upcoming={content.listUpcomingTopics()}>
      {siteConfig.launchState === "prelaunch" && (
        <div className="bg-navy-950 text-white">
          <p className="container-page flex min-h-9 items-center justify-center py-1.5 text-center text-xs leading-5 text-white/85">
            <span>
              Telegen este în pre-lansare: serviciul medical se deschide în curând.{" "}
              <Link
                href="/evaluare"
                className="font-semibold whitespace-nowrap text-white underline underline-offset-2"
              >
                Anunță-mă
              </Link>
            </span>
          </p>
        </div>
      )}
      <SiteHeader groups={mainNav()} />
      <main id="continut" className="flex-1">
        {children}
      </main>
      <Footer />
    </TopicPickerProvider>
  );
}
