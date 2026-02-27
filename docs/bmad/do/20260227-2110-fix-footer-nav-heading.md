# fix(web) — Footer — nav sémantique + h2 sr-only
Date : 2026-02-27 21:10

## Instruction
`/do docs/bmad/prompts/20260227-2100-audit7-footer-A.md`

## Rapport source
`docs/bmad/prompts/20260227-2100-audit7-footer-A.md`

## Classification
Type : fix
Fichiers modifiés : `web/src/components/sections/FooterSection.tsx`

## Ce qui a été fait
1. `<div className="flex justify-center gap-6 mb-6 flex-wrap">` → `<nav aria-label="Navigation pied de page" className="...">` — les 4 liens du footer sont maintenant dans une zone de navigation nommée, identifiable par les lecteurs d'écran.
2. `<h2 className="sr-only">Kore</h2>` ajouté avant le bloc logo — invisible visuellement, annoncé aux lecteurs d'écran comme titre de section footer.

## Vérification
- TypeScript : ✅ 0 erreur (`npx tsc --noEmit` depuis `web/`)
- Tests : n/a (attributs HTML purs)
- Nouveau test créé : non

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260227-2110

## Commit
`800bef3` fix(web): footer — nav aria-label + h2 sr-only (WCAG landmarks)
