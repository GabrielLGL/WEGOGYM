# test(subscribe) — Couverture tests rate limiting (429 + headers)
Date : 2026-02-27 09:35

## Instruction
`/do docs/bmad/prompts/20260227-0900-rate-limit-B.md`

## Rapport source
`docs/bmad/prompts/20260227-0900-rate-limit-B.md`

## Classification
Type : test
Fichiers modifiés :
- `web/src/app/api/subscribe/__tests__/route.test.ts`

## Ce qui a été fait
- Ajout `vi.mock("@/lib/rateLimit", ...)` pour mocker `checkRateLimit` et `getClientIp`
- Import des mocks dans le fichier de test
- `beforeEach` : defaults rate limit (`allowed: true, remaining: 4, limit: 5`) dans les deux `describe`
- Nouveau `describe("Rate limiting")` avec 2 tests :
  - `retourne 429 quand la limite est atteinte` : vérifie status 429, message FR, `Retry-After`, `X-RateLimit-Remaining: 0`
  - `inclut les headers X-RateLimit-* sur une requête réussie` : vérifie `X-RateLimit-Limit: 5`, `X-RateLimit-Remaining: 4`, `X-RateLimit-Reset` non nul

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 19 passed (5 existants + 2 nouveaux), 0 failed
- Nouveau test créé : oui (2 nouveaux cas)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260227-0935

## Commit
[à remplir]
