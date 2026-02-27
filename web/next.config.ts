import type { NextConfig } from "next";
import path from "path";

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
