# fix(web) — SEO & Métadonnées
Date : 2026-02-27 17:10

## Instruction
`/do docs/bmad/prompts/20260227-1700-audit3-seo-A.md`

## Rapport source
`docs/bmad/prompts/20260227-1700-audit3-seo-A.md`

## Classification
Type : fix
Fichiers modifiés : `web/src/app/layout.tsx`, `web/src/app/sitemap.ts`

## Ce qui a été fait

### layout.tsx
1. **theme-color** : remplacé `other: { "theme-color": "#6c5ce7" }` par `themeColor: [{ media: "(prefers-color-scheme: light)", color: "#6c5ce7" }, { media: "(prefers-color-scheme: dark)", color: "#00cec9" }]` — utilise l'API officielle Next.js 14+, avec couleur adaptative dark/light.
2. **hreflang** : ajout dans `alternates.languages` → `{ fr: "https://kore-app.com", "x-default": "https://kore-app.com" }` — Google cible explicitement le marché FR.
3. **JSON-LD enrichi** : ajout de `inLanguage: "fr-FR"`, `softwareVersion: "1.0"`, `datePublished: "2026-01-01"`, `featureList` (6 features) — meilleur potentiel de rich snippets.

### sitemap.ts
4. **lastModified statique** : remplacé `new Date()` (changeait à chaque build) par `new Date("2026-02-27")` pour la home et `new Date("2026-01-01")` pour /privacy — signal lastModified fiable pour Google.

## Vérification
- TypeScript : ✅ 0 erreur (`npx tsc --noEmit` depuis `web/`)
- Tests : n/a (fichiers de config Next.js, pas de logique testable)
- Nouveau test créé : non

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260227-1710

## Commit
`33392d6` fix(web): SEO metadata — themeColor API, hreflang, JSON-LD enrichi, sitemap dates statiques
