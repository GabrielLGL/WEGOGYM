# Passe 7 — Corrections — 20260226-1242

## 7a — Critiques 🔴
Aucun problème critique. Pas de commit nécessaire.

## 7b — Warnings 🟡

### W1 — WorkoutExerciseCard.tsx — Validation dupliquée
**Décision :** Pas de correction.
Les calculs locaux (`weightError`/`repsError`) servent le styling en temps réel.
`validateSetInput` sert le gating de soumission. Rôles distincts, coexistence acceptable.

### W2 — WorkoutExerciseCard.tsx — Callbacks sans useCallback dans .map()
**Décision :** Pas de correction dans ce run.
Raison : nécessite `React.memo` sur `WorkoutSetRow` en tandem pour être efficace.
Change le comportement de rendu. À faire dans un `/do` dédié (Groupe E).

## 7c — Suggestions 🔵

### S1 — ChartsScreen.tsx — paddingHorizontal: 40 → spacing.xxl ✅ CORRIGÉ

**Fichier :** `src/screens/ChartsScreen.tsx`
**Changement :**
```diff
- import { colors, fontSize, borderRadius } from '../theme'
+ import { colors, fontSize, borderRadius, spacing } from '../theme'
...
- emptyState: { marginTop: 50, paddingHorizontal: 40 },
+ emptyState: { marginTop: 50, paddingHorizontal: spacing.xxl },
```
C'est le seul magic number avec une correspondance exacte dans le theme (spacing.xxl = 40).

## Vérification post-correction
✅ `npx tsc --noEmit` → 0 erreur

## Résumé
- 🔴 Critiques corrigés : 0
- 🟡 Warnings corrigés : 0
- 🔵 Suggestions corrigées : 1
