# Verrif 20260307-0051 — 7 problemes non corriges

## Statut : En attente

## Contexte
Le dernier run verrif (20260307-0051) a laisse 7 problemes non corriges (1 warning, 4 bugs mineurs, 1 suggestion, 1 qualite). Tous sont a faible risque mais meritent d'etre traites pour atteindre un scan propre.

## Actions
1. `components/BottomSheet.tsx` — Remplacer `Dimensions.get` au scope module par `useWindowDimensions()` (W6)
2. `screens/HistoryDetailScreen.tsx` — Ajouter logging dans 4 empty catch (B3)
3. `screens/StatsMeasurementsScreen.tsx` — Ajouter logging dans 2 empty catch (B4)
4. `screens/WorkoutScreen.tsx` — Guard unmount sur `handleConfirmEnd` (B5)
5. `hooks/useAssistantWizard.ts` — Ajouter AbortController sur `triggerGenerate` (B6)
6. `screens/StatsVolumeScreen.tsx` — Desync langue `muscleLabel` (S1)
7. `screens/ProgramDetailScreen.tsx` + `ProgramsScreen.tsx` — Hardcoded spacing restant (Q1)

## Fichiers concernes
- mobile/src/components/BottomSheet.tsx
- mobile/src/screens/HistoryDetailScreen.tsx
- mobile/src/screens/StatsMeasurementsScreen.tsx
- mobile/src/screens/WorkoutScreen.tsx
- mobile/src/hooks/useAssistantWizard.ts
- mobile/src/screens/StatsVolumeScreen.tsx
- mobile/src/screens/ProgramDetailScreen.tsx
- mobile/src/screens/ProgramsScreen.tsx

## Parallelisation
- Claude Code 1 : B3 + B4 (empty catch — fichiers differents)
- Claude Code 2 : Q1 (hardcoded spacing — fichiers differents)
- Sequentiel : W6, B5, B6, S1

## Criteres de validation
- `npx tsc --noEmit` OK
- `npm test` 0 fail
- Prochain /verrif montre 0 problemes restants

## Statut
✅ Résolu — 20260307-1000

## Résolution
Rapport do : docs/bmad/do/20260307-1000-fix-verrif-remaining.md
