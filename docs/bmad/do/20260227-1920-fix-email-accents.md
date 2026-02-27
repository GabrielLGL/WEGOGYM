# fix(web) — Email welcome — accents manquants
Date : 2026-02-27 19:20

## Instruction
`/do docs/bmad/prompts/20260227-1900-audit5-email-accents-B.md`

## Rapport source
`docs/bmad/prompts/20260227-1900-audit5-email-accents-B.md`

## Classification
Type : fix
Fichiers modifiés : `web/src/emails/welcome.tsx`

## Ce qui a été fait
Correction de 7 occurrences de texte sans accents dans le template email :
1. `"communaute"` → `"communauté"`
2. `"premiers a suivre"` → `"premiers à suivre"` + `"tient"` → `"tiendra"` + `"des qu"` → `"dès qu"`
3. `"Cree tes propres routines"` → `"Crée tes propres routines"`
4. `"wifi a la salle"` → `"wifi à la salle"`
5. `"stats detailles"` → `"stats détaillés"`
6. `"Decouvrir Kore"` → `"Découvrir Kore"`
7. `"Tu recois"` → `"Tu reçois"` + `"desinscrire"` → `"désinscrire"` + `"reponds a"` → `"réponds à"`

Aucune modification de style, structure JSX ou logique.

## Vérification
- TypeScript : ✅ 0 erreur (`npx tsc --noEmit` depuis `web/`)
- Tests : n/a
- Nouveau test créé : non

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260227-1920

## Commit
`69bec1b` fix(web): accents email welcome — communauté, Crée, Découvrir, désinscrire...
