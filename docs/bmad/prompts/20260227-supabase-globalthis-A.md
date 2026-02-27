<!-- v1.0 — 2026-02-27 -->
# Rapport — supabase-globalthis — Groupe A — 20260227

## Objectif
Remplacer le singleton module-level (`let client = null`) dans `web/src/lib/supabase.ts` par un singleton `globalThis._supabase` pour éviter les recréations du client en environnement serverless Next.js.

## Fichiers concernés
- `web/src/lib/supabase.ts`

## Contexte technique
En Next.js serverless, les modules JS peuvent être réinstanciés entre invocations dans le même process Node, ce qui réinitialise les variables module-level. `globalThis` survit à ces ré-imports.

Le pattern `declare global { var _supabase }` est nécessaire pour typer `globalThis` en TypeScript strict.

Tests existants : `vi.mock('@/lib/supabase', () => ({ getSupabase: vi.fn() }))` — non affectés car le mock remplace le module entier.

## Étapes
1. Supprimer `let client: SupabaseClient | null = null`
2. Ajouter `declare global { var _supabase: SupabaseClient | undefined }`
3. Remplacer `if (!client)` par `if (!globalThis._supabase)`
4. Remplacer `client = createClient(...)` par `globalThis._supabase = createClient(...)`
5. Remplacer `return client` par `return globalThis._supabase`

## Contraintes
- Ne pas modifier la signature de `getSupabase()`
- Ne pas modifier le message d'erreur "Missing Supabase env vars"
- TypeScript strict — pas de `any`

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail

## Dépendances
Aucune dépendance

## Statut
✅ Implémenté
