import type { NextConfig } from "next";
import path from "path";

// En dev, webpack HMR nécessite 'unsafe-eval' (source maps, Fast Refresh)
// En prod, on l'exclut pour une CSP stricte
const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  // Empêche le sniffing de Content-Type par le navigateur
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Empêche le chargement dans un iframe (protection clickjacking)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Active le prefetch DNS pour les performances
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Envoie uniquement l'origine (sans path) aux sites tiers
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Désactive les API sensibles non utilisées
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Force HTTPS pendant 1 an (inclus sous-domaines)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "./"),

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
