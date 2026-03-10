# Passe 6/8 — Code mort & qualité

**Date :** 2026-03-10 22:59

## Résumé

- 🔴 Critiques : 0
- 🟡 Warnings : 4
- 🔵 Suggestions : 4

## Points conformes

- Zero `any` en production ✅
- Zero `<Modal>` natif ✅
- Console statements tous gardés par `__DEV__` ✅
- TSConfig conforme ✅
- Thème centralisé via `useColors()` ✅
- Pattern `withObservables` respecté ✅

## Findings

### 🟡 W1 — Dead code exerciseDescriptions.ts

**Fichier :** `model/utils/exerciseDescriptions.ts:14,153`
`EXERCISE_DESCRIPTIONS` et `seedExerciseDescriptions` ne sont importés par aucun fichier de production (seulement tests).

### 🟡 W2 — Dead code badgeConstants.ts

**Fichier :** `model/utils/badgeConstants.ts:85`
`getBadgeById()` n'est importé par aucun fichier de production.

### 🟡 W3 — Dead code progressionHelpers.ts

**Fichier :** `model/utils/progressionHelpers.ts:28`
`parseRepsTarget()` n'est importé par aucun fichier de production.

### 🟡 W4 — Chaînes FR hardcodées useAssistantWizard.ts

**Fichier :** `hooks/useAssistantWizard.ts:75`
`MUSCLES_FOCUS_OPTIONS` contient des labels FR hardcodés. Les traductions i18n existent dans `fr.ts`/`en.ts` (`assistant.musclesFocus`). En mode EN, les labels restent en FR.

### 🔵 S1 — Duplication i18n BADGE_CATEGORY_LABELS

**Fichier :** `model/utils/badgeConstants.ts:89-97`
Duplique des chaînes de `t.badges.categories`. Le fallback n'est jamais atteint.

### 🔵 S2 — AnimatedSplash couleurs hardcodées

**Fichier :** `components/AnimatedSplash.tsx:20-21`
`#181b21` et `#00cec9` en dur. Documenté comme exception. Pourrait importer `darkTheme.*` statiquement.

### 🔵 S3-S4 — Couleurs hardcodées dans tests

**Fichiers :** `screens/__tests__/StatsDurationScreen.test.tsx:47-49`, `StatsMeasurementsScreen.test.tsx:56-58`
`#1C1C1E` (ancienne couleur) au lieu de `#181b21`.
