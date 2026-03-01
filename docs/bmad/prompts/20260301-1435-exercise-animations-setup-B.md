<!-- v1.0 — 2026-03-01 -->
# Rapport — Exercise Animations Setup — Groupe B — 20260301-1435

## Objectif

Lancer le script `scripts/build-exercise-animations.mjs` pour :
1. Télécharger les GIFs depuis ExerciseDB (RapidAPI)
2. Les convertir en animated WebP (si ffmpeg disponible)
3. Les uploader dans Supabase Storage (bucket `exercise-animations`)
4. Mettre à jour `mobile/src/model/utils/animationMap.ts` avec les URLs réelles

## Fichiers concernés

- `mobile/src/model/utils/animationMap.ts` (mis à jour par le script)
- `scripts/build-exercise-animations.mjs` (script à lancer — ne pas modifier)

## Contexte technique

### Prérequis manuels OBLIGATOIRES (à vérifier avant de lancer)

Avant de lancer ce groupe, l'utilisateur DOIT avoir fait :

1. **Supabase Dashboard** → Storage → bucket `exercise-animations` créé avec accès **public**
   - URL dashboard : https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/storage/buckets

2. **RapidAPI** → Compte créé + souscription ExerciseDB free tier
   - URL : https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb

3. **`.env.local`** à la racine du repo avec les vraies clés (Groupe A terminé + clés renseignées)

### Fonctionnement du script

- Le script lit `.env.local` automatiquement
- Il traite 30 exercices avec 500ms de délai entre chaque → ~15-30s
- Logs sur stderr (visibles dans le terminal)
- `animationMap.ts` généré sur stdout → redirigé vers le fichier

### Commande

```bash
node scripts/build-exercise-animations.mjs > mobile/src/model/utils/animationMap.ts
```

Si le script retourne une erreur, ne pas relancer plusieurs fois. Diagnostiquer d'abord.

## Étapes

1. Vérifier que `.env.local` contient des vraies clés (pas les placeholders)
   ```bash
   grep -c "REMPLACER" .env.local  # doit retourner 0
   ```

2. Vérifier que le bucket Supabase existe (optionnel — l'erreur upload sera claire)

3. Lancer le script :
   ```bash
   node scripts/build-exercise-animations.mjs > mobile/src/model/utils/animationMap.ts
   ```

4. Vérifier que `animationMap.ts` a bien été mis à jour (URLs Supabase, pas de placeholders)

5. Vérifier TypeScript :
   ```bash
   cd mobile && npx tsc --noEmit
   ```

6. Tester une URL dans le navigateur (première de la liste, ex: bench_press_barbell.webp)

## Contraintes

- Ne pas lancer si les placeholders ne sont pas remplacés
- Ne pas modifier le script pendant l'exécution
- Si certains exercices retournent `undefined` → normal, ExerciseDB n'a pas tous les exercices
- Ne pas committer `.env.local`

## Gestion d'erreurs fréquentes

| Erreur | Cause probable | Action |
|--------|---------------|--------|
| `EXERCISEDB_API_KEY is required` | `.env.local` mal formé ou absent | Vérifier le fichier |
| `ExerciseDB 403` | Clé invalide ou non souscrit | Vérifier RapidAPI dashboard |
| `ExerciseDB 429` | Rate limit (500 req/jour) | Attendre demain |
| `Supabase upload 400/403` | Bucket inexistant ou mauvaise clé | Vérifier dashboard + clé service_role |
| `ffmpeg: command not found` | Normal si non installé | Le script continue avec .gif |

## Critères de validation

- `animationMap.ts` contient des URLs `supabase.co` (pas des placeholders `undefined`)
- `cd mobile && npx tsc --noEmit` → zéro erreur
- Au moins une URL ouvre une animation dans le navigateur
- `npm test` dans `mobile/` → zéro régression

## Dépendances

Ce groupe dépend de :
- **Groupe A** terminé + clés réelles renseignées dans `.env.local`
- Actions manuelles : Supabase bucket créé + RapidAPI souscrit

## Statut

⚠️ Bloqué — 20260301-1500

## Blocage
Clé `SUPABASE_SERVICE_ROLE_KEY` au format `sb_secret_...` (nouveau SDK Supabase v3)
mais la Storage REST API requiert le JWT format (`eyJhbGci...`).

Le script fonctionne (29/30 matchs, logique correcte). Seule la clé bloque les uploads.

À reprendre avec : /do docs/bmad/prompts/20260301-1435-exercise-animations-setup-B.md
après avoir remplacé dans .env.local :
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (JWT format depuis Dashboard → Settings → API)

## Rapport do
docs/bmad/do/20260301-1500-chore-build-animations-script.md
