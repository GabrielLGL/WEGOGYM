# CHORE(exercises) — Création seed-exercises.mjs + mise à jour package.json

Date : 2026-03-01 18:05

## Instruction
docs/bmad/prompts/20260301-1800-exercise-db-seeder-B.md

## Rapport source
docs/bmad/prompts/20260301-1800-exercise-db-seeder-B.md

## Classification
Type : chore
Fichiers modifiés :
- `seed-exercises.mjs` (créé à la racine)
- `package.json` (racine — 3 dépendances ajoutées)

## Ce qui a été fait

### `package.json` racine
Ajout dans `"dependencies"` :
- `@supabase/supabase-js": "^2.47.10`
- `"dotenv": "^16.4.7"`
- `"node-fetch": "^3.3.2"`

### `seed-exercises.mjs`
Script de seeding complet (~180 lignes) :
- Chargement `.env.local` manuel (même pattern que `build-exercise-animations.mjs`)
- Fallback `SUPABASE_SERVICE_ROLE_KEY` → `SUPABASE_SERVICE_KEY`
- `SUPABASE_URL` hardcodé en fallback (`tcuchypwztvghiywhobo.supabase.co`)
- Fetch `https://exercisedb.dev/api/v1/exercises?limit=0&offset=0`
- Traitement batch de 5, délai 300ms
- **Idempotent** : check `gifExistsInStorage()` avant chaque upload
- Upload GIF dans bucket `exercise-gifs` (upsert)
- Upsert métadonnées dans table `exercises` (onConflict: 'id')
- Log `[X/N] nom ✅ / ⏭ déjà en Storage / ⚠ pas de gifUrl / ❌ erreur`
- JSDoc sur toutes les fonctions helper

## Vérification
- TypeScript : N/A (script Node .mjs, pas dans mobile/src/)
- Syntaxe Node : ✅ (`node --check seed-exercises.mjs` → OK)
- package.json : ✅ (JSON valide)
- Tests : N/A
- Nouveau test créé : non

## Note d'exécution
`npm install` doit être lancé manuellement avant `node seed-exercises.mjs`.
Le script nécessite aussi le Groupe A (table + bucket) complété.

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260301-1805

## Commit
d7887d4 chore(exercises): add seed-exercises.mjs script + supabase-js/dotenv deps

---

## Vérification npm install — 20260301-1850

### Résultat
```
up to date, audited 1194 packages in 8s
```
✅ Les 3 dépendances (`@supabase/supabase-js`, `dotenv`, `node-fetch`) sont installées.

### Warnings ERESOLVE — inoffensifs
- Conflit peer dep `react-dom@19.0.0-rc` ↔ `react@18.3.1` issu de `jest-expo` (dev only)
- `seed-exercises.mjs` n'utilise pas React → aucun impact

### 16 vulnerabilities
- Issues dans dépendances transitives, hors scope du seeder. Peut être adressé avec `npm audit fix` séparément.

### Actions manuelles Supabase requises (bloquantes)
1. **SQL Editor** → exécuter `scripts/migrations/001-exercises-schema.sql`
2. **Storage** → créer bucket `exercise-gifs` (public, limite 5MB par fichier)
3. **`.env.local`** → vérifier `SUPABASE_SERVICE_ROLE_KEY=eyJ...` (format JWT valide)

### Lancer le seed
```bash
node seed-exercises.mjs
```
~5–15 min · ~1300 exercices · idempotent (safe à relancer)

---

## Résultat final — 20260301-1900

### Pipeline complet ✅

| Étape | Résultat |
|---|---|
| Source | `free-exercise-db` GitHub (873 exercices, JPEG, sans API key) |
| Storage | 873 fichiers `.jpg` dans bucket `exercise-gifs` |
| Table `exercises` | 873 lignes upsertées |
| Erreurs | 0 (fix NOT NULL : fallback `'body only'` / `'other'`) |

### Correctifs appliqués pendant l'exécution
1. **Source API** : pivot `exercisedb.dev` (400) → `free-exercise-db` GitHub
2. **NOT NULL constraint** : `equipment ?? 'body only'`, `category ?? 'other'`, `primaryMuscles[0] ?? 'other'`
3. **Idempotence** : 2e run → 873 ⏭ skippés proprement, metadata mis à jour

### Statut final
✅ **DONE** — Infrastructure exercices opérationnelle
