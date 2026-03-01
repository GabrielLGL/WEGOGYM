<!-- v1.0 — 2026-03-01 -->
# Prompt — Exercise Animations Setup — 20260301-1435

## Demande originale

> 1. Supabase Dashboard → Storage → créer bucket exercise-animations (public)
> 2. RapidAPI → s'inscrire + souscrire ExerciseDB free tier
> 3. Créer .env.local à la racine avec les clés
> 4. node scripts/build-exercise-animations.mjs > mobile/src/model/utils/animationMap.ts

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Bloqué par | Statut |
|--------|---------|----------|-------|------------|--------|
| A | [setup-A.md](./20260301-1435-exercise-animations-setup-A.md) | `.env.local` | 1 | — | ⏳ |
| B | [setup-B.md](./20260301-1435-exercise-animations-setup-B.md) | `animationMap.ts` | 2 | A + actions manuelles | ⏳ |

## Actions manuelles (hors Claude Code)

Ces étapes doivent être faites **par l'utilisateur** dans des interfaces web :

### 1. Supabase — créer le bucket
- URL : https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/storage/buckets
- Cliquer **New bucket** → nom : `exercise-animations` → cocher **Public** → Save

### 2. RapidAPI — souscrire ExerciseDB
- URL : https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
- Créer un compte (si pas déjà fait) → Subscribe (Basic/Free tier)
- Copier la clé `X-RapidAPI-Key`

### 3. Supabase — récupérer la service_role key
- URL : https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/settings/api
- Section "Project API keys" → copier `service_role`

## Ordre d'exécution

```
[Manuel] Supabase bucket + RapidAPI ─┐
                                      ├─► Groupe A (.env.local template)
                                      │        ↓
                                      └─► [Utilisateur remplit les clés]
                                               ↓
                                          Groupe B (lancer le script)
```

## Références

- Script : `scripts/build-exercise-animations.mjs`
- Doc complète : `scripts/README-animations.md`
- Fichier cible : `mobile/src/model/utils/animationMap.ts`
- Bucket Supabase : `exercise-animations` @ `tcuchypwztvghiywhobo.supabase.co`
