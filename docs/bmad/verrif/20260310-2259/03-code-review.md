# Passe 3/8 — Code Review

**Date :** 2026-03-10 22:59

## Résumé

- 🔴 Critiques : 0
- 🟡 Warnings : 4
- 🔵 Suggestions : 4

## Points conformes

- Pas de `<Modal>` natif — Portal pattern respecté partout
- `database.write()` correctement utilisé pour toutes les mutations
- `withObservables` HOC utilisé correctement
- Tous les `setTimeout`/`setInterval` ont un cleanup
- Pas de `any` détecté dans les fichiers source
- Tous les `console.*` gardés par `__DEV__`
- Couleurs du thème via `useColors()` partout
- Schema v35 correspond aux modèles

## Findings

### 🟡 W1 — Abandoned histories contaminent les stats et PRs (SYSTÉMIQUE)

Le flag `is_abandoned` (ajouté v35) n'est filtré nulle part dans les queries de lecture :

| Fichier | Lignes | Impact |
|---------|--------|--------|
| `model/utils/workoutSessionUtils.ts` | 119-128 | `getLastSessionVolume()` inclut les sessions abandonnées |
| `model/utils/workoutSetUtils.ts` | 180-183 | `computeSetPrUpdates()` compte les PRs des sessions abandonnées |
| `screens/HomeScreen.tsx` | 676-691 | Weekly activity inclut les sessions abandonnées |
| `screens/StatsVolumeScreen.tsx` | 403-408 | Charts de volume incluent données abandonnées |

**Fix recommandé :** Créer un helper `activeHistoryClauses()` dans `databaseHelpers.ts` et l'appliquer partout.

### 🟡 W2 — HomeScreen lastCompletedHistory inclut abandonnées

**Fichier :** `screens/HomeScreen.tsx:189-190`
Le filtre `h.endTime` ne vérifie pas `h.isAbandoned`. Une session abandonnée pourrait apparaître comme suggestion "Quick Start".

**Fix :** Ajouter `&& !h.isAbandoned` au filtre.

### 🟡 W3 — WorkoutScreen useEffect stale closure potentielle

**Fichier :** `screens/WorkoutScreen.tsx:203-216`
`useEffect` avec `[]` référence `startErrorModal.open()` sans l'inclure dans les deps.

**Fix :** Utiliser un ref pour le callback d'erreur ou ajouter un commentaire ESLint explicite.

### 🟡 W4 — JSDoc orphelin

**Fichier :** `model/utils/workoutSessionUtils.ts:80-82`
JSDoc dit "Met à jour la note libre d'une séance" mais la fonction en dessous est `updateSessionExerciseNotes`.

**Fix :** Déplacer le JSDoc au bon endroit.

### 🔵 S1 — ProgramsScreen inline dense

**Fichier :** `screens/ProgramsScreen.tsx:296`
300 caractères de logique inline dans un `onPress`. Extraire en callback nommé.

### 🔵 S2 — HomeScreen performance NINETY_DAYS_MS

**Fichier :** `screens/HomeScreen.tsx:676-691`
Fetch 90 jours de données alors que weekly activity n'utilise que 7 jours.

### 🔵 S3 — StatsVolumeScreen abandoned filter

**Fichier :** `screens/StatsVolumeScreen.tsx:403-409`
`withObservables` ne filtre pas `is_abandoned`.

### 🔵 S4 — Tests manquants pour abandoned filter

Ajouter tests pour vérifier que `getLastSessionVolume` et `recalculateSetPrs` excluent les sessions abandonnées.
