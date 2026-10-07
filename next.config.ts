import type { NextConfig } from "next";

const indexable = process.env.SITE_INDEXING === "on" && process.env.VERCEL_ENV === "production";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
    ];
    // Belt and braces: non-production and pre-launch responses carry noindex as a header too.
    const robots = indexable ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [{ source: "/:path*", headers: [...security, ...robots] }];
  },
  async redirects() {
    return [
      { source: "/afectiuni/caderea-parului", destination: "/caderea-parului", permanent: true },
      { source: "/alopecie", destination: "/caderea-parului", permanent: true },
      { source: "/alopecie-androgenetica", destination: "/caderea-parului", permanent: true },
      { source: "/conditii", destination: "/afectiuni", permanent: true },
      { source: "/evaluare-online", destination: "/evaluare", permanent: true },
      { source: "/despre", destination: "/standarde-clinice", permanent: true },
      { source: "/despre-noi", destination: "/standarde-clinice", permanent: true },
      { source: "/echipa", destination: "/echipa-medicala", permanent: true },
      { source: "/confidentialitate", destination: "/politica-de-confidentialitate", permanent: true },
      { source: "/cookies", destination: "/politica-cookie", permanent: true },
      { source: "/termeni", destination: "/termeni-si-conditii", permanent: true },
    ];
  },
};

export default nextConfig;
