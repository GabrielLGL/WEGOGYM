# fix(ai) — Refactor offline engine : split filtering + shuffle + compound-first + PR weights
Date : 2026-02-19 17:05

## Instruction
Refactor complet de l'algorithme offline de génération de séances.
Correction du bug critique PPL (mêmes exercices toutes séances) + shuffle + compound-first + weightTarget depuis PRs.

## Classification
Type : fix + refactor
Fichiers : mobile/src/services/ai/offlineEngine.ts

## Ce qui a été fait

### Bug critique corrigé (ligne 88)
- **Avant :** `const pool = context.exercises.length > 0 ? context.exercises : splitGroups[groupIndex]`
  → Utilisait TOUS les exercices pour chaque séance, ignorant le split musculaire.
- **Après :** Filtre `context.exercises` par les muscles du groupe courant (PPL/UpperLower/Fullbody).
  Fallback sur tous les exercices si le pool filtré < 2.

### Bug shuffle corrigé (lignes 65-68)
- **Avant :** `source[i % source.length]` → toujours les mêmes exercices dans le même ordre.
- **Après :** `shuffleArray<T>()` (Fisher-Yates) appliqué séparément aux compounds et isolations.

### weightTarget depuis PRs
- **Avant :** `weightTarget: 0` systématiquement.
- **Après :** `getWeightTarget()` calcule un % du PR selon l'objectif et le niveau :
  - power : 75% / 82% / 88%
  - bodybuilding : 65% / 72% / 78%
  - renfo : 60% / 65% / 70%
  - cardio : 50% / 55% / 60%
  - Arrondi au 0.5 kg.

### Compound-first
- Exercices triés : compounds (muscles dans COMPOUND_MUSCLES) shufflés en premier,
  puis isolations shufflées.
- `COMPOUND_MUSCLES = ['Quadriceps', 'Dos', 'Pecs', 'Ischios', 'Epaules']`

### Mise à jour des signatures
- `buildSession` : accepte désormais `ExerciseInfo[]`, `level: string`, `prs: Record<string, number>`
- `generateSession` : passe `form.level` et `context.prs` à `buildSession`
- Import : ajout de `ExerciseInfo` depuis `./types`

## Vérification
- TypeScript : ✅ zéro erreur (`npx tsc --noEmit`)
- Tests : ✅ 28 passed, 0 failed (`npm test -- --testPathPattern="offlineEngine"`)
- Nouveau test créé : non (tests existants couvrent tous les cas)

## Commit
5e3d2f1 → commit suivant : fix(ai): correct offline engine split filtering + add shuffle, compound-first, PR-based weights
