# Passe 3 — Code Review — 20260226-1242

## Méthode
Review adversarial — 40+ fichiers analysés.

---

## Problèmes identifiés

### 🟡 W1 — WorkoutExerciseCard.tsx — Validation dupliquée (style)
**Fichier:** `src/components/WorkoutExerciseCard.tsx:117-123`

Les variables `weightError`/`repsError` recalculent localement ce que `validateSetInput()` fait déjà.
Les deux coexistent : local pour styling (red border), validateSetInput pour gating.
**Risque :** divergence si la logique de validation change dans validationHelpers.ts.
**Effort :** 15min | **Décision :** Note uniquement, pas de correction urgente.

### 🟡 W2 — WorkoutExerciseCard.tsx — Pas de useCallback sur handlers dans .map()
**Fichier:** `src/components/WorkoutExerciseCard.tsx:270-283`

```tsx
{setOrders.map(setOrder => (
  <WorkoutSetRow
    onValidate={async (weight, reps) => { ... }}  // Nouveau ref à chaque render
    onUnvalidate={async () => { ... }}             // Nouveau ref à chaque render
  />
))}
```
Les callbacks sont recréés à chaque render → re-renders inutiles de WorkoutSetRow.
**Effort :** 30min | **Groupe :** E

### 🔵 S1 — providerUtils.ts — Double cast `as unknown as GeneratedPlan`
**Fichier:** `src/services/ai/providerUtils.ts`

Pattern `obj as unknown as GeneratedPlan` est un code smell (contournement TS).
La validation manuelle est correcte mais un type guard dédié serait plus propre.
**Effort :** 30min | **Décision :** Note uniquement.

---

## Points positifs
- ✅ `withObservables` utilisé correctement dans tous les screens
- ✅ Aucun `<Modal>` natif — Portal + AlertDialog/BottomSheet partout
- ✅ Clés API via `secureKeyStore.ts` (expo-secure-store), jamais en WDB
- ✅ Mutations WatermelonDB toujours dans `database.write()`
- ✅ Validation centralisée via `validationHelpers.ts`
- ✅ Cleanup d'effects correctement gérés

---

## Verdict
Pas de critique. 2 warnings de performance/qualité.
