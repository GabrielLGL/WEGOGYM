# fix(sentry.test) — Corriger 6 erreurs TypeScript process.env sans cast
Date : 2026-02-20 22:15

## Instruction
docs/bmad/prompts/20260220-2210-ci-reduction-B.md

## Rapport source
docs/bmad/prompts/20260220-2210-ci-reduction-B.md

## Classification
Type : fix
Fichiers modifiés :
- mobile/src/services/__tests__/sentry.test.ts

## Ce qui a été fait
Remplacé les 6 accès directs à `process.env.EXPO_PUBLIC_SENTRY_DSN` sans cast TypeScript :

- 3 assignations → `;(process.env as Record<string, string>).EXPO_PUBLIC_SENTRY_DSN = '...'`
  - ligne 63 (test "appelle Sentry.init quand EXPO_PUBLIC_SENTRY_DSN est fourni")
  - ligne 84 (test "Sentry.init est configuré avec les bonnes valeurs")
  - ligne 106 (test "beforeSend retourne null en développement")

- 3 suppressions → `delete (process.env as Record<string, string | undefined>).EXPO_PUBLIC_SENTRY_DSN`
  - ligne 78 (fin du test "appelle Sentry.init")
  - ligne 100 (fin du test "Sentry.init est configuré")
  - ligne 125 (fin du test "beforeSend retourne null")

Ligne 31 (beforeEach) et ligne 44 (test chaîne vide) étaient déjà corrects — non modifiés.

## Vérification
- TypeScript : ✅ 0 erreur (`npx tsc --noEmit` exit 0)
- Tests : ✅ 13 passed, 0 failed (`sentry.test.ts`)
- Nouveau test créé : non (tests existants suffisants)

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260220-2215

## Commit
9a58fc5 fix(sentry.test): cast process.env accesses to fix 6 TS errors
