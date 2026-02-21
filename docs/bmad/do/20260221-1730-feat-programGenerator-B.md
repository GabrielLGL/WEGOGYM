# feat(programGenerator) — Groupe B : splitStrategy + volumeCalculator
Date : 2026-02-21 17:30

## Instruction
docs/bmad/prompts/20260221-1725-program-generator-B.md

## Rapport source
description directe (rapport prompt)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/services/ai/programGenerator/types.ts` (créé — Groupe A prérequis manquant)
- `mobile/src/services/ai/programGenerator/tables.ts` (créé — Groupe A prérequis manquant)
- `mobile/src/services/ai/programGenerator/splitStrategy.ts` (créé)
- `mobile/src/services/ai/programGenerator/volumeCalculator.ts` (créé)
- `mobile/src/services/ai/programGenerator/__tests__/splitStrategy.test.ts` (créé)

## Ce qui a été fait
- Créé le dossier `mobile/src/services/ai/programGenerator/`
- Créé `types.ts` et `tables.ts` (Groupe A — prérequis absents au moment de l'exécution)
- Créé `splitStrategy.ts` :
  - `determineSplit()` : 5 règles de priorité décroissante (beginner → full_body, strength+advanced → split, etc.)
  - `buildWeeklySchedule()` : génère la liste des muscles par séance pour les 5 splits
- Créé `volumeCalculator.ts` :
  - `calcWeeklyVolumeByMuscle()` : volume hebdo depuis WEEKLY_VOLUME_TABLE, ajustements séance courte (<45min) et posturalIssues (×1.3 chaîne postérieure)
  - `distributeVolumeToSessions()` : distribution équitable avec respect de MAX_SETS_PER_MUSCLE_PER_SESSION et MAX_TOTAL_SETS_PER_SESSION
- Fix TypeScript : `let volume: number = baseVolume` (inférence littérale bloquée par `as const`)
- Créé 13 tests unitaires couvrant tous les critères de validation du rapport

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 13 passed (0 failed)
- Nouveau test créé : oui — `__tests__/splitStrategy.test.ts`

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260221-1730

## Commit
33c6463 feat(programGenerator): pure algo modules — splitStrategy + volumeCalculator (Groupe B)
