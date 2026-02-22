# feat(stats-duration) — Tooltip interactif sur le graphique de durée
Date : 2026-02-22 18:00

## Instruction
docs/bmad/prompts/20260222-1430-stats-ux-A.md

## Rapport source
docs/bmad/prompts/20260222-1430-stats-ux-A.md — Tooltip sur graphique durée

## Classification
Type : feat
Fichiers modifiés : mobile/src/screens/StatsDurationScreen.tsx

## Ce qui a été fait
- Ajout d'un state `selectedPoint` (index, x, y) pour stocker le point cliqué
- Ajout du callback `handleDataPointClick` avec logique toggle (re-clic = ferme)
- Ajout de `tooltipData` (useMemo) qui formate la date en français long format (ex: "Lundi 15 février 2026") et la durée en minutes
- Rendu du tooltip en `position: absolute` avec clamping pour ne pas déborder de l'écran
- Pressable wrapper autour du chart pour fermer le tooltip au tap en dehors
- Styles : `colors.cardSecondary` bg, `borderRadius.sm`, elevation/shadow, `colors.text` pour la date, `colors.primary` pour la durée

## Vérification
- TypeScript : ✅ 0 erreur (exit code 0)
- Tests : ✅ 847 passed, 47 suites
- Nouveau test créé : non (UI interaction, pas de logique métier à tester unitairement)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260222-1800

## Commit
e7585e4 feat(stats-duration): add interactive tooltip on chart data points
