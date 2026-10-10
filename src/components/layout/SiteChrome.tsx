import Link from "next/link";
import { evaluations } from "@/content/evaluations";
import { Footer } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TopicPickerProvider } from "@/components/topic/TopicPicker";
import { mainNav } from "@/lib/nav";
import { prelaunchCopy } from "@/lib/prelaunch-copy";
import { isPrelaunch } from "@/lib/site";

/** Announcement bar, sticky header, topic picker and footer around site pages. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  // Every condition with a questionnaire is selectable (CLAUDE.md 7c.B).
  const topics = evaluations.map((e) => ({
    slug: e.topic,
    name: e.name,
    teaser: e.label,
    href: "/evaluare",
  }));
  return (
    <TopicPickerProvider topics={topics}>
      <div className="bg-navy-950 text-white">
        <p className="container-page flex min-h-9 items-center justify-center py-1.5 text-center text-xs leading-5 text-white/85">
          {isPrelaunch() ? (
            <span>
              {prelaunchCopy.announcement}{" "}
              <Link
                href="/evaluare"
                className="font-semibold whitespace-nowrap text-white underline underline-offset-2"
              >
                {prelaunchCopy.announcementLink}
              </Link>
            </span>
          ) : (
            <span>
              Evaluare online cu un medic din România, discret, de pe telefon.{" "}
              <Link
                href="/cum-functioneaza"
                className="font-semibold whitespace-nowrap text-white underline underline-offset-2"
              >
                Cum funcționează
              </Link>
            </span>
          )}
        </p>
      </div>
      <SiteHeader groups={mainNav()} />
      <main id="continut" className="flex-1">
        {children}
      </main>
      <Footer />
    </TopicPickerProvider>
  );
}
