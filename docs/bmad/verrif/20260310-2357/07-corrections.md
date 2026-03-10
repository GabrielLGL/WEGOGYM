# 07 — Corrections

**Run:** 2026-03-10 23:57

## 7a — Critiques 🔴
Aucune correction critique nécessaire.

## 7b — Warnings 🟡 (4 corrections)

### 1. ProgramDetailBottomSheet.tsx — Dimensions stale
- **Avant:** `Dimensions.get('window')` au scope module (stale sur rotation/foldables)
- **Après:** `useWindowDimensions()` dans le composant `ProgramDetailContentInner`
- **Impact:** Layout correct sur foldables et rotation d'écran

### 2. openaiProvider.ts — Modèle hardcodé 3x
- **Avant:** `model: 'gpt-4.1-mini'` répété 3 fois
- **Après:** `const OPENAI_MODEL = 'gpt-4.1-mini'` + référence unique
- **Impact:** Changement de modèle en un seul endroit

### 3. SessionDetailScreen.tsx — Handlers sans useCallback
- **Avant:** `cancelSelection`, `handleCreateGroup`, `handleUngroup`, `handleAddExercise` sans memoisation
- **Après:** Tous enveloppés dans `useCallback` avec deps correctes
- **Impact:** `renderDraggableItem` du DraggableFlatList ne re-render plus inutilement

### 4. statsMuscle.ts:42 — othersLabel default FR
- **Analyse:** `computeMuscleRepartition` n'est actuellement appelé que dans les tests. Aucun écran ne l'utilise directement.
- **Action:** Pas de correction (pas d'impact user). À corriger quand la fonction sera intégrée dans un écran.

## 7c — Suggestions 🔵
- aiService.ts testClaudeConnection (2048 tokens → 10) : non corrigé car risque de changer le comportement de validation. À faire en feature dédiée.
- User observable dupliqué 4x : DRY backlog, pas de correction dans ce run.

## Vérification post-fix
- TSC: ✅ 0 erreur
- Tests: ✅ 108 suites, 1690 tests — 100% pass
