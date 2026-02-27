# fix(web) — Logo aria-hidden + nav aria-label + href logo
Date : 2026-02-27 20:10

## Instruction
`/do docs/bmad/prompts/20260227-2000-audit6-logo-nav-A.md`

## Rapport source
`docs/bmad/prompts/20260227-2000-audit6-logo-nav-A.md`

## Classification
Type : fix
Fichiers modifiés : `web/src/components/KoreLogo.tsx`, `web/src/components/sections/HeroSection.tsx`

## Ce qui a été fait
1. `KoreLogo.tsx` — supprimé `role="img"` et `aria-label="Logo Kore"`, remplacé par `aria-hidden="true"`. Le logo est toujours décoratif (texte "KORE" visible dans tous les contextes d'utilisation).
2. `HeroSection.tsx` — ajouté `aria-label="Navigation principale"` sur la `<nav>` sticky.
3. `HeroSection.tsx` — corrigé `href="#"` → `href="/"` sur le lien logo de la nav.

## Vérification
- TypeScript : ✅ 0 erreur (`npx tsc --noEmit` depuis `web/`)
- Tests : n/a (attributs HTML purs)
- Nouveau test créé : non

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260227-2010

## Commit
`d4a33ab` fix(web): logo aria-hidden, nav aria-label, href logo fix (WCAG)
