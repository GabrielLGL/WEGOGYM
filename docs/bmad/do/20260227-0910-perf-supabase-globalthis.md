# PERF(web) — supabase.ts : singleton globalThis._supabase
Date : 2026-02-27 09:10

## Instruction
docs/bmad/prompts/20260227-supabase-globalthis-A.md

## Rapport source
docs/bmad/prompts/20260227-supabase-globalthis-A.md

## Classification
Type : perf
Fichiers modifiés : `web/src/lib/supabase.ts`

## Ce qui a été fait
Déjà implémenté (statut rapport : ✅ Implémenté). Vérifié conforme :
- `declare global { var _supabase: SupabaseClient | undefined }` présent
- `if (!globalThis._supabase)` remplace l'ancien `if (!client)`
- `globalThis._supabase = createClient(...)` et `return globalThis._supabase`
- Signature `getSupabase()` et message d'erreur inchangés
- Fichier déjà committé (working tree propre)

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ⚠️ 6 fails pre-existants (label dupliqué dans page.test.tsx — non liés)
- Nouveau test créé : non (mock existant `vi.mock('@/lib/supabase')` couvre le cas)

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260227-0910 (implémentation pré-existante confirmée)

## Commit
Déjà inclus dans un commit antérieur (working tree propre)
