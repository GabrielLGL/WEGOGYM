# Passe 7b — Corrections warnings

**Date :** 2026-03-09

## Corrections appliquées

### W1. ProgramsScreen.tsx — try/catch handlers
- `handleSaveProgram` et `handleDuplicateProgram` wrappés dans try/catch
- **Fichier :** `mobile/src/screens/ProgramsScreen.tsx`

### W2. ExercisesScreen.tsx — try/catch handlers
- `handleUpdateExercise` et `handleDeleteExercise` wrappés dans try/catch
- **Fichier :** `mobile/src/screens/ExercisesScreen.tsx`

### W3. CustomModal.tsx — spacing hardcodé
- `marginBottom: 20` → `spacing.lg`
- `gap: 10` → `spacing.ms`
- **Fichier :** `mobile/src/components/CustomModal.tsx`

### W4. StatsDurationScreen.tsx — deps useCallback
- Ajout de `t` dans les deps de `toggleExpand` useCallback
- **Fichier :** `mobile/src/screens/StatsDurationScreen.tsx`

### W5. ProgramDetailBottomSheet.tsx — i18n
- `'Aucun exercice'` hardcodé → `t.programDetail.noExercises`
- Ajout clés i18n dans `fr.ts` et `en.ts`
- **Fichiers :** `mobile/src/components/ProgramDetailBottomSheet.tsx`, `mobile/src/i18n/fr.ts`, `mobile/src/i18n/en.ts`

## Vérification
- `npx tsc --noEmit` : ✅ 0 erreur
- `npx jest` : ✅ 1737 tests, 0 fail
