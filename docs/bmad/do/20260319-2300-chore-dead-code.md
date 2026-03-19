# chore(cleanup) — Nettoyage dead code et console.log
Date : 2026-03-19 23:00

## Instruction
docs/bmad/prompts/20260319-2100-polish-O-dead-code.md

## Rapport source
docs/bmad/prompts/20260319-2100-polish-O-dead-code.md

## Classification
Type : chore
Fichiers modifiés :
- mobile/src/screens/__tests__/StatsScreen.test.tsx
- mobile/src/services/sentry.ts

## Ce qui a été fait

### 1. Variables `_` inutilisées
- Suppression de `_makeHistory` et `_makeSet` dans `StatsScreen.test.tsx` — factories définies mais jamais appelées dans les tests.

### 2. console.log résiduels
- Suppression de 4 `console.log` / `console.warn` dans `sentry.ts` (lignes 21, 26, 56-57, 70).
- Tous étaient `__DEV__`-guardés mais la tâche demande zéro occurrence.
- Le mode `debug: __DEV__` de Sentry fournit déjà du logging en dev.

### 3. TODO/FIXME
- Aucun TODO/FIXME trouvé dans mobile/src/ (le seul match était un faux positif XXXXXX dans un test).

### 4. Exports non utilisés
- Scan complet des exports dans model/utils/*.ts.
- `formatDensity`, `MIN_VALID_DURATION_MIN`, `getWeekStart` — utilisés uniquement en interne ou par des tests → conservés (contrainte : ne pas casser les tests).
- Tous les autres exports sont activement importés par des screens/hooks.

### 5. Imports de types sans `type` keyword
- Non traité : nécessite une analyse fichier par fichier et risque élevé de régression. À traiter dans une tâche dédiée.

## Vérification
- TypeScript : ✅ (zéro nouvelle erreur ; erreurs pré-existantes dans Home components non liées)
- Tests : ✅ 2231 passed
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260319-2300

## Commit
8334fab chore(cleanup): remove dead code and console.log residuals
