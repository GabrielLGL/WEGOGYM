# refactor(SessionDetail) — alertConfig stale closure fix
Date : 2026-03-11 14:00

## Instruction
SessionDetailScreen alertConfig stale closure refactor

## Rapport source
Description directe

## Classification
Type : refactor
Fichiers modifiés : mobile/src/screens/SessionDetailScreen.tsx

## Ce qui a été fait
- Replaced `alertConfig.onConfirm` callback-in-state pattern with a `useRef` (`alertConfirmRef`)
- State now only stores `{ title, message }` (no closure)
- The confirm callback is stored in `alertConfirmRef.current`, read at invocation time
- This prevents stale closure bugs where `removeExercise` or other deps could change between `setAlertConfig` and the actual confirm tap

## Vérification
- TypeScript : 0 erreurs
- Tests : 109 suites, 1694 passed
- Nouveau test créé : non (UI interaction, covered by existing tests)

## Documentation mise à jour
Aucune

## Statut
Résolu — 20260311-1400

## Commit
b02ea6f feat+refactor: observeCurrentUser helper, i18n units, alertConfig stale closure fix
