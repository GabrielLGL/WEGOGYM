<!-- v1.0 — 2026-03-01 -->
# Rapport — Exercise Animations Setup — Groupe A — 20260301-1435

## Objectif

Créer le fichier `.env.local` à la racine du repo avec les clés nécessaires pour
lancer `scripts/build-exercise-animations.mjs`. Créer un template avec des
placeholders clairs pour que l'utilisateur remplisse ses vraies clés.

## Fichiers concernés

- `.env.local` (racine du repo — gitignored)

## Contexte technique

Le script `scripts/build-exercise-animations.mjs` lit `.env.local` automatiquement
au démarrage (parsing manuel dans le script). Il a besoin de 3 variables :

```
EXERCISEDB_API_KEY     # Clé RapidAPI pour l'API ExerciseDB
SUPABASE_URL           # URL du projet Supabase (déjà connu)
SUPABASE_SERVICE_ROLE_KEY  # Clé service_role Supabase (PAS anon)
```

Valeurs connues :
- `SUPABASE_URL` = `https://tcuchypwztvghiywhobo.supabase.co` (hardcodé comme fallback dans le script)
- Les deux autres clés sont à renseigner par l'utilisateur

Contrainte sécurité (CLAUDE.md) : jamais de vraies clés dans le code.
`.env.local` est déjà couvert par `.gitignore` (règle `.env*.local`).

## Étapes

1. Vérifier que `.env.local` n'existe pas déjà à la racine
2. Créer `.env.local` avec le template ci-dessous :

```bash
# Exercise Animations Build Script
# Voir scripts/README-animations.md pour les instructions de setup

# RapidAPI — ExerciseDB
# https://rapidapi.com → chercher "ExerciseDB" → API Key
EXERCISEDB_API_KEY=REMPLACER_PAR_CLE_RAPIDAPI

# Supabase
# Dashboard → Settings → API → service_role (PAS anon)
SUPABASE_URL=https://tcuchypwztvghiywhobo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=REMPLACER_PAR_SERVICE_ROLE_KEY
```

3. Confirmer à l'utilisateur :
   - Le fichier est créé
   - Rappeler les 2 prérequis manuels restants (Supabase bucket + RapidAPI)
   - Donner les URLs directes pour y aller

## Contraintes

- Ne pas mettre de vraies clés dans le fichier
- Ne pas modifier `.gitignore` (déjà couvert)
- Ne pas modifier aucun fichier source de l'app

## Critères de validation

- `.env.local` existe à la racine
- `git check-ignore -v .env.local` retourne une règle → fichier bien ignoré
- Contenu lisible, placeholders clairs

## Dépendances

Aucune dépendance sur d'autres groupes.

## Statut

✅ Résolu — 20260301-1435

## Résolution
Rapport do : docs/bmad/do/20260301-1435-chore-env-local-animations.md
