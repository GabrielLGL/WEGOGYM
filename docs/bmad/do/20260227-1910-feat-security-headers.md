# feat(web) — Security Headers HTTP
Date : 2026-02-27 19:10

## Instruction
`/do docs/bmad/prompts/20260227-1900-audit5-security-A.md`

## Rapport source
`docs/bmad/prompts/20260227-1900-audit5-security-A.md`

## Classification
Type : feat
Fichiers modifiés : `web/next.config.ts`

## Ce qui a été fait
Ajout de 5 security headers HTTP appliqués à toutes les routes via `async headers()` :

- `X-Content-Type-Options: nosniff` — empêche le navigateur de deviner le Content-Type
- `X-Frame-Options: SAMEORIGIN` — protection clickjacking (iframe bloqué depuis autres domaines)
- `X-DNS-Prefetch-Control: on` — active le prefetch DNS pour les performances réseau
- `Referrer-Policy: strict-origin-when-cross-origin` — limite les infos envoyées aux tiers
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` — désactive les API sensibles non utilisées

Note : `Content-Security-Policy` volontairement absent (scripts inline layout.tsx incompatibles).

## Vérification
- TypeScript : ✅ 0 erreur (`npx tsc --noEmit` depuis `web/`)
- Tests : n/a
- Nouveau test créé : non

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260227-1910

## Commit
`b07de81` feat(web): security headers HTTP dans next.config.ts
