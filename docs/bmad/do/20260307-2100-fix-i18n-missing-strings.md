# fix(i18n) — Replace hardcoded French strings with t() translations
Date : 2026-03-07 21:00

## Instruction
i18n strings manquantes

## Rapport source
Description directe

## Classification
Type : fix
Fichiers modifiés :
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts
- mobile/src/components/AssistantPreviewSheet.tsx
- mobile/src/components/ExercisePickerModal.tsx
- mobile/src/components/ExerciseTargetInputs.tsx
- mobile/src/screens/SettingsScreen.tsx

## Ce qui a été fait
1. **Scan complet** de tous les composants pour trouver les strings FR hardcodées
2. **Ajout de 12 nouvelles clés i18n** dans fr.ts et en.ts :
   - `assistantPreview.titleProgram/titleSession/nameLabel/namePlaceholder`
   - `exerciseTargetInputs.sets/weight/reps/modeFixed/modeRange`
   - `exercisePickerModal.title`
3. **AssistantPreviewSheet** (7 strings) : ajout `useLanguage()`, remplacement de toutes les strings hardcodées (titre, label, placeholder, boutons, format séries, loading)
4. **ExercisePickerModal** (5 strings) : ajout `useLanguage()`, remplacement titre, filtres (allMuscles/allEquipment), boutons (Annuler/Ajouter)
5. **ExerciseTargetInputs** (5 strings) : ajout `useLanguage()`, remplacement labels (Séries/Poids/Reps) et toggle (Fixe/Plage)
6. **SettingsScreen** (2 strings) : remplacement dialogTitle export et labels langue FR/EN

**Non modifiés (justification) :**
- `ErrorBoundary.tsx` : class component obligatoire (React error boundaries), ne peut pas utiliser hooks. Exception documentée dans le code.
- `AlertDialog.tsx` : valeurs par défaut des props uniquement, tous les call sites passent des valeurs explicites via `t.*`.

## Verification
- TypeScript : zero errors
- Tests : 1589 passed, 0 failed
- Nouveau test cree : non (pas de logique metier modifiee)

## Documentation mise a jour
Aucune

## Statut
Resolue - 20260307-2100

## Commit
