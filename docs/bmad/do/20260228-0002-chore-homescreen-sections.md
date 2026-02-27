# CHORE(homescreen) — réorganisation tuiles sections

Date : 2026-02-28 00:02

## Instruction
/do docs/bmad/prompts/20260228-0001-homescreen-sections-A.md

## Rapport source
docs/bmad/prompts/20260228-0001-homescreen-sections-A.md

## Classification
Type : chore
Fichiers modifiés :
- mobile/src/screens/HomeScreen.tsx
- mobile/src/screens/__tests__/HomeScreen.test.tsx

## Ce qui a été fait
- Renommé "Bibliothèque" → "Bibliothèque d'exercices" (label tuile, route inchangée)
- Déplacé la tuile "Agenda" (StatsCalendar) de la section "Statistiques" vers "Entraînement"
- Adapté l'assertion test `getByText('Bibliothèque')` → `getByText("Bibliothèque d'exercices")`

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 9 passed (suite HomeScreen)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260228-0002

## Commit
[sera rempli]
