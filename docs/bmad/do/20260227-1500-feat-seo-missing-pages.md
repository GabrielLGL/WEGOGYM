# FEAT(web) — Fichiers SEO manquants : not-found.tsx
Date : 2026-02-27 15:00

## Instruction
`/do docs/bmad/prompts/20260227-1500-site-audit-2-A.md`

## Rapport source
`docs/bmad/prompts/20260227-1500-site-audit-2-A.md`

## Classification
Type : feat
Fichiers modifiés : `web/src/app/not-found.tsx` (créé)

## Ce qui a été fait
Audit préalable révèle que 3 des 4 fichiers prévus existaient déjà dans le dépôt :
- `web/src/app/robots.ts` ✅ déjà présent — avec `disallow: "/api/"` (mieux que prévu)
- `web/src/app/sitemap.ts` ✅ déjà présent — home + privacy, correct
- `web/src/app/privacy/page.tsx` ✅ déjà présent — RGPD complet en 9 sections

Seul `not-found.tsx` était absent. Créé avec :
- Server Component pur (pas de "use client")
- Design neumorphique cohérent (CSS vars, `.shadow-neu-out`, `.gradient-text`, `.btn-liquid`)
- Import `KoreLogo` depuis `@/components/KoreLogo`
- H1 "Page introuvable" + chiffre "404" en gradient
- Description explicite
- Lien retour vers `/` avec style `.btn-liquid`
- Structure `<main>` centré verticalement

## Vérification
- TypeScript : ✅ 0 erreur (`npx tsc --noEmit`)
- Tests : non applicable (pas de logique testable)
- Nouveau test créé : non

## Documentation mise à jour
Aucune (composant simple)

## Statut
✅ Résolu — 20260227-1500

## Commit
`64f6e28` feat(web): add branded 404 page (not-found.tsx)
