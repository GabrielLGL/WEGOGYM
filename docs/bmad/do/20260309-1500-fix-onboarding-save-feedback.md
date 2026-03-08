# fix(onboarding) — feedback utilisateur en cas d'échec de sauvegarde
Date : 2026-03-09 15:00

## Instruction
OnboardingScreen feedback échec sauvegarde

## Rapport source
Description directe

## Classification
Type : fix
Fichiers modifiés :
- mobile/src/screens/OnboardingScreen.tsx
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts

## Ce qui a été fait
- Ajout d'un Toast Android dans les blocs `catch` de `handleAcceptDisclaimer` et `handleConfirm`
- Ajout de la clé i18n `onboarding.saveError` en FR ("Impossible d'enregistrer. Veuillez réessayer.") et EN ("Unable to save. Please try again.")
- L'utilisateur voit maintenant un message clair si la sauvegarde DB échoue, au lieu d'un échec silencieux

## Vérification
- TypeScript : ✅
- Tests : ✅ 1737 passed
- Nouveau test créé : non (les catch paths sont difficiles à tester sans mock DB error, et le comportement est un simple Toast)

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260309-1500

## Commit
