# TEST(api/subscribe) — Tests route POST /api/subscribe
Date : 2026-02-26 12:00

## Instruction
docs/bmad/prompts/20260226-1745-tests-web-C.md

## Rapport source
docs/bmad/prompts/20260226-1745-tests-web-C.md

## Classification
Type : test
Fichiers modifiés :
- `web/src/app/api/subscribe/__tests__/route.test.ts` (créé)

## Ce qui a été fait
Création du fichier de tests Vitest pour la route `POST /api/subscribe`.
5 cas couverts :
- 400 si email manquant
- 400 si email sans "@"
- 200 + `success:true` pour email valide (Supabase OK + Resend OK)
- 500 si Supabase échoue
- 200 même si Resend échoue (échec silencieux)

Mocks : `getSupabase`, `getResend`, `WelcomeEmail` — les vraies APIs ne sont jamais appelées.
Pas de modification de `route.ts` ni de `vitest.config.ts` (NextRequest fonctionne en jsdom sans alias).

## Vérification
- TypeScript : ✅ (pas de tsc séparé côté web, vitest gère)
- Tests : ✅ 5 passed (+ 6 autres tests existants = 11 au total, 3 fichiers)
- Nouveau test créé : oui

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260226-1200

## Commit
954183a test(api/subscribe): add Vitest tests for POST /api/subscribe route
