# Exercise Animations — Build Script

Script local pour peupler le bucket Supabase `exercise-animations` avec des images
d'exercices issues du dataset libre [free-exercise-db](https://github.com/yuhonas/free-exercise-db).

## Architecture

```
free-exercise-db (GitHub, CC0)         Supabase Storage
   873 exercices, images JPG   ──────►  bucket: exercise-animations
                                        URL: https://tcuchypwztvghiywhobo.supabase.co/
                                             storage/v1/object/public/exercise-animations/
                                                         ↓
                                        mobile/src/model/utils/animationMap.ts
```

> **Note (mars 2026)** : ExerciseDB (RapidAPI) a supprimé les GIFs animés de son API.
> Les images sont désormais des JPGs statiques de haute qualité issus de `free-exercise-db`.
> Pour des animations WebP : upload manuel dans le bucket Supabase (voir section dédiée).

## Prérequis

### 1. Supabase Storage — créer le bucket

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/storage/buckets)
2. **New bucket**
   - Nom : `exercise-animations`
   - Public : ✅ (cocher "Public bucket")
3. Sauvegarder

### 2. Supabase — récupérer la clé service_role (format JWT)

⚠️ **Attention au format de clé** :

| Format | Valeur | Utilisation |
|--------|--------|-------------|
| ✅ **JWT service_role** | `eyJhbGciOiJI...` (long, ~200 chars) | **Requis par ce script** (Storage REST API) |
| ❌ sb_secret_ | `sb_secret_xxx` (court) | SDK Supabase v3 uniquement — ne fonctionne PAS ici |

**Où trouver la JWT service_role key :**
1. [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/settings/api)
2. Section **"Project API keys"**
3. Copier la valeur **"service_role"** (ligne `eyJhbGci...`)

### 3. Fichier .env.local à la racine du repo

```bash
# .env.local (gitignored)
SUPABASE_URL=https://tcuchypwztvghiywhobo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # JWT format
```

`EXERCISEDB_API_KEY` n'est plus requis (ExerciseDB supprimé — source remplacée par free-exercise-db).

## Utilisation

```bash
# Depuis la racine du repo
node scripts/build-exercise-animations.mjs > mobile/src/model/utils/animationMap.ts
```

Le script :
1. Charge `.env.local` automatiquement
2. Télécharge le dataset `free-exercise-db` (~873 exercices) depuis GitHub
3. Pour chaque animation_key → trouve l'exercice correspondant
4. Télécharge l'image JPG et l'uploade dans Supabase Storage
5. Génère `animationMap.ts` mis à jour sur **stdout**

La redirection `>` met à jour le fichier TypeScript directement.
Les logs de progression s'affichent sur **stderr** (non redirigés).

**Durée estimée** : ~30 exercices × 200ms = ~10 secondes (principalement le réseau).

## Couverture actuelle

| Exercice | Dataset | Upload |
|----------|---------|--------|
| 29/30 exercices | ✓ trouvés dans free-exercise-db | ✓ si Supabase OK |
| `bulgarian_split_squat` | ✗ absent du dataset | Upload manuel requis |

## Ajouter un exercice custom ou une animation WebP

### Upload manuel via Supabase Dashboard

1. [Storage → exercise-animations](https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/storage/buckets/exercise-animations) → **Upload file**
2. Nommer le fichier `{animation_key}.webp` (ex: `face_pull.webp`)
3. Dans `animationMap.ts`, mettre à jour la clé :
   ```ts
   face_pull: `${SUPABASE_BASE}/face_pull.webp`,
   ```

### Ajouter un nouvel exercice

1. Uploader l'image dans Supabase Storage
2. Ajouter dans `animationMap.ts` :
   ```ts
   cable_curl: `${SUPABASE_BASE}/cable_curl.jpg`,
   ```
3. Assigner `animation_key: 'cable_curl'` à l'exercice en DB

## Vérification

Après le script :
1. Ouvrir une URL dans un navigateur :
   `https://tcuchypwztvghiywhobo.supabase.co/storage/v1/object/public/exercise-animations/bench_press_barbell.jpg`
   → doit afficher l'image
2. Lancer l'app → ExerciseInfoSheet → les exercices affichent l'image
3. `cd mobile && npx tsc --noEmit` → zéro erreur TypeScript

## Troubleshooting

| Erreur | Cause | Solution |
|--------|-------|---------|
| `Invalid Compact JWS` | Clé `sb_secret_` utilisée au lieu du JWT | Voir section "Prérequis 2" — utiliser la clé `eyJhbGci...` |
| `Supabase upload 400/403` | Bucket inexistant ou mauvaise clé | Vérifier dashboard |
| `Dataset fetch failed` | Pas d'accès internet | Vérifier connexion réseau |
| URL 404 dans l'app | Fichier non uploadé | Relancer le script ou upload manuel |
