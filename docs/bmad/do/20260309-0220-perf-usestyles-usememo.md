# perf(components) — wrap useStyles avec useMemo
Date : 2026-03-09 02:20

## Instruction
useStyles useMemo (3 fichiers)

## Rapport source
description directe

## Classification
Type : perf
Fichiers modifiés : mobile/src/components/CoachMarks.tsx, mobile/src/components/Button.tsx, mobile/src/components/BottomSheet.tsx

## Ce qui a été fait
- CoachMarks.tsx : ajout `useMemo` import + wrap `StyleSheet.create` dans `useMemo(() => ..., [colors])`
- Button.tsx : ajout `useMemo` import + wrap `StyleSheet.create` dans `useMemo(() => ..., [colors])`
- BottomSheet.tsx : ajout `useMemo` import + wrap `StyleSheet.create` dans `useMemo(() => ..., [colors])`

Évite la recréation du StyleSheet à chaque render quand `colors` n'a pas changé.

## Vérification
- TypeScript : ✅ 0 erreurs
- Tests : ✅ 1737 passed (112 suites)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260309-0220

## Commit
d69db89 perf(components): wrap useStyles with useMemo in CoachMarks, Button, BottomSheet
