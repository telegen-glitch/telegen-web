import type { NextConfig } from "next";

const indexable = process.env.SITE_INDEXING === "on" && process.env.VERCEL_ENV === "production";
const isDev = process.env.NODE_ENV !== "production";
const isPreview = process.env.VERCEL_ENV === "preview";

/**
 * Content-Security-Policy (§v4.E4). The site is statically generated, so nonces
 * are not available: inline scripts (Next.js hydration payload, the tiny
 * "js" class script) need 'unsafe-inline'; no third-party script origin is
 * allowed. Fonts are self-hosted by next/font; JSON-LD is a data block and is
 * not executed. Vercel's preview toolbar is allowed on previews only.
 */
const vercelLive = isPreview ? " https://vercel.live" : "";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${vercelLive}`,
  `style-src 'self' 'unsafe-inline'${vercelLive}`,
  `img-src 'self' data: blob:${isPreview ? " https://vercel.live https://vercel.com" : ""}`,
  `font-src 'self'${isPreview ? " https://vercel.live https://assets.vercel.com" : ""}`,
  `connect-src 'self'${isDev ? " ws:" : ""}${isPreview ? " https://vercel.live wss://ws-us3.pusher.com" : ""}`,
  `frame-src ${isPreview ? "https://vercel.live" : "'none'"}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
      { key: "Content-Security-Policy", value: csp },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
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
