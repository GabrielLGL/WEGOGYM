<!-- v1.0 — 2026-02-28 -->
# Rapport — fix-stats-duration — Groupe A — 20260228-1400

## Objectif
Corriger la race condition qui empêche les nouvelles séances d'apparaître
dans StatsDurationScreen après "Terminer la séance".

## Fichiers concernés
- mobile/src/screens/WorkoutScreen.tsx
- mobile/src/screens/StatsDurationScreen.tsx
- mobile/src/model/utils/statsDuration.ts

## Contexte technique
Race condition React 18 : historyId (state) peut ne pas encore être mis à jour
quand l'utilisateur appuie sur "Terminer". historyRef.current est mis à jour
synchroniquement dans le .then() callback — à utiliser en priorité.

Fix 1 — WorkoutScreen.tsx : handleConfirmEnd + handleConfirmAbandon utilisent
`historyRef.current?.id || historyId` au lieu de `historyId` seul.

Fix 2 — StatsDurationScreen.tsx : ajouter `Q.where('end_time', Q.notEq(null))`
à la query observable pour filtrer au niveau DB.

Fix 3 — statsDuration.ts : simplifier le filtre JS `.filter(h => h.endTime != null)`
(deletedAt déjà garanti par la query DB).

## Étapes
1. WorkoutScreen.tsx handleConfirmEnd (ligne ~179) :
   `const activeHistoryId = historyRef.current?.id || historyId`
2. WorkoutScreen.tsx handleConfirmAbandon (ligne ~334) : même correction
3. StatsDurationScreen.tsx query : ajouter `Q.where('end_time', Q.notEq(null))`
4. statsDuration.ts : retirer `h.deletedAt === null &&` du filtre

## Critères de validation
- npx tsc --noEmit → zéro erreur
- npm test → zéro fail
- Test manuel : terminer une séance → naviguer vers "Durée des séances" → apparaît

## Dépendances
Aucune dépendance inter-groupes.

## Statut
✅ Appliqué (2026-02-28 14:00)
