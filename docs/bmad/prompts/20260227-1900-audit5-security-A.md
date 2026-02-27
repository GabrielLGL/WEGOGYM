<!-- v1.0 — 2026-02-27 -->
# Rapport — Audit 5 Site Kore — Groupe A : Security Headers — 20260227-1900

## Objectif
Ajouter les headers HTTP de sécurité dans `next.config.ts` via la fonction `headers()`.
Ces headers protègent contre le clickjacking, le sniffing de contenu et limitent les permissions navigateur.
Ils améliorent aussi le score de sécurité Lighthouse et la réputation SEO.

## Fichiers concernés
- `web/next.config.ts`

## Contexte technique
- Next.js App Router — `next.config.ts` est le fichier de configuration Next.js
- La fonction `async headers()` retourne un tableau de règles `{ source, headers }`
- Source `"/(.*)"` applique les headers à toutes les routes
- **IMPORTANT** : ne pas ajouter `Content-Security-Policy` strict car il entrerait en conflit avec les scripts inline de `layout.tsx` (theme init + JSON-LD). Uniquement les headers sûrs listés ci-dessous.
- `npx tsc --noEmit` (depuis `web/`) doit rester à 0 erreur

## Étapes

1. Lire le fichier actuel `web/next.config.ts`
2. Ajouter la constante `securityHeaders` avant `nextConfig`
3. Ajouter la méthode `async headers()` dans `nextConfig`

## Code exact à implémenter

```ts
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
```

## Contraintes
- Ne pas toucher à `outputFileTracingRoot` (déjà présent, laisser intact)
- Ne pas ajouter Content-Security-Policy (incompatible avec les scripts inline de layout.tsx)
- Pas de `any` TypeScript

## Critères de validation
- `npx tsc --noEmit` (depuis `web/`) → 0 erreur
- `npm run build` (depuis `web/`) → build réussi (optionnel)
- Après déploiement : `curl -I https://kore-app.com` → headers présents dans la réponse

## Dépendances
Aucune dépendance — peut tourner en parallèle avec Groupes B et C.

## Statut
⏳ En attente
