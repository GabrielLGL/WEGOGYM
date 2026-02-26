<!-- v1.0 — 2026-02-27 -->
# Prompt — Rate Limiting /api/subscribe — 20260227-0900

## Demande originale

> bossons sur la Rate limiting sur /api/subscribe

## Analyse

L'endpoint `POST /api/subscribe` (Next.js 15 App Router, `web/src/app/api/subscribe/route.ts`) n'a aucune protection contre le spam. Un bot peut appeler en boucle → spam Resend + coûts. Solution : rate limiter in-memory (5 req/h/IP), zéro nouvelle dépendance.

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `20260227-0900-rate-limit-A.md` | `lib/rateLimit.ts` (nouveau), `api/subscribe/route.ts` | 1 | ✅ f717453 |
| B | `20260227-0900-rate-limit-B.md` | `api/subscribe/__tests__/route.test.ts` | 2 | ✅ c8c7cfd |

## Ordre d'exécution

- **Vague 1** : Groupe A seul (implémentation)
- **Vague 2** : Groupe B après A (les tests dépendent de l'API de `rateLimit.ts`)
